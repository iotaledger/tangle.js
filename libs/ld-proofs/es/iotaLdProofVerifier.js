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
     *
     * @returns true or false with the verification result
     *
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
     *
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
     *
     *
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
     *
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZWZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhTGRQcm9vZlZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSwwQkFBMEIsRUFBRSxVQUFVLEVBQUUsTUFDOUQsb0JBQW9CLENBQUM7QUFFOUIsT0FBTyxZQUFZLE1BQU0sdUJBQXVCLENBQUM7QUFDakQsT0FBTyxpQkFBaUIsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLFVBQVUsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QyxPQUFPLGdCQUFnQixNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQU85Qzs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxtQkFBbUI7SUFDNUI7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFtQyxFQUM5RCxPQUFxQztRQUNyQyxJQUFJLFFBQStCLENBQUM7UUFFcEMsSUFBSTtZQUNBLFFBQVEsR0FBRyxVQUFVLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDbEQ7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDdEQsT0FBTyxLQUFLLENBQUM7YUFDaEI7WUFFRCxNQUFNLEtBQUssQ0FBQztTQUNmO1FBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUF3QyxFQUN4RSxPQUFxQztRQUNyQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFD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