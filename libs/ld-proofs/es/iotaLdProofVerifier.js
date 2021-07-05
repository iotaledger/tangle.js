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
            const document = jsonHelper_1.default.getAnchoredDocument(doc);
            return (yield this.doVerify(document, false, undefined, options)).result;
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
            return (yield this.doVerify(document, true, undefined, options)).result;
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
            const node = options === null || options === void 0 ? void 0 : options.node;
            // The Channel will be used to verify the proofs
            const channelID = documents[0].proof.proofValue.channelID;
            const channel = yield anchors_1.IotaAnchoringChannel.create(undefined, node).bind(channelID);
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
                const verificationResult = yield this.doVerify(document, jsonLd, channel, verificationOptions);
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
            const channel = yield anchors_1.IotaAnchoringChannel.create(undefined, options === null || options === void 0 ? void 0 : options.node).bind(channelID);
            // First the first document has to be verified and as usual strict is false for the first
            const verificationOptions = {
                node: options === null || options === void 0 ? void 0 : options.node,
                strict: false
            };
            // Clone it to use it locally
            const docProof = JSON.parse(JSON.stringify(proof));
            const doc = documents[0];
            doc.proof = docProof;
            const verificationResult = yield this.doVerify(doc, jsonLd, channel, verificationOptions);
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
            if (verificationResult.result === false) {
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
    static doVerify(document, jsonLd, channel, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((options === null || options === void 0 ? void 0 : options.node) && !validationHelper_1.default.url(options.node)) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_NODE, "The node has to be a URL");
            }
            const linkedDataProof = document.proof;
            const proofDetails = document.proof.proofValue;
            let fetchResult;
            if (!channel) {
                channel = yield anchors_1.IotaAnchoringChannel.create(undefined, options === null || options === void 0 ? void 0 : options.node).bind(proofDetails.channelID);
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZWZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhTGRQcm9vZlZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGdEQUM4QjtBQUM5Qix5RUFBaUQ7QUFDakQsbUZBQTJEO0FBQzNELHNFQUE4QztBQUM5QyxrRkFBMEQ7QUFDMUQsaURBQThDO0FBTzlDOzs7OztHQUtHO0FBQ0gsTUFBYSxtQkFBbUI7SUFDNUI7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sVUFBVSxDQUFDLEdBQW1DLEVBQzlELE9BQXFDOztZQUNyQyxNQUFNLFFBQVEsR0FBRyxvQkFBVSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXJELE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDN0UsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sWUFBWSxDQUFDLEdBQW1DLEVBQ2hFLE9BQXFDOztZQUNyQyxNQUFNLFFBQVEsR0FBRyxvQkFBVSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRTNELE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDNUUsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBTyxlQUFlLENBQUMsSUFBd0MsRUFDeEUsT0FBcUM7O1lBQ3JDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELENBQUM7S0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQU8s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