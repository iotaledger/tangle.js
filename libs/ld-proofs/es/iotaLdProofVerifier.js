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
            const channel = yield anchors_1.IotaAnchoringChannel.create(undefined, options === null || options === void 0 ? void 0 : options.node).bind(channelID);
            const verificationOptions = {
                node: options === null || options === void 0 ? void 0 : options.node,
                // As we always are going to need to a fetch strict is false
                // However in the future there should be at the anchoring channel level
                // a function that allows to do a strict fetch next
                strict: false
            };
            let index = 0;
            for (const doc of documents) {
                // Clone it to use it locally
                const docProof = JSON.parse(JSON.stringify(proof));
                // The anchorageID has to be updated for this new built proof
                docProof.proofValue.anchorageID = currentAnchorageID;
                // The messageID is only relevant for the first one
                if (index !== 0) {
                    // The message ID no longer applies
                    delete docProof.proofValue.msgID;
                }
                doc.proof = docProof;
                const verificationResult = yield this.doVerify(doc, jsonLd, channel, verificationOptions);
                if (!verificationResult.result) {
                    return false;
                }
                currentAnchorageID = verificationResult.fetchResult.msgID;
                delete doc.proof;
                index++;
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
            try {
                // In strict mode we just receive the message
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
                if (!options || options.strict === true) {
                    fetchResult = yield channel.receive(proofDetails.msgID, proofDetails.anchorageID);
                }
                else {
                    // In non strict mode we can jump to the right anchorage
                    fetchResult = yield channel.fetch(proofDetails.anchorageID, proofDetails.msgID);
                }
            }
            catch (error) {
                if (error.name === anchors_1.AnchoringChannelErrorNames.MSG_NOT_FOUND) {
                    return { result: false };
                }
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
            // Restore the original document
            document.proof = linkedDataProof;
            return { result, fetchResult };
        });
    }
}
exports.IotaLdProofVerifier = IotaLdProofVerifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZWZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhTGRQcm9vZlZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGdEQUM4QjtBQUM5Qix5RUFBaUQ7QUFDakQsbUZBQTJEO0FBQzNELHNFQUE4QztBQUM5QyxrRkFBMEQ7QUFDMUQsaURBQThDO0FBTzlDOzs7OztHQUtHO0FBQ0gsTUFBYSxtQkFBbUI7SUFDNUI7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sVUFBVSxDQUFDLEdBQW1DLEVBQzlELE9BQXFDOztZQUNyQyxNQUFNLFFBQVEsR0FBRyxvQkFBVSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXJELE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDN0UsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sWUFBWSxDQUFDLEdBQW1DLEVBQ2hFLE9BQXFDOztZQUNyQyxNQUFNLFFBQVEsR0FBRyxvQkFBVSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRTNELE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDNUUsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBTyxlQUFlLENBQUMsSUFBd0MsRUFDeEUsT0FBcUM7O1lBQ3JDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELENBQUM7S0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQU8s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