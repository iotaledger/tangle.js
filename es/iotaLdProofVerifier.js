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
            const linkedDataSignature = JSON.parse(fetchResult.msgID);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZWZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhTGRQcm9vZlZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJGQUFtRTtBQUNuRSxxR0FBNkU7QUFDN0Usc0VBQThDO0FBQzlDLGtGQUEwRDtBQUMxRCxpRUFBOEQ7QUFDOUQsaURBQThDO0FBTzlDOzs7OztHQUtHO0FBQ0gsTUFBYSxtQkFBbUI7SUFDNUI7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sVUFBVSxDQUFDLEdBQW1DLEVBQUUsSUFBWTs7WUFDNUUsTUFBTSxRQUFRLEdBQUcsb0JBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVyRCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDL0QsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sWUFBWSxDQUFDLEdBQW1DLEVBQUUsSUFBWTs7WUFDOUUsTUFBTSxRQUFRLEdBQUcsb0JBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUUzRCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDOUQsQ0FBQztLQUFBO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFPLGVBQWUsQ0FBQyxJQUF3QyxFQUN4RSxJQUFZOztZQUNaLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pELENBQUM7S0FBQTtJQUVEOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBTyxpQkFBaUIsQ0FBQyxJQUF3QyxFQUMxRSxJQUFZ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