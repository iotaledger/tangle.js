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
const anchors_1 = require("@tangle-js/anchors");
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
        return __awaiter(this, void 0, void 0, function* () {
            const msgIDL1 = yield anchors_1.ProtocolHelper.getMsgIdL1(this.anchoringChannel, anchoringResult.msgID);
            const linkedDataProof = {
                type: linkedDataProofTypes_1.LinkedDataProofTypes.IOTA_LD_PROOF_2021,
                // This has to be made more accurate pointing to the public key used to send data to the channel
                verificationMethod: this.signer.did,
                proofPurpose: "dataVerification",
                proofValue: {
                    channelID: this.anchoringChannel.channelID,
                    anchorageID: anchoringResult.anchorageID,
                    msgID: anchoringResult.msgID,
                    msgIDL1
                },
                created: new Date().toISOString()
            };
            return linkedDataProof;
        });
    }
}
exports.IotaLdProofGenerator = IotaLdProofGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZHZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YUxkUHJvb2ZHZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsZ0RBQTRGO0FBTTVGLHdFQUFxRTtBQUVyRSxNQUFhLG9CQUFvQjtJQUs3QixZQUFvQixnQkFBc0MsRUFBRSxNQUFrQjtRQUMxRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7UUFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQXNDLEVBQUUsTUFBa0I7UUFDM0UsT0FBTyxJQUFJLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNVLFFBQVEsQ0FBQyxHQUEyQixFQUFFLE9BQXdCOztZQUN2RSxNQUFNLG1CQUFtQixHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRXJFLG9GQUFvRjtZQUNwRixNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQ3RELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQ2hELE9BQU8sQ0FBQyxXQUFXLENBQ3RCLENBQUM7WUFFRixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDOUMsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7T0FPRztJQUNVLGFBQWEsQ0FBQyxJQUFnQyxFQUN2RCxPQUF3Qjs7WUFDeEIsTUFBTSxNQUFNLEdBQTJCLEVBQUUsQ0FBQztZQUUxQyxNQUFNLFlBQVkscUJBQ1gsT0FBTyxDQUNiLENBQUM7WUFFRixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtnQkFDcEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDckIsNkNBQTZDO2dCQUM3QyxZQUFZLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO2FBQ3ZEO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQztLQUFBO0lBRWEsWUFBWSxDQUFDLGVBQWlDOztZQUN4RCxNQUFNLE9BQU8sR0FBRyxNQUFNLHdCQUFjLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFOUYsTUFBTSxlQUFlLEdBQXlCO2dCQUMxQyxJQUFJLEVBQUUsMkNBQW9CLENBQUMsa0JBQWtCO2dCQUM3QyxnR0FBZ0c7Z0JBQ2hHLGtCQUFrQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRztnQkFDbkMsWUFBWSxFQUFFLGtCQUFrQjtnQkFDaEMsVUFBVSxFQUFFO29CQUNSLFNBQVMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUztvQkFDMUMsV0FBVyxFQUFFLGVBQWUsQ0FBQyxXQUFXO29CQUN4QyxLQUFLLEVBQUUsZUFBZSxDQUFDLEtBQUs7b0JBQzVCLE9BQU87aUJBQ1Y7Z0JBQ0QsT0FBTyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO2FBQ3BDLENBQUM7WUFFRixPQUFPLGVBQWUsQ0FBQztRQUMzQixDQUFDO0tBQUE7Q0FDSjtBQXZGRCxvREF1RkMifQ==