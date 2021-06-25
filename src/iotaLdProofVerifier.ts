import AnchoringChannelError from "./errors/anchoringChannelError";
import AnchoringChannelErrorNames from "./errors/anchoringChannelErrorNames";
import JsonHelper from "./helpers/jsonHelper";
import ValidationHelper from "./helpers/validationHelper";
import { IotaAnchoringChannel } from "./iotaAnchoringChannel";
import { IotaVerifier } from "./iotaVerifier";
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

        return (await this.doVerify(document, node, false)).result;
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

        return (await this.doVerify(document, node, true)).result;
    }

    /**
     * Verifies a chain of JSON documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param node The node
     * @param strict
     * @returns The global verification result
     */
    public static async verifyJsonChain(docs: IJsonAnchoredDocument[] | string[],
        node: string, strict: boolean = true): Promise<boolean> {
        return this.doVerifyChain(docs, node, false, strict);
    }

    /**
     * Verifies a chain of JSON-LD documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param node The node
     * @param strict
     * @returns The global verification result
     */
    public static async verifyJsonLdChain(docs: IJsonAnchoredDocument[] | string[],
        node: string, strict: boolean = true): Promise<boolean> {
        return this.doVerifyChain(docs, node, true, strict);
    }

    /**
     * Verifies a list of JSON documents using the proof passed as parameter
     * The individual proofs of the events shall be found on the Channel specified
     *
     * @param docs The documents
     * @param proof The proof that points to the Channel used for verification
     * @param node The node
     *
     * @returns The global result of the verification
     */
    public static async verifyJsonChainSingleProof(docs: IJsonSignedDocument[] | string[],
        proof: IIotaLinkedDataProof,
        node: string): Promise<boolean> {
        return this.doVerifyChainSingleProof(docs, proof, node, false);
    }

    /**
     * Verifies a list of JSON-LD documents using the proof passed as parameter
     *
     * @param docs The documents
     * @param proof The proof that points to the Channel used for verification
     * @param node The node
     *
     * @returns The global result of the verification
     */
    public static async verifyJsonLdChainSingleProof(docs: IJsonSignedDocument[] | string[],
        proof: IIotaLinkedDataProof,
        node: string): Promise<boolean> {
        return this.doVerifyChainSingleProof(docs, proof, node, true);
    }

    /**
     * Verifies a chain of JSON(LD) documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param node The node
     * @param strict
     * @param jsonLd true if the documents must be treated as JSON-LD documents
     * @returns The global verification result
     */
    private static async doVerifyChain(docs: IJsonAnchoredDocument[] | string[],
        node: string,
        jsonLd: boolean): Promise<boolean> {
        const index = 0;
        // The channel where all the verifications shall happen
        let expectedChannelID: string;
        // The current anchorageID
        let expectedAnchorageID: string;

        for (const document of docs) {
            let doc;
            if (jsonLd) {
                doc = JsonHelper.getAnchoredJsonLdDocument(document);
            } else {
                doc = JsonHelper.getAnchoredDocument(document);
            }

            // The first one determines the expected values
            if (index === 0) {
                expectedChannelID = doc.proof.proofValue.channelID;
                expectedAnchorageID = doc.proof.proofValue.anchorageID;
            }

            const proofValue = doc.proof.proofValue;

            if (proofValue.channelID === expectedChannelID &&
                proofValue.anchorageID === expectedAnchorageID) {
                const verificationResult = await this.doVerify(doc, node, jsonLd);

                if (!verificationResult.result) {
                    return false;
                }

                expectedAnchorageID = verificationResult.fetchResult.msgID;
            } else {
                return false;
            }

            return true;
        }
    }

    private static async doVerifyChainSingleProof(docs: IJsonDocument[] | string[],
        proof: IIotaLinkedDataProof,
        node: string,
        jsonLd: boolean): Promise<boolean> {
        const proofDetails = proof.proofValue;

        let currentAnchorageID = proofDetails.anchorageID;

        let index = 0;
        for (const document of docs) {
            let doc;

            if (jsonLd) {
                doc = JsonHelper.getDocument(document);
            } else {
                doc = JsonHelper.getJsonLdDocument(document);
            }

            const docProof = JSON.parse(JSON.stringify(proof));
            // The anchorageID has to be updated for this new built proof
            proof.proofValue.anchorageID = currentAnchorageID;
            // The messageID is only relevant for the first one
            if (index++ !== 0) {
                delete proof.proofValue.msgID;
            }

            doc.proof = docProof;

            const verificationResult = await this.doVerify(doc as unknown as IJsonAnchoredDocument, node, jsonLd);

            if (!verificationResult.result) {
                return false;
            }

            currentAnchorageID = verificationResult.fetchResult.msgID;

            delete doc.proof;
        }

        return true;
    }

    private static async doVerify(document: IJsonAnchoredDocument, node: string, jsonLd: boolean): Promise<{
        result: boolean;
        fetchResult: IFetchResult;
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

        if (jsonLd) {
            result = await IotaVerifier.verifyJsonLd({
                document: document as unknown as IJsonSignedDocument,
                node
            });
        } else {
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
