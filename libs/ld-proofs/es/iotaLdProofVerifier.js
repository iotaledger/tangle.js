import { IotaAnchoringChannel, AnchoringChannelErrorNames, SeedHelper } from "@tangle-js/anchors";
import LdProofError from "./errors/ldProofError";
import LdProofErrorNames from "./errors/ldProofErrorNames";
import JsonHelper from "./helpers/jsonHelper";
import ValidationHelper from "./helpers/validationHelper";
import { IotaVerifier } from "./iotaVerifier";
/**
 *  Linked Data Proof Verifier
 *
 *  In the future it will also need to verify
 *
 */
export class IotaLdProofVerifier {
    /**
     * Verifies a JSON(-LD) document
     *
     * @param doc The JSON(-LD) document
     * @param options The verification options
     * @returns true or false with the verification result
     */
    static async verifyJson(doc, options) {
        let document;
        try {
            document = JsonHelper.getAnchoredDocument(doc);
        }
        catch (error) {
            if (error.name === LdProofErrorNames.JSON_DOC_NOT_SIGNED) {
                return false;
            }
            throw error;
        }
        return this.doVerifyDoc(document, undefined, options);
    }
    /**
     * Verifies a chain of JSON(-LD) documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param options The verification options
     * @returns The global verification result
     */
    static async verifyJsonChain(docs, options) {
        return this.doVerifyChain(docs, options);
    }
    /**
     * Verifies a list of JSON(-LD) documents using the proof passed as parameter
     * The individual proofs of the events shall be found on the Channel specified
     *
     * @param docs The documents
     * @param proof The proof that points to the Channel used for verification
     * @param options The verification options
     * @returns The global result of the verification
     */
    static async verifyJsonChainSingleProof(docs, proof, options) {
        return this.doVerifyChainSingleProof(docs, proof, options);
    }
    /**
     * Verifies a chain of JSON(LD) documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param options the verification options
     * @returns The global verification result
     */
    static async doVerifyChain(docs, options) {
        const documents = [];
        // The anchored documents are obtained
        for (const document of docs) {
            let doc;
            try {
                doc = JsonHelper.getAnchoredDocument(document);
            }
            catch (error) {
                if (error.name === LdProofErrorNames.JSON_DOC_NOT_SIGNED) {
                    return false;
                }
                throw error;
            }
            documents.push(doc);
        }
        const node = options?.node;
        // The Channel will be used to verify the proofs
        const channelID = documents[0].proof.proofValue.channelID;
        let channel;
        // If channel cannot be bound the proof will fail
        try {
            channel = await IotaAnchoringChannel.fromID(channelID, { node }).bind(SeedHelper.generateSeed());
        }
        catch (error) {
            if (error.name === AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR) {
                return false;
            }
            throw error;
        }
        let index = 0;
        const verificationOptions = {
            ...options
        };
        for (const document of documents) {
            const proofValue = document.proof.proofValue;
            // If the channel is not the expected the verification fails
            if (proofValue.channelID !== channelID) {
                return false;
            }
            // The first needs to properly position on the channel
            if (index === 0) {
                verificationOptions.strict = false;
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
            }
            else if (options && options.strict === false) {
                verificationOptions.strict = false;
            }
            else {
                verificationOptions.strict = true;
            }
            const verificationResult = await this.doVerifyChainedDoc(document, channel, verificationOptions);
            if (!verificationResult.result) {
                return false;
            }
            index++;
        }
        return true;
    }
    static async doVerifyChainSingleProof(docs, proof, options) {
        const proofDetails = proof.proofValue;
        const documents = [];
        for (const document of docs) {
            const doc = JsonHelper.getDocument(document);
            documents.push(doc);
        }
        let isStrict = true;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
        if (options?.strict === false) {
            isStrict = false;
        }
        const channelID = proofDetails.channelID;
        let channel;
        try {
            channel = await IotaAnchoringChannel.fromID(channelID, options).bind(SeedHelper.generateSeed());
        }
        catch (error) {
            if (error.name === AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR) {
                return false;
            }
            throw error;
        }
        // Clone it to use it locally
        const docProof = JSON.parse(JSON.stringify(proof));
        const doc = documents[0];
        doc.proof = docProof;
        // First document is verified as single document
        const verificationResult = await this.doVerifyDoc(doc, channel, options);
        // Restore the original document
        delete doc.proof;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
        if (verificationResult === false) {
            return false;
        }
        // In strict mode we should test the anchorageID but unfortunately that is a IOTA Streams limitation
        // let currentAnchorageID = verificationResult.fetchResult.msgID;
        // Verification of the rest of documents
        for (let index = 1; index < documents.length; index++) {
            const aDoc = documents[index];
            let fetchResult = await channel.fetchNext();
            let verified = false;
            while (!verified && fetchResult) {
                const linkedDataSignature = JSON.parse(fetchResult.message.toString());
                // now assign the Linked Data Signature as proof
                aDoc.proof = linkedDataSignature;
                verified = await IotaVerifier.verifyJson(aDoc, { node: options?.node });
                if (!verified) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
                    if (isStrict === false) {
                        fetchResult = await channel.fetchNext();
                    }
                    else {
                        return false;
                    }
                }
            }
            if (!verified || !fetchResult) {
                return false;
            }
            delete aDoc.proof;
        }
        return true;
    }
    static async doVerifyDoc(document, channel, options) {
        if (options?.node && !ValidationHelper.url(options.node)) {
            throw new LdProofError(LdProofErrorNames.INVALID_NODE, "The node has to be a URL");
        }
        const proofDetails = document.proof.proofValue;
        let fetchResult;
        let targetChannel = channel;
        try {
            if (!channel) {
                targetChannel = await IotaAnchoringChannel.fromID(proofDetails.channelID, options).bind(SeedHelper.generateSeed());
            }
            fetchResult = await targetChannel.fetch(proofDetails.anchorageID, proofDetails.msgID);
        }
        catch (error) {
            if (error.name === AnchoringChannelErrorNames.MSG_NOT_FOUND ||
                error.name === AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND ||
                error.name === AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR) {
                return false;
            }
            // If it is not the controlled error the error is thrown
            throw error;
        }
        const linkedDataSignature = JSON.parse(fetchResult.message.toString());
        // now assign the Linked Data Signature as proof
        document.proof = linkedDataSignature;
        const result = await IotaVerifier.verifyJson(document, { node: options?.node });
        return result;
    }
    static async doVerifyChainedDoc(document, channel, options) {
        if (options?.node && !ValidationHelper.url(options.node)) {
            throw new LdProofError(LdProofErrorNames.INVALID_NODE, "The node has to be a URL");
        }
        const linkedDataProof = document.proof;
        const proofDetails = document.proof.proofValue;
        let fetchResult;
        const targetMsgID = proofDetails.msgID;
        try {
            // In strict mode we just fetch the next message
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
            if (!options || options.strict === undefined || options.strict === true) {
                fetchResult = await channel.fetchNext();
            }
            else {
                fetchResult = await channel.fetchNext();
                while (fetchResult && fetchResult.msgID !== targetMsgID) {
                    fetchResult = await channel.fetchNext();
                }
            }
        }
        catch (error) {
            if (error.name === AnchoringChannelErrorNames.MSG_NOT_FOUND) {
                return { result: false };
            }
            throw error;
        }
        // If this is not the message expected the verification has failed
        if (!fetchResult || fetchResult.msgID !== targetMsgID) {
            return { result: false };
        }
        const linkedDataSignature = JSON.parse(fetchResult.message.toString());
        // now assign the Linked Data Signature as proof
        document.proof = linkedDataSignature;
        const result = await IotaVerifier.verifyJson(document, { node: options?.node });
        // Restore the original document
        document.proof = linkedDataProof;
        return { result, fetchResult };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZWZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhTGRQcm9vZlZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSwwQkFBMEIsRUFBRSxVQUFVLEVBQUUsTUFDOUQsb0JBQW9CLENBQUM7QUFFOUIsT0FBTyxZQUFZLE1BQU0sdUJBQXVCLENBQUM7QUFDakQsT0FBTyxpQkFBaUIsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLFVBQVUsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QyxPQUFPLGdCQUFnQixNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQU85Qzs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxtQkFBbUI7SUFDNUI7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBbUMsRUFDOUQsT0FBcUM7UUFDckMsSUFBSSxRQUErQixDQUFDO1FBRXBDLElBQUk7WUFDQSxRQUFRLEdBQUcsVUFBVSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2xEO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssaUJBQWlCLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ3RELE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1lBRUQsTUFBTSxLQUFLLENBQUM7U0FDZjtRQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUF3QyxFQUN4RSxPQUFxQztRQUNyQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lB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