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
                channel = yield anchors_1.IotaAnchoringChannel.fromID(channelID, { node }).bind(anchors_1.SeedHelper.generateSeed());
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
                channel = yield anchors_1.IotaAnchoringChannel.fromID(channelID, options).bind(anchors_1.SeedHelper.generateSeed());
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
                    targetChannel = yield anchors_1.IotaAnchoringChannel.fromID(proofDetails.channelID, options).bind(anchors_1.SeedHelper.generateSeed());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZWZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhTGRQcm9vZlZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGdEQUM4QjtBQUM5Qix5RUFBaUQ7QUFDakQsbUZBQTJEO0FBQzNELHNFQUE4QztBQUM5QyxrRkFBMEQ7QUFDMUQsaURBQThDO0FBTzlDOzs7OztHQUtHO0FBQ0gsTUFBYSxtQkFBbUI7SUFDNUI7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sVUFBVSxDQUFDLEdBQW1DLEVBQzlELE9BQXFDOztZQUNyQyxJQUFJLFFBQStCLENBQUM7WUFFcEMsSUFBSTtnQkFDQSxRQUFRLEdBQUcsb0JBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNsRDtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNaLElBQUksS0FBSyxDQUFDLElBQUksS0FBSywyQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRTtvQkFDdEQsT0FBTyxLQUFLLENBQUM7aUJBQ2hCO2dCQUVELE1BQU0sS0FBSyxDQUFDO2FBQ2Y7WUFFRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakUsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sWUFBWSxDQUFDLEdBQW1DLEVBQ2hFLE9BQXFDOztZQUNyQyxJQUFJLFFBQStCLENBQUM7WUFFcEMsSUFBSTtnQkFDQSxRQUFRLEdBQUcsb0JBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN4RDtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNaLElBQUksS0FBSyxDQUFDLElBQUksS0FBSywyQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRTtvQkFDdEQsT0FBTyxLQUFLLENBQUM7aUJBQ2hCO2dCQUVELE1BQU0sS0FB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