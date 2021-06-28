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
const anchoringChannelError_1 = __importDefault(require("./errors/anchoringChannelError"));
const anchoringChannelErrorNames_1 = __importDefault(require("./errors/anchoringChannelErrorNames"));
const jsonHelper_1 = __importDefault(require("./helpers/jsonHelper"));
const validationHelper_1 = __importDefault(require("./helpers/validationHelper"));
const iotaAnchoringChannel_1 = require("./iotaAnchoringChannel");
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
            return (yield this.doVerify(document, options.node, false)).result;
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
            return (yield this.doVerify(document, options.node, true)).result;
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
            return this.doVerifyChain(docs, options.node, false);
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
            return this.doVerifyChain(docs, options.node, true);
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
            return this.doVerifyChainSingleProof(docs, proof, options.node, false);
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
            return this.doVerifyChainSingleProof(docs, proof, options.node, true);
        });
    }
    /**
     * Verifies a chain of JSON(LD) documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param node The node
     * @param jsonLd true if the documents must be treated as JSON-LD documents
     *
     * @returns The global verification result
     */
    static doVerifyChain(docs, node, jsonLd) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = 0;
            // The channel where all the verifications shall happen
            let expectedChannelID;
            // The current anchorageID
            let expectedAnchorageID;
            for (const document of docs) {
                let doc;
                if (jsonLd) {
                    doc = jsonHelper_1.default.getAnchoredJsonLdDocument(document);
                }
                else {
                    doc = jsonHelper_1.default.getAnchoredDocument(document);
                }
                // The first one determines the expected values
                if (index === 0) {
                    expectedChannelID = doc.proof.proofValue.channelID;
                    expectedAnchorageID = doc.proof.proofValue.anchorageID;
                }
                const proofValue = doc.proof.proofValue;
                if (proofValue.channelID === expectedChannelID &&
                    proofValue.anchorageID === expectedAnchorageID) {
                    const verificationResult = yield this.doVerify(doc, node, jsonLd);
                    if (!verificationResult.result) {
                        return false;
                    }
                    expectedAnchorageID = verificationResult.fetchResult.msgID;
                }
                else {
                    return false;
                }
                return true;
            }
        });
    }
    static doVerifyChainSingleProof(docs, proof, node, jsonLd) {
        return __awaiter(this, void 0, void 0, function* () {
            const proofDetails = proof.proofValue;
            let currentAnchorageID = proofDetails.anchorageID;
            let index = 0;
            for (const document of docs) {
                let doc;
                if (jsonLd) {
                    doc = jsonHelper_1.default.getDocument(document);
                }
                else {
                    doc = jsonHelper_1.default.getJsonLdDocument(document);
                }
                const docProof = JSON.parse(JSON.stringify(proof));
                // The anchorageID has to be updated for this new built proof
                proof.proofValue.anchorageID = currentAnchorageID;
                // The messageID is only relevant for the first one
                if (index++ !== 0) {
                    delete proof.proofValue.msgID;
                }
                doc.proof = docProof;
                const verificationResult = yield this.doVerify(doc, node, jsonLd);
                if (!verificationResult.result) {
                    return false;
                }
                currentAnchorageID = verificationResult.fetchResult.msgID;
                delete doc.proof;
            }
            return true;
        });
    }
    static doVerify(document, node, jsonLd) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validationHelper_1.default.url(node)) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_NODE, "The node has to be a URL");
            }
            const linkedDataProof = document.proof;
            const proofDetails = document.proof.proofValue;
            const channel = yield iotaAnchoringChannel_1.IotaAnchoringChannel.create(node).bind(proofDetails.channelID);
            // From the channel the message is retrieved and then the Linked Data Signature provided
            const fetchResult = yield channel.fetch(proofDetails.anchorageID, proofDetails.msgID);
            const linkedDataSignature = JSON.parse(fetchResult.message);
            // now assign the Linked Data Signature as proof
            document.proof = linkedDataSignature;
            let result;
            if (jsonLd) {
                result = yield iotaVerifier_1.IotaVerifier.verifyJsonLd({
                    document: document,
                    node
                });
            }
            else {
                result = yield iotaVerifier_1.IotaVerifier.verifyJson({
                    document: document,
                    node
                });
            }
            // Restore the original document
            document.proof = linkedDataProof;
            return { result, fetchResult };
        });
    }
}
exports.IotaLdProofVerifier = IotaLdProofVerifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZWZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhTGRQcm9vZlZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJGQUFtRTtBQUNuRSxxR0FBNkU7QUFDN0Usc0VBQThDO0FBQzlDLGtGQUEwRDtBQUMxRCxpRUFBOEQ7QUFDOUQsaURBQThDO0FBUTlDOzs7OztHQUtHO0FBQ0gsTUFBYSxtQkFBbUI7SUFDNUI7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sVUFBVSxDQUFDLEdBQW1DLEVBQzlELE9BQW9DOztZQUNwQyxNQUFNLFFBQVEsR0FBRyxvQkFBVSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXJELE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDdkUsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sWUFBWSxDQUFDLEdBQW1DLEVBQ2hFLE9BQW9DOztZQUNwQyxNQUFNLFFBQVEsR0FBRyxvQkFBVSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRTNELE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDdEUsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBTyxlQUFlLENBQUMsSUFBd0MsRUFDeEUsT0FBb0M7O1lBQ3BDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6RCxDQUFDO0tBQUE7SUFFRDs7Ozs7OztPQU9HO0lBQ0ks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