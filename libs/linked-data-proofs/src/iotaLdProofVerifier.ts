import { IotaAnchoringChannel, IFetchResult, AnchoringChannelErrorNames }
    from "@tangle.js/anchoring-channels";
import LdProofError from "./errors/ldProofError";
import LdProofErrorNames from "./errors/ldProofErrorNames";
import JsonHelper from "./helpers/jsonHelper";
import ValidationHelper from "./helpers/validationHelper";
import { IotaVerifier } from "./iotaVerifier";
import { IIotaLinkedDataProof } from "./models/IIotaLinkedDataProof";
import { IJsonAnchoredDocument } from "./models/IJsonAnchoredDocument";
import { IJsonDocument } from "./models/IJsonDocument";
import { IJsonSignedDocument } from "./models/IJsonSignedDocument";
import ILdProofVerificationOptions from "./models/ILdProofVerificationOptions";

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
     * @param options The verification options
     *
     * @returns true or false with the verification result
     *
     */
    public static async verifyJson(doc: IJsonAnchoredDocument | string,
        options: ILdProofVerificationOptions): Promise<boolean> {
        const document = JsonHelper.getAnchoredDocument(doc);

        return (await this.doVerify(document, false, options)).result;
    }

    /**
     * Verifies a JSON-LD document
     *
     * @param doc The JSON-LD document
     * @param options The verification options
     *
     * @returns true or false with the verification result
     *
     */
    public static async verifyJsonLd(doc: IJsonAnchoredDocument | string,
        options: ILdProofVerificationOptions): Promise<boolean> {
        const document = JsonHelper.getAnchoredJsonLdDocument(doc);

        return (await this.doVerify(document, true, options)).result;
    }

    /**
     * Verifies a chain of JSON documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param options The verification options
     *
     * @returns The global verification result
     */
    public static async verifyJsonChain(docs: IJsonAnchoredDocument[] | string[],
        options: ILdProofVerificationOptions): Promise<boolean> {
        return this.doVerifyChain(docs, false, options);
    }

    /**
     * Verifies a chain of JSON-LD documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param options The verification options
     *
     * @returns The global verification result
     */
    public static async verifyJsonLdChain(docs: IJsonAnchoredDocument[] | string[],
        options: ILdProofVerificationOptions): Promise<boolean> {
        return this.doVerifyChain(docs, true, options);
    }

    /**
     * Verifies a list of JSON documents using the proof passed as parameter
     * The individual proofs of the events shall be found on the Channel specified
     *
     * @param docs The documents
     * @param proof The proof that points to the Channel used for verification
     * @param options The verification options
     *
     *
     * @returns The global result of the verification
     */
    public static async verifyJsonChainSingleProof(docs: IJsonSignedDocument[] | string[],
        proof: IIotaLinkedDataProof,
        options: ILdProofVerificationOptions): Promise<boolean> {
        return this.doVerifyChainSingleProof(docs, proof, false, options);
    }

    /**
     * Verifies a list of JSON-LD documents using the proof passed as parameter
     *
     * @param docs The documents
     * @param proof The proof that points to the Channel used for verification
     * @param options The verification options
     *
     * @returns The global result of the verification
     */
    public static async verifyJsonLdChainSingleProof(docs: IJsonSignedDocument[] | string[],
        proof: IIotaLinkedDataProof,
        options: ILdProofVerificationOptions): Promise<boolean> {
        return this.doVerifyChainSingleProof(docs, proof, true, options);
    }

    /**
     * Verifies a chain of JSON(LD) documents ensuring that are anchored to the same channel
     * and in the order implicit in the list
     * @param docs The chain of documents to verify
     * @param jsonLd true if the documents must be treated as JSON-LD documents
     * @param options the verification options
     *
     * @returns The global verification result
     */
    private static async doVerifyChain(docs: IJsonAnchoredDocument[] | string[],
        jsonLd: boolean,
        options: ILdProofVerificationOptions
    ): Promise<boolean> {
        const documents: IJsonAnchoredDocument[] = [];

        // The anchored documents are obtained
        for (const document of docs) {
            let doc;
            if (jsonLd) {
                doc = JsonHelper.getAnchoredJsonLdDocument(document);
            } else {
                doc = JsonHelper.getAnchoredDocument(document);
            }

            documents.push(doc);
        }

        // The Channel will be used to verify the proofs
        const channelID = documents[0].proof.proofValue.channelID;
        const channel = await IotaAnchoringChannel.create(options.node).bind(channelID);

        let index = 0;
        const verificationOptions = {
            ...options,
            channel
        };

        for (const document of documents) {
            const proofValue = document.proof.proofValue;

            // If the channel is not the expected the verification fails
            if (proofValue.channelID !== channelID) {
                return false;
            }

            // The first needs to properly position on the channel
            if (index === 0) {
                verificationOptions.strict = false;
            } else {
                verificationOptions.strict = options.strict;
            }

            const verificationResult = await this.doVerify(document, jsonLd, verificationOptions);

            if (!verificationResult.result) {
                return false;
            }

            index++;
        }
        return true;
    }

    private static async doVerifyChainSingleProof(docs: IJsonDocument[] | string[],
        proof: IIotaLinkedDataProof,
        jsonLd: boolean,
        options: ILdProofVerificationOptions): Promise<boolean> {
        const proofDetails = proof.proofValue;

        let currentAnchorageID = proofDetails.anchorageID;

        const documents: IJsonDocument[] = [];

        for (const document of docs) {
            let doc;

            if (jsonLd) {
                doc = JsonHelper.getDocument(document);
            } else {
                doc = JsonHelper.getJsonLdDocument(document);
            }

            documents.push(doc);
        }

        const channelID = proofDetails.channelID;
        const channel = await IotaAnchoringChannel.create(options.node).bind(channelID);

        const verificationOptions: ILdProofVerificationOptions = {
            node: options.node,
            channel,
            strict: true
        };

        let index = 0;
        for (const doc of documents) {
            const docProof = JSON.parse(JSON.stringify(proof));
            // The anchorageID has to be updated for this new built proof
            proof.proofValue.anchorageID = currentAnchorageID;
            // The messageID is only relevant for the first one
            if (index++ !== 0) {
                delete proof.proofValue.msgID;
                // First verification is not strict as we have to position on the channel
                verificationOptions.strict = false;
            } else {
                verificationOptions.strict = true;
            }

            doc.proof = docProof;

            const verificationResult = await this.doVerify(doc as unknown as IJsonAnchoredDocument,
                jsonLd,
                verificationOptions
            );

            if (!verificationResult.result) {
                return false;
            }

            currentAnchorageID = verificationResult.fetchResult.msgID;

            delete doc.proof;
        }

        return true;
    }

    private static async doVerify(document: IJsonAnchoredDocument,
        jsonLd: boolean,
        options: ILdProofVerificationOptions): Promise<{
            result: boolean;
            fetchResult?: IFetchResult;
        }> {
        if (!ValidationHelper.url(options.node)) {
            throw new LdProofError(LdProofErrorNames.INVALID_NODE,
                "The node has to be a URL");
        }

        const linkedDataProof = document.proof;
        const proofDetails = document.proof.proofValue;

        let fetchResult: IFetchResult;

        let channel = options.channel;
        if (!channel) {
            channel = await IotaAnchoringChannel.create(options.node).bind(proofDetails.channelID);
        }

        try {
            // In strict mode we just receive the message
            if (options.strict) {
                fetchResult = await channel.receive(proofDetails.msgID, proofDetails.anchorageID);
            } else {
                // In non strict mode we can jump to the right anchorage
                fetchResult = await channel.fetch(proofDetails.anchorageID, proofDetails.msgID);
            }
        } catch (error) {
            if (error.name === AnchoringChannelErrorNames.MSG_NOT_FOUND) {
                return { result: false };
            }

            throw error;
        }

        const linkedDataSignature = JSON.parse(fetchResult.message);

        // now assign the Linked Data Signature as proof
        document.proof = linkedDataSignature;

        let result: boolean;

        if (jsonLd) {
            result = await IotaVerifier.verifyJsonLd({
                document: document as unknown as IJsonSignedDocument,
                node: options.node
            });
        } else {
            result = await IotaVerifier.verifyJson({
                document: document as unknown as IJsonSignedDocument,
                node: options.node
            });
        }

        // Restore the original document
        document.proof = linkedDataProof;

        return { result, fetchResult };
    }
}
