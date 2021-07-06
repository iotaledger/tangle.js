import { IotaAnchoringChannel, IFetchResult, AnchoringChannelErrorNames, SeedHelper }
    from "@tangle.js/anchors";
import LdProofError from "./errors/ldProofError";
import LdProofErrorNames from "./errors/ldProofErrorNames";
import JsonHelper from "./helpers/jsonHelper";
import ValidationHelper from "./helpers/validationHelper";
import { IotaVerifier } from "./iotaVerifier";
import { IIotaLinkedDataProof } from "./models/IIotaLinkedDataProof";
import { IJsonAnchoredDocument } from "./models/IJsonAnchoredDocument";
import { IJsonDocument } from "./models/IJsonDocument";
import { IJsonSignedDocument } from "./models/IJsonSignedDocument";
import { ILdProofVerificationOptions } from "./models/ILdProofVerificationOptions";

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
        options?: ILdProofVerificationOptions): Promise<boolean> {
        let document: IJsonAnchoredDocument;

        try {
            document = JsonHelper.getAnchoredDocument(doc);
        } catch (error) {
            if (error.name === LdProofErrorNames.JSON_DOC_NOT_SIGNED) {
                return false;
            }

            throw error;
        }

        return this.doVerifyDoc(document, false, undefined, options);
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
        options?: ILdProofVerificationOptions): Promise<boolean> {
        let document: IJsonAnchoredDocument;

        try {
            document = JsonHelper.getAnchoredJsonLdDocument(doc);
        } catch (error) {
            if (error.name === LdProofErrorNames.JSON_DOC_NOT_SIGNED) {
                return false;
            }

            throw error;
        }

        return this.doVerifyDoc(document, true, undefined, options);
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
        options?: ILdProofVerificationOptions): Promise<boolean> {
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
        options?: ILdProofVerificationOptions): Promise<boolean> {
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
    public static async verifyJsonChainSingleProof(docs: IJsonDocument[] | string[],
        proof: IIotaLinkedDataProof,
        options?: ILdProofVerificationOptions): Promise<boolean> {
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
    public static async verifyJsonLdChainSingleProof(docs: IJsonDocument[] | string[],
        proof: IIotaLinkedDataProof,
        options?: ILdProofVerificationOptions): Promise<boolean> {
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
        options?: ILdProofVerificationOptions
    ): Promise<boolean> {
        const documents: IJsonAnchoredDocument[] = [];

        // The anchored documents are obtained
        for (const document of docs) {
            let doc;
            try {
                if (jsonLd) {
                    doc = JsonHelper.getAnchoredJsonLdDocument(document);
                } else {
                    doc = JsonHelper.getAnchoredDocument(document);
                }
            } catch (error) {
                if (error.name === LdProofErrorNames.JSON_DOC_NOT_SIGNED) {
                    return false;
                }
                throw error;
            }

            documents.push(doc);
        }

        const node = options?.node;

        // The Channel will be used to verify the proofs
        const channelID = documents[0].proof.proofValue.channelID;
        let channel: IotaAnchoringChannel;

        // If channel cannot be bound the proof will fail
        try {
            channel = await IotaAnchoringChannel.fromID(channelID, { node }).bind(SeedHelper.generateSeed());
        } catch (error) {
            if (error.name === AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR) {
                return false;
            }

            throw error;
        }

        let index = 0;
        const verificationOptions: ILdProofVerificationOptions = {
            ...options
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
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
            } else if (options && options.strict === false) {
                verificationOptions.strict = false;
            } else {
                verificationOptions.strict = true;
            }

            const verificationResult = await this.doVerifyChainedDoc(document, jsonLd, channel, verificationOptions);

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
        options?: ILdProofVerificationOptions): Promise<boolean> {
        const proofDetails = proof.proofValue;

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

        let isStrict = true;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
        if (options?.strict === false) {
            isStrict = false;
        }

        const channelID = proofDetails.channelID;
        let channel: IotaAnchoringChannel;
        try {
            channel = await IotaAnchoringChannel.fromID(channelID, options).bind(SeedHelper.generateSeed());
        } catch (error) {
            if (error.name === AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR) {
                return false;
            }

            throw error;
        }

        // Clone it to use it locally
        const docProof = JSON.parse(JSON.stringify(proof));
        const doc = documents[0] as unknown as IJsonAnchoredDocument;
        doc.proof = docProof;
        // First document is verified as single document
        const verificationResult = await this.doVerifyDoc(
            doc,
            jsonLd,
            channel,
            options
        );

        // Restore the original document
        delete doc.proof;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
        if (verificationResult === false) {
            return false;
        }

        // In strict mode we should test the anchorageID but unfortunately that is a IOTA Streams limitation
        // let currentAnchorageID = verificationResult.fetchResult.msgID;

        // Verification of the rest of documents
        for (let index = 1; index < documents.length; index++) {
            const aDoc = documents[index] as IJsonSignedDocument;

            let fetchResult = await channel.fetchNext();

            let verified = false;
            while (!verified && fetchResult) {
                const linkedDataSignature = JSON.parse(fetchResult.message.toString());

                // now assign the Linked Data Signature as proof
                aDoc.proof = linkedDataSignature;

                if (jsonLd) {
                    verified = await IotaVerifier.verifyJsonLd(
                        aDoc,
                        { node: options?.node }
                    );
                } else {
                    verified = await IotaVerifier.verifyJson(
                        aDoc,
                        { node: options?.node }
                    );
                }

                if (!verified) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
                    if (isStrict === false) {
                        fetchResult = await channel.fetchNext();
                    } else {
                        return false;
                    }
                }
            }

            if (!verified || !fetchResult) {
                return false;
            }

            delete aDoc.proof;
        }

        return true;
    }

    private static async doVerifyDoc(document: IJsonAnchoredDocument,
        jsonLd: boolean,
        channel?: IotaAnchoringChannel,
        options?: ILdProofVerificationOptions): Promise<boolean> {
        if (options?.node && !ValidationHelper.url(options.node)) {
            throw new LdProofError(LdProofErrorNames.INVALID_NODE,
                "The node has to be a URL");
        }

        const proofDetails = document.proof.proofValue;

        let fetchResult;

        let targetChannel: IotaAnchoringChannel = channel;

        try {
            if (!channel) {
                targetChannel = await IotaAnchoringChannel.fromID(
                    proofDetails.channelID, options).bind(SeedHelper.generateSeed());
            }
            fetchResult = await targetChannel.fetch(proofDetails.anchorageID, proofDetails.msgID);
        } catch (error) {
            if (error.name === AnchoringChannelErrorNames.MSG_NOT_FOUND ||
                error.name === AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND ||
                error.name === AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR) {
                return false;
            }

            // If it is not the controlled error the error is thrown
            throw error;
        }

        const linkedDataSignature = JSON.parse(fetchResult.message.toString());

        // now assign the Linked Data Signature as proof
        document.proof = linkedDataSignature;

        let result: boolean;

        if (jsonLd) {
            result = await IotaVerifier.verifyJsonLd(
                document as unknown as IJsonSignedDocument,
                { node: options?.node }
            );
        } else {
            result = await IotaVerifier.verifyJson(
                document as unknown as IJsonSignedDocument,
                { node: options?.node }
            );
        }

        return result;
    }

    private static async doVerifyChainedDoc(document: IJsonAnchoredDocument,
        jsonLd: boolean,
        channel: IotaAnchoringChannel,
        options?: ILdProofVerificationOptions): Promise<{
            result: boolean;
            fetchResult?: IFetchResult;
        }> {
        if (options?.node && !ValidationHelper.url(options.node)) {
            throw new LdProofError(LdProofErrorNames.INVALID_NODE,
                "The node has to be a URL");
        }

        const linkedDataProof = document.proof;
        const proofDetails = document.proof.proofValue;

        let fetchResult: IFetchResult;

        const targetMsgID = proofDetails.msgID;

        try {
            // In strict mode we just fetch the next message
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
            if (!options || options.strict === undefined || options.strict === true) {
                fetchResult = await channel.fetchNext();
            } else {
                fetchResult = await channel.fetchNext();
                while (fetchResult && fetchResult.msgID !== targetMsgID) {
                    fetchResult = await channel.fetchNext();
                }
            }
        } catch (error) {
            if (error.name === AnchoringChannelErrorNames.MSG_NOT_FOUND) {
                return { result: false };
            }

            throw error;
        }

        // If this is not the message expected the verification has failed
        if (!fetchResult || fetchResult.msgID !== targetMsgID) {
            return { result: false };
        }

        const linkedDataSignature = JSON.parse(fetchResult.message.toString());

        // now assign the Linked Data Signature as proof
        document.proof = linkedDataSignature;

        let result: boolean;

        if (jsonLd) {
            result = await IotaVerifier.verifyJsonLd(
                document as unknown as IJsonSignedDocument,
                { node: options?.node }
            );
        } else {
            result = await IotaVerifier.verifyJson(
                document as unknown as IJsonSignedDocument,
                { node: options?.node }
            );
        }

        // Restore the original document
        document.proof = linkedDataProof;

        return { result, fetchResult };
    }
}
