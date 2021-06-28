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
class IotaLdProofGenerator {
    constructor(anchoringChannel, signer) {
        this.anchoringChannel = anchoringChannel;
        this.signer = signer;
    }
    /**
     * Generates a Linked Data Proof for a JSON-LD document by anchoring it to the anchorage provided
     *
     * @param doc Document
     * @param verificationMethod fragment identifier of the verification method used to sign the document
     * @param secret the secret key used to sign the document
     * @param anchorageID Anchorage
     *
     * @returns Linked Data Proof
     *
     */
    generateLd(doc, verificationMethod, secret, anchorageID) {
        return __awaiter(this, void 0, void 0, function* () {
            // First of all a Linked Data Signature is generated for the document
            const linkedDataSignature = yield this.signer.signJsonLd(doc, verificationMethod, secret);
            // Now we take the Linked Data Signature and anchor it to Tangle through the Channel
            const anchoringResult = yield this.anchoringChannel.anchor(Buffer.from(JSON.stringify(linkedDataSignature)), anchorageID);
            return this.buildLdProof(anchoringResult);
        });
    }
    /**
     * Generates a Linked Data Proof for a JSON document by anchoring it to the anchorage provided
     *
     * @param doc Document
     * @param verificationMethod fragment identifier of the verification method used to sign the document
     * @param secret the secret key used to sign the document
     * @param anchorageID Anchorage where to anchor the Linked Data Signature associated to the proof
     *
     * @returns Linked Data Proof
     *
     */
    generate(doc, verificationMethod, secret, anchorageID) {
        return __awaiter(this, void 0, void 0, function* () {
            // First of all a Linked Data Signature is generated for the document
            const linkedDataSignature = yield this.signer.signJson(doc, verificationMethod, secret);
            // Now we take the Linked Data Signature and anchor it to Tangle through the Channel
            const anchoringResult = yield this.anchoringChannel.anchor(Buffer.from(JSON.stringify(linkedDataSignature)), anchorageID);
            return this.buildLdProof(anchoringResult);
        });
    }
    /**
     * Generates a chain of Linked Data Proofs for the JSON documents passed as parameter
     *
     * @param docs The chain of documents
     * @param verificationMethod The fragment identifier of the verification method used within the signer's DID
     * @param secret The private key used for signing
     * @param anchorageID Initial anchorage used to anchor the Linked Data Signatures
     *
     * @returns the list of Linked Data Proof
     */
    generateChain(docs, verificationMethod, secret, anchorageID) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentAnchorageID = anchorageID;
            const result = [];
            for (const doc of docs) {
                const ldProof = yield this.generate(doc, verificationMethod, secret, currentAnchorageID);
                result.push(ldProof);
                // The next anchorage is the proof Message ID
                currentAnchorageID = ldProof.proofValue.msgID;
            }
            return result;
        });
    }
    /**
     * Generates a chain of Linked Data Proofs for the JSON-LD documents passed as parameter
     *
     * @param docs The chain of documents
     * @param verificationMethod The fragment identifier of the verification method used within the signer's DID
     * @param secret The private key used for signing
     * @param anchorageID Initial anchorage used to anchor the Linked Data Signatures
     *
     * @returns the list of Linked Data Proof
     */
    generateChainLd(docs, verificationMethod, secret, anchorageID) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentAnchorageID = anchorageID;
            const result = [];
            for (const doc of docs) {
                const ldProof = yield this.generateLd(doc, verificationMethod, secret, currentAnchorageID);
                result.push(ldProof);
                // The next anchorage is the proof Message ID
                currentAnchorageID = ldProof.proofValue.msgID;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZHZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YUxkUHJvb2ZHZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBS0Esd0VBQXFFO0FBRXJFLE1BQWEsb0JBQW9CO0lBSzdCLFlBQVksZ0JBQXNDLEVBQUUsTUFBa0I7UUFDbEUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1FBQ3pDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ1UsVUFBVSxDQUFDLEdBQTJCLEVBQy9DLGtCQUEwQixFQUMxQixNQUFjLEVBQ2QsV0FBbUI7O1lBQ25CLHFFQUFxRTtZQUNyRSxNQUFNLG1CQUFtQixHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRTFGLG9GQUFvRjtZQUNwRixNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQ3RELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQ2hELFdBQVcsQ0FDZCxDQUFDO1lBRUYsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzlDLENBQUM7S0FBQTtJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDVSxRQUFRLENBQUMsR0FBMkIsRUFDN0Msa0JBQTBCLEVBQzFCLE1BQWMsRUFDZCxXQUFtQjs7WUFDbkIscUVBQXFFO1lBQ3JFLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFeEYsb0ZBQW9GO1lBQ3BGLE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FDdEQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFDaEQsV0FBVyxDQUNkLENBQUM7WUFFRixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDOUMsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ1UsYUFBYSxDQUFDLElBQWdDLEVBQ3ZELGtCQUEwQixFQUMxQixNQUFjLEVBQ2QsV0FBbUI7O1lBQ25CLElBQUksa0JBQWtCLEdBQUcsV0FBVyxDQUFDO1lBQ3JDLE1BQU0sTUFBTSxHQUEyQixFQUFFLENBQUM7WUFFMUMsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7Z0JBQ3BCLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixDQUFDLENBQUM7Z0JBQ3pGLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3JCLDZDQUE2QztnQkFDN0Msa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7YUFDakQ7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO0tBQUE7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDVSxlQUFlLENBQUMsSUFBZ0MsRUFBRSxrQkFBMEIsRUFDckYsTUFBYyxFQUNkLFdBQW1COztZQUNuQixJQUFJLGtCQUFrQixHQUFHLFdBQVcsQ0FBQztZQUNyQyxNQUFNLE1BQU0sR0FBMkIsRUFBRSxDQUFDO1lBRTFDLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUNwQixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO2dCQUMzRixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyQiw2Q0FBNkM7Z0JBQzdDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO2FBQ2pEO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQztLQUFBO0lBRU8sWUFBWSxDQUFDLGVBQWlDO1FBQ2xELE1BQU0sZUFBZSxHQUF5QjtZQUMxQyxJQUFJLEVBQUUsMkNBQW9CLENBQUMsa0JBQWtCO1lBQzdDLGdHQUFnRztZQUNoRyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUc7WUFDbkMsWUFBWSxFQUFFLGtCQUFrQjtZQUNoQyxVQUFVLEVBQUU7Z0JBQ1IsU0FBUyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTO2dCQUMxQyxXQUFXLEVBQUUsZUFBZSxDQUFDLFdBQVc7Z0JBQ3hDLEtBQUssRUFBRSxlQUFlLENBQUMsS0FBSzthQUMvQjtZQUNELE9BQU8sRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFDO1FBRUYsT0FBTyxlQUFlLENBQUM7SUFDM0IsQ0FBQztDQUNKO0FBcklELG9EQXFJQyJ9