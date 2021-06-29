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
const anchoring_channels_1 = require("@tangle.js/anchoring-channels");
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
            const document = jsonHelper_1.default.getAnchoredDocument(doc);
            return (yield this.doVerify(document, false, options)).result;
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
            const document = jsonHelper_1.default.getAnchoredJsonLdDocument(doc);
            return (yield this.doVerify(document, true, options)).result;
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
                if (jsonLd) {
                    doc = jsonHelper_1.default.getAnchoredJsonLdDocument(document);
                }
                else {
                    doc = jsonHelper_1.default.getAnchoredDocument(document);
                }
                documents.push(doc);
            }
            // The Channel will be used to verify the proofs
            const channelID = documents[0].proof.proofValue.channelID;
            const channel = yield anchoring_channels_1.IotaAnchoringChannel.create(options.node).bind(channelID);
            let index = 0;
            const verificationOptions = Object.assign(Object.assign({}, options), { channel });
            for (const document of documents) {
                const proofValue = document.proof.proofValue;
                // If the channel is not the expected the verification fails
                if (proofValue.channelID !== channelID) {
                    return false;
                }
                // The first needs to properly position on the channel
                if (index === 0) {
                    verificationOptions.strict = false;
                }
                else {
                    verificationOptions.strict = options.strict;
                }
                const verificationResult = yield this.doVerify(document, jsonLd, verificationOptions);
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
            let currentAnchorageID = proofDetails.anchorageID;
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
            const channelID = proofDetails.channelID;
            const channel = yield anchoring_channels_1.IotaAnchoringChannel.create(options.node).bind(channelID);
            const verificationOptions = {
                node: options.node,
                channel,
                strict: true
            };
            let index = 0;
            for (const doc of documents) {
                const docProof = JSON.parse(JSON.stringify(proof));
                // The anchorageID has to be updated for this new built proof
                proof.proofValue.anchorageID = currentAnchorageID;
                // The messageID is only relevant for the first one
                if (index++ !== 0) {
                    delete proof.proofValue.msgID;
                    // First verification is not strict as we have to position on the channel
                    verificationOptions.strict = false;
                }
                else {
                    verificationOptions.strict = true;
                }
                doc.proof = docProof;
                const verificationResult = yield this.doVerify(doc, jsonLd, verificationOptions);
                if (!verificationResult.result) {
                    return false;
                }
                currentAnchorageID = verificationResult.fetchResult.msgID;
                delete doc.proof;
            }
            return true;
        });
    }
    static doVerify(document, jsonLd, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validationHelper_1.default.url(options.node)) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_NODE, "The node has to be a URL");
            }
            const linkedDataProof = document.proof;
            const proofDetails = document.proof.proofValue;
            let fetchResult;
            let channel = options.channel;
            if (!channel) {
                channel = yield anchoring_channels_1.IotaAnchoringChannel.create(options.node).bind(proofDetails.channelID);
            }
            try {
                // In strict mode we just receive the message
                if (options.strict) {
                    fetchResult = yield channel.receive(proofDetails.msgID, proofDetails.anchorageID);
                }
                else {
                    // In non strict mode we can jump to the right anchorage
                    fetchResult = yield channel.fetch(proofDetails.anchorageID, proofDetails.msgID);
                }
            }
            catch (error) {
                if (error.name === anchoring_channels_1.AnchoringChannelErrorNames.MSG_NOT_FOUND) {
                    return { result: false };
                }
                throw error;
            }
            const linkedDataSignature = JSON.parse(fetchResult.message);
            // now assign the Linked Data Signature as proof
            document.proof = linkedDataSignature;
            let result;
            if (jsonLd) {
                result = yield iotaVerifier_1.IotaVerifier.verifyJsonLd({
                    document: document,
                    node: options.node
                });
            }
            else {
                result = yield iotaVerifier_1.IotaVerifier.verifyJson({
                    document: document,
                    node: options.node
                });
            }
            // Restore the original document
            document.proof = linkedDataProof;
            return { result, fetchResult };
        });
    }
}
exports.IotaLdProofVerifier = IotaLdProofVerifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZWZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhTGRQcm9vZlZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHNFQUN5QztBQUN6Qyx5RUFBaUQ7QUFDakQsbUZBQTJEO0FBQzNELHNFQUE4QztBQUM5QyxrRkFBMEQ7QUFDMUQsaURBQThDO0FBTzlDOzs7OztHQUtHO0FBQ0gsTUFBYSxtQkFBbUI7SUFDNUI7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sVUFBVSxDQUFDLEdBQW1DLEVBQzlELE9BQW9DOztZQUNwQyxNQUFNLFFBQVEsR0FBRyxvQkFBVSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXJELE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNsRSxDQUFDO0tBQUE7SUFFRDs7Ozs7Ozs7T0FRRztJQUNJLE1BQU0sQ0FBTyxZQUFZLENBQUMsR0FBbUMsRUFDaEUsT0FBb0M7O1lBQ3BDLE1BQU0sUUFBUSxHQUFHLG9CQUFVLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFM0QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ2pFLENBQUM7S0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQU8sZUFBZSxDQUFDLElBQXdDLEVBQ3hFLE9BQW9DOztZQUNwQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRCxDQUFDO0tBQUE7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksTUFBTSxDQUFPLGlCQUFpQixDQUFDLElBQXdDLEVBQzFFLE9BQW9DOztZQUNwQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuRCxDQUFDO0tBQUE7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0ksTUFBTSxDQUFPLDBCQUEwQixDQUFDLElBQXNDLEVBQ2pGLEtBQTJCLEVBQzNCLE9BQW9DOztZQUNwQyxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN0RSxDQUFDO0tBQUE7SUFFRDs7Ozs7Ozs7T0FRRztJQUNJLE1BQU0sQ0FBTyw0QkFBNEIsQ0FBQyxJQUFzQyxFQUNuRixLQUEyQixFQUMzQixPQUFvQzs7WUFDcEMsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckUsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSyxNQUFNLENBQU8sYUFBYSxDQUFDLElBQXdDLEVBQ3ZFLE1BQWUsRUFDZixPQUFvQzs7WUFFcEMsTUFBTSxTQUFTLEdBQTRCLEVBQUUsQ0FBQztZQUU5QyxzQ0FBc0M7WUFDdEMsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLEVBQUU7Z0JBQ3pCLElBQUksR0FBRyxDQUFDO2dCQUNSLElBQUksTUFBTSxFQUFFO29CQUNSLEdBQUcsR0FBRyxvQkFBVSxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUN4RDtxQkFBTTtvQkFDSCxHQUFHLEdBQUcsb0JBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDbEQ7Z0JBRUQsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN2QjtZQUVELGdEQUFnRDtZQUNoRCxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUM7WUFDMUQsTUFBTSxPQUFPLEdBQUcsTUFBTSx5Q0FBb0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVoRixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxNQUFNLG1CQUFtQixtQ0FDbEIsT0FBTyxLQUNWLE9BQU8sR0FDVixDQUFDO1lBRUYsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7Z0JBQzlCLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO2dCQUU3Qyw0REFBNEQ7Z0JBQzVELElBQUksVUFBVSxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUU7b0JBQ3BDLE9BQU8sS0FBSyxDQUFDO2lCQUNoQjtnQkFFRCxzREFBc0Q7Z0JBQ3RELElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtvQkFDYixtQkFBbUIsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2lCQUN0QztxQkFBTTtvQkFDSCxtQkFBbUIsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztpQkFDL0M7Z0JBRUQsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO2dCQUV0RixJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFO29CQUM1QixPQUFPLEtBQUssQ0FBQztpQkFDaEI7Z0JBRUQsS0FBSyxFQUFFLENBQUM7YUFDWDtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FBQTtJQUVPLE1BQU0sQ0FBTyx3QkFBd0IsQ0FBQyxJQUFnQyxFQUMxRSxLQUEyQixFQUMzQixNQUFlLEVBQ2YsT0FBb0M7O1lBQ3BDLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFFdEMsSUFBSSxrQkFBa0IsR0FBRyxZQUFZLENBQUMsV0FBVyxDQUFDO1lBRWxELE1BQU0sU0FBUyxHQUFvQixFQUFFLENBQUM7WUFFdEMsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLEVBQUU7Z0JBQ3pCLElBQUksR0FBRyxDQUFDO2dCQUVSLElBQUksTUFBTSxFQUFFO29CQUNSLEdBQUcsR0FBRyxvQkFBVSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDMUM7cUJBQU07b0JBQ0gsR0FBRyxHQUFHLG9CQUFVLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ2hEO2dCQUVELFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdkI7WUFFRCxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDO1lBQ3pDLE1BQU0sT0FBTyxHQUFHLE1BQU0seUNBQW9CLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFaEYsTUFBTSxtQkFBbUIsR0FBZ0M7Z0JBQ3JELElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtnQkFDbEIsT0FBTztnQkFDUCxNQUFNLEVBQUUsSUFBSTthQUNmLENBQUM7WUFFRixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxLQUFLLE1BQU0sR0FBRyxJQUFJLFNBQVMsRUFBRTtnQkFDekIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ25ELDZEQUE2RDtnQkFDN0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsa0JBQWtCLENBQUM7Z0JBQ2xELG1EQUFtRDtnQkFDbkQsSUFBSSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQ2YsT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztvQkFDOUIseUVBQXlFO29CQUN6RSxtQkFBbUIsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2lCQUN0QztxQkFBTTtvQkFDSCxtQkFBbUIsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2lCQUNyQztnQkFFRCxHQUFHLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFFckIsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBdUMsRUFDbEYsTUFBTSxFQUNOLG1CQUFtQixDQUN0QixDQUFDO2dCQUVGLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7b0JBQzVCLE9BQU8sS0FBSyxDQUFDO2lCQUNoQjtnQkFFRCxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO2dCQUUxRCxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUM7YUFDcEI7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0tBQUE7SUFFTyxNQUFNLENBQU8sUUFBUSxDQUFDLFFBQStCLEVBQ3pELE1BQWUsRUFDZixPQUFvQzs7WUFJcEMsSUFBSSxDQUFDLDBCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3JDLE1BQU0sSUFBSSxzQkFBWSxDQUFDLDJCQUFpQixDQUFDLFlBQVksRUFDakQsMEJBQTBCLENBQUMsQ0FBQzthQUNuQztZQUVELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDdkMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFFL0MsSUFBSSxXQUF5QixDQUFDO1lBRTlCLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7WUFDOUIsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDVixPQUFPLEdBQUcsTUFBTSx5Q0FBb0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDMUY7WUFFRCxJQUFJO2dCQUNBLDZDQUE2QztnQkFDN0MsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO29CQUNoQixXQUFXLEdBQUcsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUNyRjtxQkFBTTtvQkFDSCx3REFBd0Q7b0JBQ3hELFdBQVcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ25GO2FBQ0o7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDWixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssK0NBQTBCLENBQUMsYUFBYSxFQUFFO29CQUN6RCxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO2lCQUM1QjtnQkFFRCxNQUFNLEtBQUssQ0FBQzthQUNmO1lBRUQsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUU1RCxnREFBZ0Q7WUFDaEQsUUFBUSxDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQztZQUVyQyxJQUFJLE1BQWUsQ0FBQztZQUVwQixJQUFJLE1BQU0sRUFBRTtnQkFDUixNQUFNLEdBQUcsTUFBTSwyQkFBWSxDQUFDLFlBQVksQ0FBQztvQkFDckMsUUFBUSxFQUFFLFFBQTBDO29CQUNwRCxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7aUJBQ3JCLENBQUMsQ0FBQzthQUNOO2lCQUFNO2dCQUNILE1BQU0sR0FBRyxNQUFNLDJCQUFZLENBQUMsVUFBVSxDQUFDO29CQUNuQyxRQUFRLEVBQUUsUUFBMEM7b0JBQ3BELElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtpQkFDckIsQ0FBQyxDQUFDO2FBQ047WUFFRCxnQ0FBZ0M7WUFDaEMsUUFBUSxDQUFDLEtBQUssR0FBRyxlQUFlLENBQUM7WUFFakMsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUNuQyxDQUFDO0tBQUE7Q0FDSjtBQXZSRCxrREF1UkMifQ==