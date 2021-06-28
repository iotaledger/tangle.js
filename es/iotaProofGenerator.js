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
exports.IotaProofGenerator = void 0;
const linkedDataProofTypes_1 = require("./models/linkedDataProofTypes");
class IotaProofGenerator {
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
exports.IotaProofGenerator = IotaProofGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVByb29mR2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2lvdGFQcm9vZkdlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFLQSx3RUFBcUU7QUFFckUsTUFBYSxrQkFBa0I7SUFLM0IsWUFBWSxnQkFBc0MsRUFBRSxNQUFrQjtRQUNsRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7UUFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDVSxVQUFVLENBQUMsR0FBMkIsRUFDL0Msa0JBQTBCLEVBQzFCLE1BQWMsRUFDZCxXQUFtQjs7WUFDbkIscUVBQXFFO1lBQ3JFLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFMUYsb0ZBQW9GO1lBQ3BGLE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FDdEQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFDaEQsV0FBVyxDQUNkLENBQUM7WUFFRixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDOUMsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNVLFFBQVEsQ0FBQyxHQUEyQixFQUM3QyxrQkFBMEIsRUFDMUIsTUFBYyxFQUNkLFdBQW1COztZQUNuQixxRUFBcUU7WUFDckUsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV4RixvRkFBb0Y7WUFDcEYsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUN0RCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUNoRCxXQUFXLENBQ2QsQ0FBQztZQUVGLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM5QyxDQUFDO0tBQUE7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDVSxhQUFhLENBQUMsSUFBZ0MsRUFDdkQsa0JBQTBCLEVBQzFCLE1BQWMsRUFDZCxXQUFtQjs7WUFDbkIsSUFBSSxrQkFBa0IsR0FBRyxXQUFXLENBQUM7WUFDckMsTUFBTSxNQUFNLEdBQTJCLEVBQUUsQ0FBQztZQUUxQyxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtnQkFDcEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztnQkFDekYsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDckIsNkNBQTZDO2dCQUM3QyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQzthQUNqRDtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7S0FBQTtJQUVEOzs7Ozs7Ozs7T0FTRztJQUNVLGVBQWUsQ0FBQyxJQUFnQyxFQUFFLGtCQUEwQixFQUNyRixNQUFjLEVBQ2QsV0FBbUI7O1lBQ25CLElBQUksa0JBQWtCLEdBQUcsV0FBVyxDQUFDO1lBQ3JDLE1BQU0sTUFBTSxHQUEyQixFQUFFLENBQUM7WUFFMUMsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7Z0JBQ3BCLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixDQUFDLENBQUM7Z0JBQzNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3JCLDZDQUE2QztnQkFDN0Msa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7YUFDakQ7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO0tBQUE7SUFFTyxZQUFZLENBQUMsZUFBaUM7UUFDbEQsTUFBTSxlQUFlLEdBQXlCO1lBQzFDLElBQUksRUFBRSwyQ0FBb0IsQ0FBQyxrQkFBa0I7WUFDN0MsZ0dBQWdHO1lBQ2hHLGtCQUFrQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRztZQUNuQyxZQUFZLEVBQUUsa0JBQWtCO1lBQ2hDLFVBQVUsRUFBRTtnQkFDUixTQUFTLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVM7Z0JBQzFDLFdBQVcsRUFBRSxlQUFlLENBQUMsV0FBVztnQkFDeEMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxLQUFLO2FBQy9CO1lBQ0QsT0FBTyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUM7UUFFRixPQUFPLGVBQWUsQ0FBQztJQUMzQixDQUFDO0NBQ0o7QUFySUQsZ0RBcUlDIn0=