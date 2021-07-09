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
const anchors_1 = require("@tangle-js/anchors");
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
     * Verifies a JSON(-LD) document
     *
     * @param doc The JSON(-LD) document
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
            return this.doVerifyDoc(document, undefined, options);
        });
    }
    /**
     * Verifies a chain of JSON(-LD) documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param options The verification options
     *
     * @returns The global verification result
     */
    static verifyJsonChain(docs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doVerifyChain(docs, options);
        });
    }
    /**
     * Verifies a list of JSON(-LD) documents using the proof passed as parameter
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
            return this.doVerifyChainSingleProof(docs, proof, options);
        });
    }
    /**
     * Verifies a chain of JSON(LD) documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param options the verification options
     *
     * @returns The global verification result
     */
    static doVerifyChain(docs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const documents = [];
            // The anchored documents are obtained
            for (const document of docs) {
                let doc;
                try {
                    doc = jsonHelper_1.default.getAnchoredDocument(document);
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
                const verificationResult = yield this.doVerifyChainedDoc(document, channel, verificationOptions);
                if (!verificationResult.result) {
                    return false;
                }
                index++;
            }
            return true;
        });
    }
    static doVerifyChainSingleProof(docs, proof, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const proofDetails = proof.proofValue;
            const documents = [];
            for (const document of docs) {
                const doc = jsonHelper_1.default.getDocument(document);
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
            const verificationResult = yield this.doVerifyDoc(doc, channel, options);
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
                    verified = yield iotaVerifier_1.IotaVerifier.verifyJson(aDoc, { node: options === null || options === void 0 ? void 0 : options.node });
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
    static doVerifyDoc(document, channel, options) {
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
            const result = yield iotaVerifier_1.IotaVerifier.verifyJson(document, { node: options === null || options === void 0 ? void 0 : options.node });
            return result;
        });
    }
    static doVerifyChainedDoc(document, channel, options) {
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
            const result = yield iotaVerifier_1.IotaVerifier.verifyJson(document, { node: options === null || options === void 0 ? void 0 : options.node });
            // Restore the original document
            document.proof = linkedDataProof;
            return { result, fetchResult };
        });
    }
}
exports.IotaLdProofVerifier = IotaLdProofVerifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZWZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhTGRQcm9vZlZlcmlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGdEQUM4QjtBQUM5Qix5RUFBaUQ7QUFDakQsbUZBQTJEO0FBQzNELHNFQUE4QztBQUM5QyxrRkFBMEQ7QUFDMUQsaURBQThDO0FBTzlDOzs7OztHQUtHO0FBQ0gsTUFBYSxtQkFBbUI7SUFDNUI7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sVUFBVSxDQUFDLEdBQW1DLEVBQzlELE9BQXFDOztZQUNyQyxJQUFJLFFBQStCLENBQUM7WUFFcEMsSUFBSTtnQkFDQSxRQUFRLEdBQUcsb0JBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNsRDtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNaLElBQUksS0FBSyxDQUFDLElBQUksS0FBSywyQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRTtvQkFDdEQsT0FBTyxLQUFLLENBQUM7aUJBQ2hCO2dCQUVELE1BQU0sS0FBSyxDQUFDO2FBQ2Y7WUFFRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxRCxDQUFDO0tBQUE7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksTUFBTSxDQUFPLGVBQWUsQ0FBQyxJQUF3QyxFQUN4RSxPQUFxQzs7WUFDckMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QyxDQUFDO0tBQUE7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0ksTUFBTSxDQUFPLDBCQUEwQixDQUFDLElBQWdDLEVBQzNFLEtBQTJCLEVBQzNCLE9BQXFDOztZQUNyQyxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9E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