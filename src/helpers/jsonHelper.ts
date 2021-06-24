import AnchoringChannelError from "../errors/anchoringChannelError";
import AnchoringChannelErrorNames from "../errors/anchoringChannelErrorNames";
import { IJsonAnchoredDocument } from "../models/IJsonAnchoredDocument";
import { IJsonSignedDocument } from "../models/IJsonSignedDocument";
import { ILinkedDataProof } from "../models/ILinkedDataProof";
import { LinkedDataProofTypes } from "../models/linkedDataProofTypes";

export default class JsonHelper {
    public static getDocument(doc: Record<string, unknown> | string): Record<string, unknown> {
        if ((typeof doc !== "string" && typeof doc !== "object") || Array.isArray(doc)) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_DATA_TYPE,
                "Please provide a Javascript object or string in JSON format");
        }

        let document;

        if (typeof doc === "string") {
            try {
                document = JSON.parse(doc);
            } catch {
                throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_DATA_TYPE,
                    "Invalid JSON Format");
            }
        } else {
            document = JSON.parse(JSON.stringify(doc));
        }

        return document as Record<string, unknown>;
    }

    public static getSignedDocument(doc: Record<string, unknown> | string): IJsonSignedDocument {
        const result = this.getDocument(doc);

        if (!result.proof) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.JSON_DOC_NOT_SIGNED,
                "The provided JSON document does not include a Linked Data Signature");
        }

        return result as IJsonSignedDocument;
    }

    public static getJsonLdDocument(doc: Record<string, unknown> | string): Record<string, unknown> {
        const result = this.getDocument(doc);

        if (!result["@context"]) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_DATA_TYPE,
                "Not a JSON-LD document. Use 'signJson' instead");
        }

        return result;
    }

    public static getSignedJsonLdDocument(doc: Record<string, unknown> | string): IJsonSignedDocument {
        const result = this.getJsonLdDocument(doc);

        if (!result.proof) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.JSON_DOC_NOT_SIGNED,
                "The provided JSON-LD document does not include a Linked Data Signature");
        }

        return result as IJsonSignedDocument;
    }

    public static getAnchoredJsonLdDocument(doc: Record<string, unknown> | string): IJsonAnchoredDocument {
        const result = this.getJsonLdDocument(doc);

        if (!result.proof) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.JSON_DOC_NOT_SIGNED,
                "The provided JSON document does not include a proof");
        }

        const proofDetails = result.proof as ILinkedDataProof;

        if (proofDetails.type !== LinkedDataProofTypes.IOTA_LD_PROOF_2021) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.JSON_DOC_NOT_SIGNED,
                "The provided JSON document does not include an IOTA Linked Data Proof");
        }

        return result as IJsonAnchoredDocument;
    }

    public static getAnchoredDocument(doc: Record<string, unknown> | string): IJsonAnchoredDocument {
        const result = this.getJsonLdDocument(doc);

        if (!result.proof) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.JSON_DOC_NOT_SIGNED,
                "The provided JSON document does not include a proof");
        }

        const proofDetails = result.proof as ILinkedDataProof;

        if (proofDetails.type !== LinkedDataProofTypes.IOTA_LD_PROOF_2021) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.JSON_DOC_NOT_SIGNED,
                "The provided JSON document does not include an IOTA Linked Data Proof");
        }

        return result as IJsonAnchoredDocument;
    }

}
