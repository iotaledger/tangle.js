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
     * Generates a Linked Data Proof for a JSON(-LD) document by anchoring it to the anchorage provided
     *
     * @param doc Document
     * @param options containing the parameters to be used to generate the proof
     *
     * @returns Linked Data Proof
     *
     */
    generate(doc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const linkedDataSignature = yield this.signer.signJson(doc, options);
            // Now we take the Linked Data Signature and anchor it to Tangle through the Channel
            const anchoringResult = yield this.anchoringChannel.anchor(Buffer.from(JSON.stringify(linkedDataSignature)), options.anchorageID);
            return this.buildLdProof(anchoringResult);
        });
    }
    /**
     * Generates a chain of Linked Data Proofs for the JSON(-LD) documents passed as parameter
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZHZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YUxkUHJvb2ZHZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBTUEsd0VBQXFFO0FBRXJFLE1BQWEsb0JBQW9CO0lBSzdCLFlBQW9CLGdCQUFzQyxFQUFFLE1BQWtCO1FBQzFFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUN6QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBc0MsRUFBRSxNQUFrQjtRQUMzRSxPQUFPLElBQUksb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ1UsUUFBUSxDQUFDLEdBQTJCLEVBQUUsT0FBd0I7O1lBQ3ZFLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFckUsb0ZBQW9GO1lBQ3BGLE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FDdEQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFDaEQsT0FBTyxDQUFDLFdBQVcsQ0FDdEIsQ0FBQztZQUVGLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM5QyxDQUFDO0tBQUE7SUFFRDs7Ozs7OztPQU9HO0lBQ1UsYUFBYSxDQUFDLElBQWdDLEVBQ3ZELE9BQXdCOztZQUN4QixNQUFNLE1BQU0sR0FBMkIsRUFBRSxDQUFDO1lBRTFDLE1BQU0sWUFBWSxxQkFDWCxPQUFPLENBQ2IsQ0FBQztZQUVGLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUNwQixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUN2RCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyQiw2Q0FBNkM7Z0JBQzdDLFlBQVksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7YUFDdkQ7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO0tBQUE7SUFFTyxZQUFZLENBQUMsZUFBaUM7UUFDbEQsTUFBTSxlQUFlLEdBQXlCO1lBQzFDLElBQUksRUFBRSwyQ0FBb0IsQ0FBQyxrQkFBa0I7WUFDN0MsZ0dBQWdHO1lBQ2hHLGtCQUFrQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRztZQUNuQyxZQUFZLEVBQUUsa0JBQWtCO1lBQ2hDLFVBQVUsRUFBRTtnQkFDUixTQUFTLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVM7Z0JBQzFDLFdBQVcsRUFBRSxlQUFlLENBQUMsV0FBVztnQkFDeEMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxLQUFLO2FBQy9CO1lBQ0QsT0FBTyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUM7UUFFRixPQUFPLGVBQWUsQ0FBQztJQUMzQixDQUFDO0NBQ0o7QUFwRkQsb0RBb0ZDIn0=