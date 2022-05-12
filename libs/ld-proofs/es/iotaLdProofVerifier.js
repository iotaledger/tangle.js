/* eslint-disable jsdoc/require-jsdoc */
import { IotaAnchoringChannel, AnchoringChannelErrorNames, SeedHelper } from "@tangle-js/anchors";
import LdProofError from "./errors/ldProofError";
import LdProofErrorNames from "./errors/ldProofErrorNames";
import JsonHelper from "./helpers/jsonHelper";
import ValidationHelper from "./helpers/validationHelper";
import { IotaVerifier } from "./iotaVerifier";
/**
 * Linked Data Proof Verifier.
 *
 * In the future it will also need to verify.
 *
 */
export class IotaLdProofVerifier {
    /**
     * Verifies a JSON(-LD) document.
     *
     * @param doc The JSON(-LD) document.
     * @param options The verification options.
     * @returns True or false with the verification result.
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
     * Verifies a chain of JSON(-LD) documents ensuring that are anchored to the same channel.
     * And in the order implicit in the list.
     * @param docs The chain of documents to verify.
     * @param options The verification options.
     * @returns The global verification result.
     */
    static async verifyJsonChain(docs, options) {
        return this.doVerifyChain(docs, options);
    }
    /**
     * Verifies a list of JSON(-LD) documents using the proof passed as parameter.
     * The individual proofs of the events shall be found on the Channel specified.
     *
     * @param docs The documents.
     * @param proof The proof that points to the Channel used for verification.
     * @param options The verification options.
     * @returns The global result of the verification.
     */
    static async verifyJsonChainSingleProof(docs, proof, options) {
        return this.doVerifyChainSingleProof(docs, proof, options);
    }
    /**
     * Verifies a chain of JSON(LD) documents ensuring that are anchored to the same channel.
     * And in the order implicit in the list.
     * @param docs The chain of documents to verify.
     * @param options The verification options.
     * @returns The global verification result.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZWZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhTGRQcm9vZlZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdDQUF3QztBQUV4QyxPQUFPLEVBQXFCLG9CQUFvQixFQUFFLDBCQUEwQixFQUFFLFVBQVUsRUFBRSxNQUNqRixvQkFBb0IsQ0FBQztBQUM5QixPQUFPLFlBQVksTUFBTSx1QkFBdUIsQ0FBQztBQUNqRCxPQUFPLGlCQUFpQixNQUFNLDRCQUE0QixDQUFDO0FBQzNELE9BQU8sVUFBVSxNQUFNLHNCQUFzQixDQUFDO0FBQzlDLE9BQU8sZ0JBQWdCLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBTzlDOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFPLG1CQUFtQjtJQUM1Qjs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFtQyxFQUM5RCxPQUFxQztRQUNyQyxJQUFJLFFBQStCLENBQUM7UUFFcEMsSUFBSTtZQUNBLFFBQVEsR0FBRyxVQUFVLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDbEQ7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDdEQsT0FBTyxLQUFLLENBQUM7YUFDaEI7WUFFRCxNQUFNLEtBQUssQ0FBQztTQUNmO1FBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQXdDLEVBQ3hFLE9BQXFDO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsT0FB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