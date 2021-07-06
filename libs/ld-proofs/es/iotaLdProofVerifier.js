"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IotaLdProofVerifier = void 0;
const anchors_1 = require("@tangle.js/anchors");
const ldProofError_1 = __importDefault(require("./errors/ldProofError"));
const ldProofErrorNames_1 = __importDefault(require("./errors/ldProofErrorNames"));
const jsonHelper_1 = __importDefault(require("./helpers/jsonHelper"));
const validationHelper_1 = __importDefault(require("./helpers/validationHelper"));
const iotaVerifier_1 = require("./iotaVerifier");
/**
 *  Linked Data Proof Verifier
 *
 *  In the future it will also need to verify
 *
 */
class IotaLdProofVerifier {
    /**
     * Verifies a JSON document
     *
     * @param doc The JSON document
     * @param options The verification options
     *
     * @returns true or false with the verification result
     *
     */
    static verifyJson(doc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let document;
            try {
                document = jsonHelper_1.default.getAnchoredDocument(doc);
            }
            catch (error) {
                if (error.name === ldProofErrorNames_1.default.JSON_DOC_NOT_SIGNED) {
                    return false;
                }
                throw error;
            }
            return this.doVerifyDoc(document, false, undefined, options);
        });
    }
    /**
     * Verifies a JSON-LD document
     *
     * @param doc The JSON-LD document
     * @param options The verification options
     *
     * @returns true or false with the verification result
     *
     */
    static verifyJsonLd(doc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let document;
            try {
                document = jsonHelper_1.default.getAnchoredJsonLdDocument(doc);
            }
            catch (error) {
                if (error.name === ldProofErrorNames_1.default.JSON_DOC_NOT_SIGNED) {
                    return false;
                }
                throw error;
            }
            return this.doVerifyDoc(document, true, undefined, options);
        });
    }
    /**
     * Verifies a chain of JSON documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param options The verification options
     *
     * @returns The global verification result
     */
    static verifyJsonChain(docs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doVerifyChain(docs, false, options);
        });
    }
    /**
     * Verifies a chain of JSON-LD documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param options The verification options
     *
     * @returns The global verification result
     */
    static verifyJsonLdChain(docs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doVerifyChain(docs, true, options);
        });
    }
    /**
     * Verifies a list of JSON documents using the proof passed as parameter
     * The individual proofs of the events shall be found on the Channel specified
     *
     * @param docs The documents
     * @param proof The proof that points to the Channel used for verification
     * @param options The verification options
     *
     *
     * @returns The global result of the verification
     */
    static verifyJsonChainSingleProof(docs, proof, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doVerifyChainSingleProof(docs, proof, false, options);
        });
    }
    /**
     * Verifies a list of JSON-LD documents using the proof passed as parameter
     *
     * @param docs The documents
     * @param proof The proof that points to the Channel used for verification
     * @param options The verification options
     *
     * @returns The global result of the verification
     */
    static verifyJsonLdChainSingleProof(docs, proof, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doVerifyChainSingleProof(docs, proof, true, options);
        });
    }
    /**
     * Verifies a chain of JSON(LD) documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param jsonLd true if the documents must be treated as JSON-LD documents
     * @param options the verification options
     *
     * @returns The global verification result
     */
    static doVerifyChain(docs, jsonLd, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const documents = [];
            // The anchored documents are obtained
            for (const document of docs) {
                let doc;
                try {
                    if (jsonLd) {
                        doc = jsonHelper_1.default.getAnchoredJsonLdDocument(document);
                    }
                    else {
                        doc = jsonHelper_1.default.getAnchoredDocument(document);
                    }
                }
                catch (error) {
                    if (error.name === ldProofErrorNames_1.default.JSON_DOC_NOT_SIGNED) {
                        return false;
                    }
                    throw error;
                }
                documents.push(doc);
            }
            const node = options === null || options === void 0 ? void 0 : options.node;
            // The Channel will be used to verify the proofs
            const channelID = documents[0].proof.proofValue.channelID;
            let channel;
            // If channel cannot be bound the proof will fail
            try {
                channel = yield anchors_1.IotaAnchoringChannel.create(undefined, node).bind(channelID);
            }
            catch (error) {
                if (error.name === anchors_1.AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR) {
                    return false;
                }
                throw error;
            }
            let index = 0;
            const verificationOptions = Object.assign({}, options);
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
                const verificationResult = yield this.doVerifyChainedDoc(document, jsonLd, channel, verificationOptions);
                if (!verificationResult.result) {
                    return false;
                }
                index++;
            }
            return true;
        });
    }
    static doVerifyChainSingleProof(docs, proof, jsonLd, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const proofDetails = proof.proofValue;
            const documents = [];
            for (const document of docs) {
                let doc;
                if (jsonLd) {
                    doc = jsonHelper_1.default.getDocument(document);
                }
                else {
                    doc = jsonHelper_1.default.getJsonLdDocument(document);
                }
                documents.push(doc);
            }
            let isStrict = true;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
            if ((options === null || options === void 0 ? void 0 : options.strict) === false) {
                isStrict = false;
            }
            const channelID = proofDetails.channelID;
            let channel;
            try {
                channel = yield anchors_1.IotaAnchoringChannel.create(undefined, options === null || options === void 0 ? void 0 : options.node).bind(channelID);
            }
            catch (error) {
                if (error.name === anchors_1.AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR) {
                    return false;
                }
                throw error;
            }
            // Clone it to use it locally
            const docProof = JSON.parse(JSON.stringify(proof));
            const doc = documents[0];
            doc.proof = docProof;
            // First document is verified as single document
            const verificationResult = yield this.doVerifyDoc(doc, jsonLd, channel, options);
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
                let fetchResult = yield channel.fetchNext();
                let verified = false;
                while (!verified && fetchResult) {
                    const linkedDataSignature = JSON.parse(fetchResult.message.toString());
                    // now assign the Linked Data Signature as proof
                    aDoc.proof = linkedDataSignature;
                    if (jsonLd) {
                        verified = yield iotaVerifier_1.IotaVerifier.verifyJsonLd(aDoc, { node: options === null || options === void 0 ? void 0 : options.node });
                    }
                    else {
                        verified = yield iotaVerifier_1.IotaVerifier.verifyJson(aDoc, { node: options === null || options === void 0 ? void 0 : options.node });
                    }
                    if (!verified) {
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
                        if (isStrict === false) {
                            fetchResult = yield channel.fetchNext();
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
        });
    }
    static doVerifyDoc(document, jsonLd, channel, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((options === null || options === void 0 ? void 0 : options.node) && !validationHelper_1.default.url(options.node)) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_NODE, "The node has to be a URL");
            }
            const proofDetails = document.proof.proofValue;
            let fetchResult;
            let targetChannel = channel;
            try {
                if (!channel) {
                    targetChannel = yield anchors_1.IotaAnchoringChannel.create(undefined, options === null || options === void 0 ? void 0 : options.node).bind(proofDetails.channelID);
                }
                fetchResult = yield targetChannel.fetch(proofDetails.anchorageID, proofDetails.msgID);
            }
            catch (error) {
                if (error.name === anchors_1.AnchoringChannelErrorNames.MSG_NOT_FOUND ||
                    error.name === anchors_1.AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND ||
                    error.name === anchors_1.AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR) {
                    return false;
                }
                // If it is not the controlled error the error is thrown
                throw error;
            }
            const linkedDataSignature = JSON.parse(fetchResult.message.toString());
            // now assign the Linked Data Signature as proof
            document.proof = linkedDataSignature;
            let result;
            if (jsonLd) {
                result = yield iotaVerifier_1.IotaVerifier.verifyJsonLd(document, { node: options === null || options === void 0 ? void 0 : options.node });
            }
            else {
                result = yield iotaVerifier_1.IotaVerifier.verifyJson(document, { node: options === null || options === void 0 ? void 0 : options.node });
            }
            return result;
        });
    }
    static doVerifyChainedDoc(document, jsonLd, channel, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((options === null || options === void 0 ? void 0 : options.node) && !validationHelper_1.default.url(options.node)) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_NODE, "The node has to be a URL");
            }
            const linkedDataProof = document.proof;
            const proofDetails = document.proof.proofValue;
            let fetchResult;
            const targetMsgID = proofDetails.msgID;
            try {
                // In strict mode we just fetch the next message
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
                if (!options || options.strict === undefined || options.strict === true) {
                    fetchResult = yield channel.fetchNext();
                }
                else {
                    fetchResult = yield channel.fetchNext();
                    while (fetchResult && fetchResult.msgID !== targetMsgID) {
                        fetchResult = yield channel.fetchNext();
                    }
                }
            }
            catch (error) {
                if (error.name === anchors_1.AnchoringChannelErrorNames.MSG_NOT_FOUND) {
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
            let result;
            if (jsonLd) {
                result = yield iotaVerifier_1.IotaVerifier.verifyJsonLd(document, { node: options === null || options === void 0 ? void 0 : options.node });
            }
            else {
                result = yield iotaVerifier_1.IotaVerifier.verifyJson(document, { node: options === null || options === void 0 ? void 0 : options.node });
            }
            // Restore the original document
            document.proof = linkedDataProof;
            return { result, fetchResult };
        });
    }
}
exports.IotaLdProofVerifier = IotaLdProofVerifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZWZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhTGRQcm9vZlZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGdEQUM4QjtBQUM5Qix5RUFBaUQ7QUFDakQsbUZBQTJEO0FBQzNELHNFQUE4QztBQUM5QyxrRkFBMEQ7QUFDMUQsaURBQThDO0FBTzlDOzs7OztHQUtHO0FBQ0gsTUFBYSxtQkFBbUI7SUFDNUI7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sVUFBVSxDQUFDLEdBQW1DLEVBQzlELE9BQXFDOztZQUNyQyxJQUFJLFFBQStCLENBQUM7WUFFcEMsSUFBSTtnQkFDQSxRQUFRLEdBQUcsb0JBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNsRDtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNaLElBQUksS0FBSyxDQUFDLElBQUksS0FBSywyQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRTtvQkFDdEQsT0FBTyxLQUFLLENBQUM7aUJBQ2hCO2dCQUVELE1BQU0sS0FBSyxDQUFDO2FBQ2Y7WUFFRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakUsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sWUFBWSxDQUFDLEdBQW1DLEVBQ2hFLE9BQXFDOztZQUNyQyxJQUFJLFFBQStCLENBQUM7WUFFcEMsSUFBSTtnQkFDQSxRQUFRLEdBQUcsb0JBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN4RDtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNaLElBQUksS0FBSyxDQUFDLElBQUksS0FBSywyQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRTtvQkFDdEQsT0FBTyxLQUFLLENBQUM7aUJBQ2hCO2dCQUVELE1BQU0sS0FBSyxDQUFDO2FBQ2Y7WUFFRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEUsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBTyxlQUFlLENBQUMsSUFBd0MsRUFDeEUsT0FBcUM7O1lBQ3JDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELENBQUM7S0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQU8saUJBQWlCLENBQUMsSUFBd0MsRUFDMUUsT0FBcUM7O1lBQ3JDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25ELENBQUM7S0FBQTtJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSSxNQUFNLENBQU8sMEJBQTBCLENBQUMsSUFBZ0MsRUFDM0UsS0FBMkIsRUFDM0IsT0FBcUM7O1lBQ3JDLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RFLENBQUM7S0FBQTtJQUVEOzs7Ozs7OztPQVFHO0lBQ0ksTUFBTSxDQUFPLDRCQUE0QixDQUFDLElBQWdDLEVBQzdFLEtBQTJCLEVBQzNCLE9BQXFDOztZQUNyQyxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRSxDQUFDO0tBQUE7SUFFRDs7Ozs7Ozs7T0FRRztJQUNLLE1BQU0sQ0FBTyxhQUFhLENBQUMsSUFBd0MsRUFDdkUsTUFBZSxFQUNmLE9BQXFDOztZQUVyQyxNQUFNLFNBQVMsR0FBNEIsRUFBRSxDQUFDO1lBRTlDLHNDQUFzQztZQUN0QyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksRUFBRTtnQkFDekIsSUFBSSxHQUFHLENBQUM7Z0JBQ1IsSUFBSTtvQkFDQSxJQUFJLE1BQU0sRUFBRTt3QkFDUixHQUFHLEdBQUcsb0JBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztxQkFDeEQ7eUJBQU07d0JBQ0gsR0FBRyxHQUFHLG9CQUFVLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQ2xEO2lCQUNKO2dCQUFDLE9BQU8sS0FBSyxFQUFFO29CQUNaLElBQUksS0FBSyxDQUFDLElBQUksS0FBSywyQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRTt3QkFDdEQsT0FBTyxLQUFLLENBQUM7cUJBQ2hCO29CQUNELE1BQU0sS0FBSyxDQUFDO2lCQUNmO2dCQUVELFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdkI7WUFFRCxNQUFNLElBQUksR0FBRyxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsSUFBSSxDQUFDO1lBRTNCLGdEQUFnRDtZQUNoRCxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUM7WUFDMUQsSUFBSSxPQUE2QixDQUFDO1lBRWxDLGlEQUFpRDtZQUNqRCxJQUFJO2dCQUNBLE9BQU8sR0FBRyxNQUFNLDhCQUFvQixDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ2hGO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ1osSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLG9DQUEwQixDQUFDLHFCQUFxQixFQUFFO29CQUNqRSxPQUFPLEtBQUssQ0FBQztpQkFDaEI7Z0JBRUQsTUFBTSxLQUFLLENBQUM7YUFDZjtZQUVELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNkLE1BQU0sbUJBQW1CLHFCQUNsQixPQUFPLENBQ2IsQ0FBQztZQUVGLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO2dCQUM5QixNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztnQkFFN0MsNERBQTREO2dCQUM1RCxJQUFJLFVBQVUsQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFO29CQUNwQyxPQUFPLEtBQUssQ0FBQztpQkFDaEI7Z0JBRUQsc0RBQXNEO2dCQUN0RCxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7b0JBQ2IsbUJBQW1CLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztvQkFDbkMscUZBQXFGO2lCQUN4RjtxQkFBTSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtvQkFDNUMsbUJBQW1CLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztpQkFDdEM7cUJBQU07b0JBQ0gsbUJBQW1CLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztpQkFDckM7Z0JBRUQsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO2dCQUV6RyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFO29CQUM1QixPQUFPLEtBQUssQ0FBQztpQkFDaEI7Z0JBRUQsS0FBSyxFQUFFLENBQUM7YUFDWDtZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FBQTtJQUVPLE1BQU0sQ0FBTyx3QkFBd0IsQ0FBQyxJQUFnQyxFQUMxRSxLQUEyQixFQUMzQixNQUFlLEVBQ2YsT0FBcUM7O1lBQ3JDLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFFdEMsTUFBTSxTQUFTLEdBQW9CLEVBQUUsQ0FBQztZQUV0QyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksRUFBRTtnQkFDekIsSUFBSSxHQUFHLENBQUM7Z0JBRVIsSUFBSSxNQUFNLEVBQUU7b0JBQ1IsR0FBRyxHQUFHLG9CQUFVLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUMxQztxQkFBTTtvQkFDSCxHQUFHLEdBQUcsb0JBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDaEQ7Z0JBRUQsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN2QjtZQUVELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztZQUNwQixxRkFBcUY7WUFDckYsSUFBSSxDQUFBLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxNQUFNLE1BQUssS0FBSyxFQUFFO2dCQUMzQixRQUFRLEdBQUcsS0FBSyxDQUFDO2FBQ3BCO1lBRUQsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQztZQUN6QyxJQUFJLE9BQTZCLENBQUM7WUFDbEMsSUFBSTtnQkFDQSxPQUFPLEdBQUcsTUFBTSw4QkFBb0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDekY7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDWixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssb0NBQTBCLENBQUMscUJBQXFCLEVBQUU7b0JBQ2pFLE9BQU8sS0FBSyxDQUFDO2lCQUNoQjtnQkFFRCxNQUFNLEtBQUssQ0FBQzthQUNmO1lBRUQsNkJBQTZCO1lBQzdCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQXFDLENBQUM7WUFDN0QsR0FBRyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7WUFDckIsZ0RBQWdEO1lBQ2hELE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUM3QyxHQUFHLEVBQ0gsTUFBTSxFQUNOLE9BQU8sRUFDUCxPQUFPLENBQ1YsQ0FBQztZQUVGLGdDQUFnQztZQUNoQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFFakIscUZBQXFGO1lBQ3JGLElBQUksa0JBQWtCLEtBQUssS0FBSyxFQUFFO2dCQUM5QixPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUVELG9HQUFvRztZQUNwRyxpRUFBaUU7WUFFakUsd0NBQXdDO1lBQ3hDLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUNuRCxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsS0FBSyxDQUF3QixDQUFDO2dCQUVyRCxJQUFJLFdBQVcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFFNUMsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUNyQixPQUFPLENBQUMsUUFBUSxJQUFJLFdBQVcsRUFBRTtvQkFDN0IsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztvQkFFdkUsZ0RBQWdEO29CQUNoRCxJQUFJLENBQUMsS0FBSyxHQUFHLG1CQUFtQixDQUFDO29CQUVqQyxJQUFJLE1BQU0sRUFBRTt3QkFDUixRQUFRLEdBQUcsTUFBTSwyQkFBWSxDQUFDLFlBQVksQ0FDdEMsSUFBSSxFQUNKLEVBQUUsSUFBSSxFQUFFLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxJQUFJLEVBQUUsQ0FDMUIsQ0FBQztxQkFDTDt5QkFBTTt3QkFDSCxRQUFRLEdBQUcsTUFBTSwyQkFBWSxDQUFDLFVBQVUsQ0FDcEMsSUFBSSxFQUNKLEVBQUUsSUFBSSxFQUFFLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxJQUFJLEVBQUUsQ0FDMUIsQ0FBQztxQkFDTDtvQkFFRCxJQUFJLENBQUMsUUFBUSxFQUFFO3dCQUNYLHFGQUFxRjt3QkFDckYsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFOzRCQUNwQixXQUFXLEdBQUcsTUFBTSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7eUJBQzNDOzZCQUFNOzRCQUNILE9BQU8sS0FBSyxDQUFDO3lCQUNoQjtxQkFDSjtpQkFDSjtnQkFFRCxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUMzQixPQUFPLEtBQUssQ0FBQztpQkFDaEI7Z0JBRUQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO2FBQ3JCO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQUFBO0lBRU8sTUFBTSxDQUFPLFdBQVcsQ0FBQyxRQUErQixFQUM1RCxNQUFlLEVBQ2YsT0FBOEIsRUFDOUIsT0FBcUM7O1lBQ3JDLElBQUksQ0FBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsSUFBSSxLQUFJLENBQUMsMEJBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDdEQsTUFBTSxJQUFJLHNCQUFZLENBQUMsMkJBQWlCLENBQUMsWUFBWSxFQUNqRCwwQkFBMEIsQ0FBQyxDQUFDO2FBQ25DO1lBRUQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFFL0MsSUFBSSxXQUFXLENBQUM7WUFFaEIsSUFBSSxhQUFhLEdBQXlCLE9BQU8sQ0FBQztZQUVsRCxJQUFJO2dCQUNBLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ1YsYUFBYSxHQUFHLE1BQU0sOEJBQW9CLENBQUMsTUFBTSxDQUM3QyxTQUFTLEVBQUUsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQzlEO2dCQUNELFdBQVcsR0FBRyxNQUFNLGFBQWEsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDekY7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDWixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssb0NBQTBCLENBQUMsYUFBYTtvQkFDdkQsS0FBSyxDQUFDLElBQUksS0FBSyxvQ0FBMEIsQ0FBQyxtQkFBbUI7b0JBQzdELEtBQUssQ0FBQyxJQUFJLEtBQUssb0NBQTBCLENBQUMscUJBQXFCLEVBQUU7b0JBQ2pFLE9BQU8sS0FBSyxDQUFDO2lCQUNoQjtnQkFFRCx3REFBd0Q7Z0JBQ3hELE1BQU0sS0FBSyxDQUFDO2FBQ2Y7WUFFRCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBRXZFLGdEQUFnRDtZQUNoRCxRQUFRLENBQUMsS0FBSyxHQUFHLG1CQUFtQixDQUFDO1lBRXJDLElBQUksTUFBZSxDQUFDO1lBRXBCLElBQUksTUFBTSxFQUFFO2dCQUNSLE1BQU0sR0FBRyxNQUFNLDJCQUFZLENBQUMsWUFBWSxDQUNwQyxRQUEwQyxFQUMxQyxFQUFFLElBQUksRUFBRSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsSUFBSSxFQUFFLENBQzFCLENBQUM7YUFDTDtpQkFBTTtnQkFDSCxNQUFNLEdBQUcsTUFBTSwyQkFBWSxDQUFDLFVBQVUsQ0FDbEMsUUFBMEMsRUFDMUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLElBQUksRUFBRSxDQUMxQixDQUFDO2FBQ0w7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO0tBQUE7SUFFTyxNQUFNLENBQU8sa0JBQWtCLENBQUMsUUFBK0IsRUFDbkUsTUFBZSxFQUNmLE9BQTZCLEVBQzdCLE9BQXFDOztZQUlyQyxJQUFJLENBQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLElBQUksS0FBSSxDQUFDLDBCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RELE1BQU0sSUFBSSxzQkFBWSxDQUFDLDJCQUFpQixDQUFDLFlBQVksRUFDakQsMEJBQTBCLENBQUMsQ0FBQzthQUNuQztZQUVELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDdkMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFFL0MsSUFBSSxXQUF5QixDQUFDO1lBRTlCLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFFdkMsSUFBSTtnQkFDQSxnREFBZ0Q7Z0JBQ2hELHFGQUFxRjtnQkFDckYsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLFNBQVMsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLElBQUksRUFBRTtvQkFDckUsV0FBVyxHQUFHLE1BQU0sT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO2lCQUMzQztxQkFBTTtvQkFDSCxXQUFXLEdBQUcsTUFBTSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ3hDLE9BQU8sV0FBVyxJQUFJLFdBQVcsQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFO3dCQUNyRCxXQUFXLEdBQUcsTUFBTSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7cUJBQzNDO2lCQUNKO2FBQ0o7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDWixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssb0NBQTBCLENBQUMsYUFBYSxFQUFFO29CQUN6RCxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO2lCQUM1QjtnQkFFRCxNQUFNLEtBQUssQ0FBQzthQUNmO1lBRUQsa0VBQWtFO1lBQ2xFLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLEtBQUssS0FBSyxXQUFXLEVBQUU7Z0JBQ25ELE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7YUFDNUI7WUFFRCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBRXZFLGdEQUFnRDtZQUNoRCxRQUFRLENBQUMsS0FBSyxHQUFHLG1CQUFtQixDQUFDO1lBRXJDLElBQUksTUFBZSxDQUFDO1lBRXBCLElBQUksTUFBTSxFQUFFO2dCQUNSLE1BQU0sR0FBRyxNQUFNLDJCQUFZLENBQUMsWUFBWSxDQUNwQyxRQUEwQyxFQUMxQyxFQUFFLElBQUksRUFBRSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsSUFBSSxFQUFFLENBQzFCLENBQUM7YUFDTDtpQkFBTTtnQkFDSCxNQUFNLEdBQUcsTUFBTSwyQkFBWSxDQUFDLFVBQVUsQ0FDbEMsUUFBMEMsRUFDMUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLElBQUksRUFBRSxDQUMxQixDQUFDO2FBQ0w7WUFFRCxnQ0FBZ0M7WUFDaEMsUUFBUSxDQUFDLEtBQUssR0FBRyxlQUFlLENBQUM7WUFFakMsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUNuQyxDQUFDO0tBQUE7Q0FDSjtBQXhhRCxrREF3YUMifQ==