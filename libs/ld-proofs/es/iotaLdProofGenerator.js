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
     * Creates a new instance of LD Proof Generator
     *
     * @param anchoringChannel The anchoring channel to be used
     * @param signer The signer to be used
     * @returns The LD Proof generator
     */
    static create(anchoringChannel, signer) {
        return new IotaLdProofGenerator(anchoringChannel, signer);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZHZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YUxkUHJvb2ZHZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBT0Esd0VBQXFFO0FBQ3JFLDREQUF5RDtBQUV6RCxNQUFhLG9CQUFvQjtJQUs3QixZQUFvQixnQkFBc0MsRUFBRSxNQUFrQjtRQUMxRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7UUFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQXNDLEVBQUUsTUFBa0I7UUFDM0UsT0FBTyxJQUFJLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNVLFVBQVUsQ0FBQyxHQUEyQixFQUFFLE9BQXdCOztZQUN6RSxxRUFBcUU7WUFDckUsTUFBTSxnQkFBZ0IsR0FBb0I7Z0JBQ3RDLGFBQWEsRUFBRSwrQkFBYyxDQUFDLFlBQVk7Z0JBQzFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxrQkFBa0I7Z0JBQzlDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTthQUN6QixDQUFDO1lBQ0YsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBRWhGLG9GQUFvRjtZQUNwRixNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQ3RELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQ2hELE9BQU8sQ0FBQyxXQUFXLENBQ3RCLENBQUM7WUFFRixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMs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