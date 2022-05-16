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
        console.log("Anchoring Result", anchoringResult);
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
        console.log("About to call getMsgIdL1");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZHZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YUxkUHJvb2ZHZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsd0NBQXdDO0FBRXhDLE9BQU8sRUFBeUIsb0JBQW9CLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFNakcsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFFckUsTUFBTSxPQUFPLG9CQUFvQjtJQU83QixZQUFvQixnQkFBc0MsRUFBRSxNQUFrQjtRQUMxRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7UUFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQXNDLEVBQUUsTUFBa0I7UUFDM0UsT0FBTyxJQUFJLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQTJCLEVBQUUsT0FBd0I7UUFDdkUsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVyRSxvRkFBb0Y7UUFDcEYsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUN0RCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUNoRCxPQUFPLENBQUMsV0FBVyxDQUN0QixDQUFDO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUVqRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBZ0MsRUFDdkQsT0FBd0I7UUFDeEIsTUFBTSxNQUFNLEdBQTJCLEVBQUUsQ0FBQztRQUUxQyxNQUFNLFlBQVksR0FBb0I7WUFDbEMsR0FBRyxPQUFPO1NBQ2IsQ0FBQztRQUVGLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO1lBQ3BCLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyQiw2Q0FBNkM7WUFDN0MsWUFBWSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztTQUN2RDtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxLQUFLLENBQUMsWUFBWSxDQUFDLGVBQWlDO1FBQ3hELE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUV4QyxNQUFNLE9BQU8sR0FBRyxNQUFNLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUU5RixNQUFNLGVBQWUsR0FBeUI7WUFDMUMsSUFBSSxFQUFFLG9CQUFvQixDQUFDLGtCQUFrQjtZQUM3QyxnR0FBZ0c7WUFDaEcsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHO1lBQ25DLFlBQVksRUFBRSxrQkFBa0I7WUFDaEMsVUFBVSxFQUFFO2dCQUNSLFNBQVMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUztnQkFDMUMsV0FBVyxFQUFFLGVBQWUsQ0FBQyxXQUFXO2dCQUN4QyxLQUFLLEVBQUUsZUFBZSxDQUFDLEtBQUs7Z0JBQzVCLE9BQU87YUFDVjtZQUNELE9BQU8sRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFDO1FBRUYsT0FBTyxlQUFlLENBQUM7SUFDM0IsQ0FBQztDQUNKIn0=