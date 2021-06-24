import AnchoringChannelError from "./errors/anchoringChannelError";
import AnchoringChannelErrorNames from "./errors/anchoringChannelErrorNames";
import JsonHelper from "./helpers/jsonHelper";
import ValidationHelper from "./helpers/validationHelper";
import { IotaAnchoringChannel } from "./iotaAnchoringChannel";
import { IotaVerifier } from "./iotaVerifier";
import { IChainVerificationResult } from "./models/IChainVerificationResult";
import { IFetchResult } from "./models/IFetchResult";
import { IIotaLinkedDataProof } from "./models/IIotaLinkedDataProof";
import { IJsonAnchoredDocument } from "./models/IJsonAnchoredDocument";
import { IJsonDocument } from "./models/IJsonDocument";
import { IJsonSignedDocument } from "./models/IJsonSignedDocument";

/**
 *  Linked Data Proof Verifier
 * 
 *  In the future it will also need to verify 
 * 
 */
export class IotaLdProofVerifier {
    /**
     * Verifies a JSON document
     * 
     * @param doc The JSON document
     * @param node The node against the proof is verified
     * 
     * @returns true or false with the verification result
     * 
     */
    public static async verifyJson(doc: IJsonAnchoredDocument | string, node: string): Promise<boolean> {
        const document = JsonHelper.getAnchoredDocument(doc);

        return (await this.doVerify(document, node)).result;
    }

    /**
     * Verifies a JSON-LD document
     * 
     * @param doc The JSON-LD document
     * @param node The node against the proof is verified
     * 
     * @returns true or false with the verification result
     * 
     */
    public static async verifyJsonLd(doc: IJsonAnchoredDocument | string, node: string): Promise<boolean> {
        const document = JsonHelper.getAnchoredJsonLdDocument(doc);

        return (await this.doVerify(document, node)).result;
    }

    public static async verifyJsonChain(docs: IJsonSignedDocument[] | string[],
        node: string): Promise<IChainVerificationResult> {
        
        return null;

    }

    public static async verifyJsonChainWithRoot(docs: IJsonDocument[] | string[],
        proof: IIotaLinkedDataProof,
        node: string): Promise<IChainVerificationResult> {

        const output: IChainVerificationResult = {
            verified: true,
            results: []
        };

        const proofDetails = proof.proofValue;

        let index = 0;
        let currentAnchorageID = proofDetails.anchorageID;

        for (const doc of docs) {
            const docProof = JSON.parse(JSON.stringify(proof));
            proof.proofValue.anchorageID = currentAnchorageID;

            doc["proof"] = docProof;

            const verificationResult = await this.doVerify(doc as unknown as IJsonAnchoredDocument, node);

            if (!verificationResult.result) {
                output.verified = false;
            }
            output.results[index++] = verificationResult.result;

            currentAnchorageID = verificationResult.fetchResult.msgID;

            delete doc["proof"];
        }

        return output;
    }

    private static async doVerify(document: IJsonAnchoredDocument, node: string): Promise<{
        result: boolean;
        fetchResult: IFetchResult
    }> {
        if (!ValidationHelper.url(node)) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_NODE,
                "The node has to be a URL");
        }

        const linkedDataProof = document.proof;
        const proofDetails = document.proof.proofValue;

        const channel = await IotaAnchoringChannel.create(node).bind(proofDetails.channelID);
        // From the channel the message is retrieved and then the Linked Data Signature provided
        const fetchResult = await channel.fetch(proofDetails.anchorageID, proofDetails.msgID);
        const linkedDataSignature = JSON.parse(fetchResult.msgID);

        // now assign the Linked Data Signature as proof
        document.proof = linkedDataSignature;

        let result: boolean;

        if (document["@context"]) {
            result = await IotaVerifier.verifyJsonLd({
                document: document as unknown as IJsonSignedDocument,
                node
            });
        }
        else {
            result = await IotaVerifier.verifyJson({
                document: document as unknown as IJsonSignedDocument,
                node
            });
        }


        // Restore the original document
        document.proof = linkedDataProof;

        return { result, fetchResult };
    }
}
