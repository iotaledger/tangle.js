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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IotaLdProofGenerator = void 0;
const linkedDataProofTypes_1 = require("./models/linkedDataProofTypes");
const signatureTypes_1 = require("./models/signatureTypes");
class IotaLdProofGenerator {
    constructor(anchoringChannel, signer) {
        this.anchoringChannel = anchoringChannel;
        this.signer = signer;
    }
    /**
     * Generates a Linked Data Proof for a JSON-LD document by anchoring it to the anchorage provided
     *
     * @param doc Document
     * @param options containing the parameters to be used to generate the proof
     *
     * @returns Linked Data Proof
     *
     */
    generateLd(doc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // First of all a Linked Data Signature is generated for the document
            const signatureOptions = {
                signatureType: signatureTypes_1.SignatureTypes.ED25519_2018,
                verificationMethod: options.verificationMethod,
                secret: options.secret
            };
            const linkedDataSignature = yield this.signer.signJsonLd(doc, signatureOptions);
            // Now we take the Linked Data Signature and anchor it to Tangle through the Channel
            const anchoringResult = yield this.anchoringChannel.anchor(Buffer.from(JSON.stringify(linkedDataSignature)), options.anchorageID);
            return this.buildLdProof(anchoringResult);
        });
    }
    /**
     * Generates a Linked Data Proof for a JSON document by anchoring it to the anchorage provided
     *
     * @param doc Document
     * @param options containing the parameters to be used to generate the proof
     *
     * @returns Linked Data Proof
     *
     */
    generate(doc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // First of all a Linked Data Signature is generated for the document
            const signatureOptions = {
                signatureType: signatureTypes_1.SignatureTypes.JCS_ED25519_2020,
                verificationMethod: options.verificationMethod,
                secret: options.secret
            };
            const linkedDataSignature = yield this.signer.signJson(doc, signatureOptions);
            // Now we take the Linked Data Signature and anchor it to Tangle through the Channel
            const anchoringResult = yield this.anchoringChannel.anchor(Buffer.from(JSON.stringify(linkedDataSignature)), options.anchorageID);
            return this.buildLdProof(anchoringResult);
        });
    }
    /**
     * Generates a chain of Linked Data Proofs for the JSON documents passed as parameter
     *
     * @param docs The chain of documents
     * @param options the Parameters to be used when generating the chain of proofs
     *
     * @returns the list of Linked Data Proof
     */
    generateChain(docs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            const proofOptions = Object.assign({}, options);
            for (const doc of docs) {
                const ldProof = yield this.generate(doc, proofOptions);
                result.push(ldProof);
                // The next anchorage is the proof Message ID
                proofOptions.anchorageID = ldProof.proofValue.msgID;
            }
            return result;
        });
    }
    /**
     * Generates a chain of Linked Data Proofs for the JSON-LD documents passed as parameter
     *
     * @param docs The chain of documents
     * @param options the Parameters to be used when generating the chain of proofs
     *
     * @returns the list of Linked Data Proof
     */
    generateChainLd(docs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            const proofOptions = Object.assign({}, options);
            for (const doc of docs) {
                const ldProof = yield this.generateLd(doc, proofOptions);
                result.push(ldProof);
                // The next anchorage is the proof Message ID
                proofOptions.anchorageID = ldProof.proofValue.msgID;
            }
            return result;
        });
    }
    buildLdProof(anchoringResult) {
        const linkedDataProof = {
            type: linkedDataProofTypes_1.LinkedDataProofTypes.IOTA_LD_PROOF_2021,
            // This has to be made more accurate pointing to the public key used to send data to the channel
            verificationMethod: this.signer.did,
            proofPurpose: "dataVerification",
            proofValue: {
                channelID: this.anchoringChannel.channelID,
                anchorageID: anchoringResult.anchorageID,
                msgID: anchoringResult.msgID
            },
            created: new Date().toISOString()
        };
        return linkedDataProof;
    }
}
exports.IotaLdProofGenerator = IotaLdProofGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZHZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YUxkUHJvb2ZHZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBT0Esd0VBQXFFO0FBQ3JFLDREQUF5RDtBQUV6RCxNQUFhLG9CQUFvQjtJQUs3QixZQUFZLGdCQUFzQyxFQUFFLE1BQWtCO1FBQ2xFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUN6QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDVSxVQUFVLENBQUMsR0FBMkIsRUFBRSxPQUF3Qjs7WUFDekUscUVBQXFFO1lBQ3JFLE1BQU0sZ0JBQWdCLEdBQW9CO2dCQUN0QyxhQUFhLEVBQUUsK0JBQWMsQ0FBQyxZQUFZO2dCQUMxQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsa0JBQWtCO2dCQUM5QyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07YUFDekIsQ0FBQztZQUNGLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUVoRixvRkFBb0Y7WUFDcEYsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUN0RCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUNoRCxPQUFPLENBQUMsV0FBVyxDQUN0QixDQUFDO1lBRUYsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzlDLENBQUM7S0FBQTtJQUVEOzs7Ozs7OztPQVFHO0lBQ1UsUUFBUSxDQUFDLEdBQTJCLEVBQUUsT0FBd0I7O1lBQ3ZFLHFFQUFxRTtZQUNyRSxNQUFNLGdCQUFnQixHQUFvQjtnQkFDdEMs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