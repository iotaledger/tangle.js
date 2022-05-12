import { IotaAnchoringChannel, ProtocolHelper } from "@tangle-js/anchors";
import { LinkedDataProofTypes } from "./models/linkedDataProofTypes";
export class IotaLdProofGenerator {
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
     * @returns Linked Data Proof
     */
    async generate(doc, options) {
        const linkedDataSignature = await this.signer.signJson(doc, options);
        // Now we take the Linked Data Signature and anchor it to Tangle through the Channel
        const anchoringResult = await this.anchoringChannel.anchor(Buffer.from(JSON.stringify(linkedDataSignature)), options.anchorageID);
        return this.buildLdProof(anchoringResult);
    }
    /**
     * Generates a chain of Linked Data Proofs for the JSON(-LD) documents passed as parameter
     *
     * @param docs The chain of documents
     * @param options the Parameters to be used when generating the chain of proofs
     * @returns the list of Linked Data Proof
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUxkUHJvb2ZHZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YUxkUHJvb2ZHZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLG9CQUFvQixFQUFFLGNBQWMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBTzFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBRXJFLE1BQU0sT0FBTyxvQkFBb0I7SUFLN0IsWUFBb0IsZ0JBQXNDLEVBQUUsTUFBa0I7UUFDMUUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1FBQ3pDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFzQyxFQUFFLE1BQWtCO1FBQzNFLE9BQU8sSUFBSSxvQkFBb0IsQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUEyQixFQUFFLE9BQXdCO1FBQ3ZFLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFckUsb0ZBQW9GO1FBQ3BGLE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FDdEQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFDaEQsT0FBTyxDQUFDLFdBQVcsQ0FDdEIsQ0FBQztRQUVGLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFnQyxFQUN2RCxPQUF3QjtRQUN4QixNQUFNLE1BQU0sR0FBMkIsRUFBRSxDQUFDO1FBRTFDLE1BQU0sWUFBWSxHQUFvQjtZQUNsQyxHQUFHLE9BQU87U0FDYixDQUFDO1FBRUYsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7WUFDcEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JCLDZDQUE2QztZQUM3QyxZQUFZLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1NBQ3ZEO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVPLEtBQUssQ0FBQyxZQUFZLENBQUMsZUFBaUM7UUFDeEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFOUYsTUFBTSxlQUFlLEdBQXlCO1lBQzFDLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxrQkFBa0I7WUFDN0MsZ0dBQWdHO1lBQ2hHLGtCQUFrQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRztZQUNuQyxZQUFZLEVBQUUsa0JBQWtCO1lBQ2hDLFVBQVUsRUFBRTtnQkFDUixTQUFTLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVM7Z0JBQzFDLFdBQVcsRUFBRSxlQUFlLENBQUMsV0FBVztnQkFDeEMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxLQUFLO2dCQUM1QixPQUFPO2FBQ1Y7WUFDRCxPQUFPLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7U0FDcEMsQ0FBQztRQUVGLE9BQU8sZUFBZSxDQUFDO0lBQzNCLENBQUM7Q0FDSiJ9