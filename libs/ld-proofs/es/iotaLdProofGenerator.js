/* eslint-disable jsdoc/require-jsdoc */
import { IotaAnchoringChannel, ProtocolHelper } from "@tangle-js/anchors";
import { LinkedDataProofTypes } from "./models/linkedDataProofTypes";
export class IotaLdProofGenerator {
    constructor(anchoringChannel, signer) {
        this.anchoringChannel = anchoringChannel;
        this.signer = signer;
    }
    /**
     * Creates a new instance of LD Proof Generator.
     *
     * @param anchoringChannel The anchoring channel to be used.
     * @param signer The signer to be used.
     * @returns The LD Proof generator.
     */
    static create(anchoringChannel, signer) {
        return new IotaLdProofGenerator(anchoringChannel, signer);
    }
    /**
     * Generates a Linked Data Proof for a JSON(-LD) document by anchoring it to the anchorage provided.
     *
     * @param doc Document.
     * @param options Containing the parameters to be used to generate the proof.
     * @returns Linked Data Proof.
     */
    async generate(doc, options) {
        const linkedDataSignature = await this.signer.signJson(doc, options);
        // Now we take the Linked Data Signature and anchor it to Tangle through the Channel
        const anchoringResult = await this.anchoringChannel.anchor(Buffer.from(JSON.stringify(linkedDataSignature)), options.anchorageID);
        return this.buildLdProof(anchoringResult);
    }
    /**
     * Generates a chain of Linked Data Proofs for the JSON(-LD) documents passed as parameter.
     *
     * @param docs The chain of documents.
     * @param options The Parameters to be used when generating the chain of proofs.
     * @returns The list of Linked Data Proof.
     */
    async generateChain(docs, options) {
        const result = [];
        const proofOptions = {
            ...options
        };
        for (const doc of docs) {
            const ldProof = await this.generate(doc, proofOptions);
            result.push(ldProof);
            // The next anchorage is the proof Message ID
            proofOptions.anchorageID = ldProof.proofValue.msgID;
        }
        return result;
    }
    async buildLdProof(anchoringResult) {
        const msgIDL1 = await ProtocolHelper.getMsgIdL1(this.anchoringChannel, anchoringResult.msgID);
        const linkedDataProof = {
            type: LinkedDataProofTypes.IOTA_LD_PROOF_2021,
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
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZHZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YUxkUHJvb2ZHZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsd0NBQXdDO0FBRXhDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQU8xRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUVyRSxNQUFNLE9BQU8sb0JBQW9CO0lBTzdCLFlBQW9CLGdCQUFzQyxFQUFFLE1BQWtCO1FBQzFFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUN6QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBc0MsRUFBRSxNQUFrQjtRQUMzRSxPQUFPLElBQUksb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBMkIsRUFBRSxPQUF3QjtRQUN2RSxNQUFNLG1CQUFtQixHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXJFLG9GQUFvRjtRQUNwRixNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQ3RELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQ2hELE9BQU8sQ0FBQyxXQUFXLENBQ3RCLENBQUM7UUFFRixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBZ0MsRUFDdkQsT0FBd0I7UUFDeEIsTUFBTSxNQUFNLEdBQTJCLEVBQUUsQ0FBQztRQUUxQyxNQUFNLFlBQVksR0FBb0I7WUFDbEMsR0FBRyxPQUFPO1NBQ2IsQ0FBQztRQUVGLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO1lBQ3BCLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyQiw2Q0FBNkM7WUFDN0MsWUFBWSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztTQUN2RDtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxLQUFLLENBQUMsWUFBWSxDQUFDLGVBQWlDO1FBQ3hELE1BQU0sT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTlGLE1BQU0sZUFBZSxHQUF5QjtZQUMxQyxJQUFJLEVBQUUsb0JBQW9CLENBQUMsa0JBQWtCO1lBQzdDLGdHQUFnRztZQUNoRyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUc7WUFDbkMsWUFBWSxFQUFFLGtCQUFrQjtZQUNoQyxVQUFVLEVBQUU7Z0JBQ1IsU0FBUyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTO2dCQUMxQyxXQUFXLEVBQUUsZUFBZSxDQUFDLFdBQVc7Z0JBQ3hDLEtBQUssRUFBRSxlQUFlLENBQUMsS0FBSztnQkFDNUIsT0FBTzthQUNWO1lBQ0QsT0FBTyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUM7UUFFRixPQUFPLGVBQWUsQ0FBQztJQUMzQixDQUFDO0NBQ0oifQ==