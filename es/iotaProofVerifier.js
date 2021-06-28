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
exports.IotaProofVerifier = void 0;
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
class IotaProofVerifier {
    /**
     * Verifies a JSON document
     *
     * @param doc The JSON document
     * @param node The node against the proof is verified
     *
     * @returns true or false with the verification result
     *
     */
    static verifyJson(doc, node) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = jsonHelper_1.default.getAnchoredDocument(doc);
            return (yield this.doVerify(document, node, false)).result;
        });
    }
    /**
     * Verifies a JSON-LD document
     *
     * @param doc The JSON-LD document
     * @param node The node against the proof is verified
     *
     * @returns true or false with the verification result
     *
     */
    static verifyJsonLd(doc, node) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = jsonHelper_1.default.getAnchoredJsonLdDocument(doc);
            return (yield this.doVerify(document, node, true)).result;
        });
    }
    /**
     * Verifies a chain of JSON documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param node The node
     * @returns The global verification result
     */
    static verifyJsonChain(docs, node) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doVerifyChain(docs, node, false);
        });
    }
    /**
     * Verifies a chain of JSON-LD documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param node The node
     * @returns The global verification result
     */
    static verifyJsonLdChain(docs, node) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doVerifyChain(docs, node, true);
        });
    }
    /**
     * Verifies a list of JSON documents using the proof passed as parameter
     * The individual proofs of the events shall be found on the Channel specified
     *
     * @param docs The documents
     * @param proof The proof that points to the Channel used for verification
     * @param node The node
     *
     * @returns The global result of the verification
     */
    static verifyJsonChainSingleProof(docs, proof, node) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doVerifyChainSingleProof(docs, proof, node, false);
        });
    }
    /**
     * Verifies a list of JSON-LD documents using the proof passed as parameter
     *
     * @param docs The documents
     * @param proof The proof that points to the Channel used for verification
     * @param node The node
     *
     * @returns The global result of the verification
     */
    static verifyJsonLdChainSingleProof(docs, proof, node) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doVerifyChainSingleProof(docs, proof, node, true);
        });
    }
    /**
     * Verifies a chain of JSON(LD) documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param node The node
     * @param jsonLd true if the documents must be treated as JSON-LD documents
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
exports.IotaProofVerifier = IotaProofVerifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVByb29mVmVyaWZpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YVByb29mVmVyaWZpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkZBQW1FO0FBQ25FLHFHQUE2RTtBQUM3RSxzRUFBOEM7QUFDOUMsa0ZBQTBEO0FBQzFELGlFQUE4RDtBQUM5RCxpREFBOEM7QUFPOUM7Ozs7O0dBS0c7QUFDSCxNQUFhLGlCQUFpQjtJQUMxQjs7Ozs7Ozs7T0FRRztJQUNJLE1BQU0sQ0FBTyxVQUFVLENBQUMsR0FBbUMsRUFBRSxJQUFZOztZQUM1RSxNQUFNLFFBQVEsR0FBRyxvQkFBVSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXJELE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUMvRCxDQUFDO0tBQUE7SUFFRDs7Ozs7Ozs7T0FRRztJQUNJLE1BQU0sQ0FBTyxZQUFZLENBQUMsR0FBbUMsRUFBRSxJQUFZOztZQUM5RSxNQUFNLFFBQVEsR0FBRyxvQkFBVSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRTNELE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUM5RCxDQUFDO0tBQUE7SUFFRDs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQU8sZUFBZSxDQUFDLElBQXdDLEVBQ3hFLElBQVk7O1lBQ1osT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakQsQ0FBQztLQUFBO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFPLGlCQUFpQixDQUFDLElBQXdDLEVBQzFFLElBQVk7O1lB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