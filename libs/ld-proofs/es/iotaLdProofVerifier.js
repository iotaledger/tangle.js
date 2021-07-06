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
            const document = jsonHelper_1.default.getAnchoredJsonLdDocument(doc);
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
            let targetChannel = yield anchors_1.IotaAnchoringChannel.create(undefined, options === null || options === void 0 ? void 0 : options.node).bind(proofDetails.channelID);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZWZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhTGRQcm9vZlZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGdEQUM4QjtBQUM5Qix5RUFBaUQ7QUFDakQsbUZBQTJEO0FBQzNELHNFQUE4QztBQUM5QyxrRkFBMEQ7QUFDMUQsaURBQThDO0FBTzlDOzs7OztHQUtHO0FBQ0gsTUFBYSxtQkFBbUI7SUFDNUI7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sVUFBVSxDQUFDLEdBQW1DLEVBQzlELE9BQXFDOztZQUNyQyxNQUFNLFFBQVEsR0FBRyxvQkFBVSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXJELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRSxDQUFDO0tBQUE7SUFFRDs7Ozs7Ozs7T0FRRztJQUNJLE1BQU0sQ0FBTyxZQUFZLENBQUMsR0FBbUMsRUFDaEUsT0FBcUM7O1lBQ3JDLE1BQU0sUUFBUSxHQUFHLG9CQUFVLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFM0QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hFLENBQUM7S0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQU8sZUFBZSxDQUFDLElBQXdDLEVBQ3hFLE9BQXFDOztZQUNyQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRCxDQUFDO0tBQUE7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksTUFBTSxDQUFPLGlCQUFpQixDQUFDLElBQXdDLEVBQzFFLE9BQXFDOztZQUNyQyxPQUFPLElBQUksQ0FB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