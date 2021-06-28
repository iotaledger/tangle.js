import { IotaAnchoringChannel } from "./iotaAnchoringChannel";
import { IotaSigner } from "./iotaSigner";
import { IAnchoringResult } from "./models/IAnchoringResult";
import { IIotaLinkedDataProof } from "./models/IIotaLinkedDataProof";
import { IJsonDocument } from "./models/IJsonDocument";
import { LinkedDataProofTypes } from "./models/linkedDataProofTypes";

export class IotaProofGenerator {
    private readonly anchoringChannel: IotaAnchoringChannel;

    private readonly signer: IotaSigner;

    constructor(anchoringChannel: IotaAnchoringChannel, signer: IotaSigner) {
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
    public async generateLd(doc: string | IJsonDocument,
        verificationMethod: string,
        secret: string,
        anchorageID: string): Promise<IIotaLinkedDataProof> {
        // First of all a Linked Data Signature is generated for the document
        const linkedDataSignature = await this.signer.signJsonLd(doc, verificationMethod, secret);

        // Now we take the Linked Data Signature and anchor it to Tangle through the Channel
        const anchoringResult = await this.anchoringChannel.anchor(
            Buffer.from(JSON.stringify(linkedDataSignature)),
            anchorageID
        );

        return this.buildLdProof(anchoringResult);
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
    public async generate(doc: string | IJsonDocument,
        verificationMethod: string,
        secret: string,
        anchorageID: string): Promise<IIotaLinkedDataProof> {
        // First of all a Linked Data Signature is generated for the document
        const linkedDataSignature = await this.signer.signJson(doc, verificationMethod, secret);

        // Now we take the Linked Data Signature and anchor it to Tangle through the Channel
        const anchoringResult = await this.anchoringChannel.anchor(
            Buffer.from(JSON.stringify(linkedDataSignature)),
            anchorageID
        );

        return this.buildLdProof(anchoringResult);
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
    public async generateChain(docs: string[] | IJsonDocument[],
        verificationMethod: string,
        secret: string,
        anchorageID: string): Promise<IIotaLinkedDataProof[]> {
        let currentAnchorageID = anchorageID;
        const result: IIotaLinkedDataProof[] = [];

        for (const doc of docs) {
            const ldProof = await this.generate(doc, verificationMethod, secret, currentAnchorageID);
            result.push(ldProof);
            // The next anchorage is the proof Message ID
            currentAnchorageID = ldProof.proofValue.msgID;
        }

        return result;
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
    public async generateChainLd(docs: string[] | IJsonDocument[], verificationMethod: string,
        secret: string,
        anchorageID: string): Promise<IIotaLinkedDataProof[]> {
        let currentAnchorageID = anchorageID;
        const result: IIotaLinkedDataProof[] = [];

        for (const doc of docs) {
            const ldProof = await this.generateLd(doc, verificationMethod, secret, currentAnchorageID);
            result.push(ldProof);
            // The next anchorage is the proof Message ID
            currentAnchorageID = ldProof.proofValue.msgID;
        }

        return result;
    }

    private buildLdProof(anchoringResult: IAnchoringResult): IIotaLinkedDataProof {
        const linkedDataProof: IIotaLinkedDataProof = {
            type: LinkedDataProofTypes.IOTA_LD_PROOF_2021,
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
