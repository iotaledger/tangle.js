import * as crypto from "crypto";
import * as jsonld from "jsonld";
import LdProofError from "./errors/ldProofError";
import LdProofErrorNames from "./errors/ldProofErrorNames";
import { JsonCanonicalization } from "./helpers/jsonCanonicalization";
import JsonHelper from "./helpers/jsonHelper";
import { customLdContextLoader } from "./helpers/jsonLdHelper";
import ValidationHelper from "./helpers/validationHelper";
import { Document } from "./iotaIdentity";
import { IJsonDocument } from "./models/IJsonDocument";
import { ILinkedDataSignature } from "./models/ILinkedDataSignature";
import { ISigningOptions } from "./models/ISigningOptions";
import { ISigningRequest } from "./models/ISigningRequest";
import { ISigningResult } from "./models/ISigningResult";
import { LdContextURL } from "./models/ldContextURL";
import { SignatureTypes } from "./models/signatureTypes";
import DidService from "./services/didService";
import SigningService from "./services/signingService";

type DidDocument = InstanceType<typeof Document>;

/**
 *  It allows to sign and verify messages using a Verification Method provided by a DID
 *
 *  It generates and verifies EdDSA (Ed25519) signatures
 *
 */
export class IotaSigner {
    private readonly _did: string;

    private readonly _didDocument: DidDocument;

    private constructor(did: string, didDocument: DidDocument) {
        this._did = did;
        this._didDocument = didDocument;
    }

    public get did(): string {
        return this._did;
    }

    /**
     * Creates a new signer associating it with a particular decentralized identity
     *
     * @param did The DID that has the verification methods of the signer
     * @param node The node
     *
     * @returns The newly created signer
     */
    public static async create(did: string, node?: string): Promise<IotaSigner> {
        if (node && !ValidationHelper.url(node)) {
            throw new LdProofError(LdProofErrorNames.INVALID_NODE, "Node is not a URL");
        }

        if (!ValidationHelper.did(did)) {
            throw new LdProofError(LdProofErrorNames.INVALID_DID, "Invalid DID");
        }

        const didDoc = await DidService.resolve(node, did);

        return new IotaSigner(did, didDoc);
    }

    /**
     *
     * Signs a string message using the Ed25519 signature algorithm
     *
     * @param message The message
     * @param options The signing options
     *
     * @returns The signature details including its value encoded in Base58
     *
     */
    public async sign(message: Buffer, options: ISigningOptions): Promise<ISigningResult> {
        const request: ISigningRequest = {
            didDocument: this._didDocument,
            type: SignatureTypes.ED25519_2018,
            method: options.verificationMethod,
            secret: options.secret,
            message
        };

        const result = await SigningService.sign(request);

        return result;
    }

    /**
     * Signs a JSON(-LD) document
     *
     * @param doc The JSON(-LD) document as an object or as a string
     * @param options the parameters to use to generate the signature
     *
     * @returns The JSON document including its corresponding Linked Data Signature
     */
    public async signJson(doc: string | IJsonDocument, options: ISigningOptions): Promise<ILinkedDataSignature> {
        if (options.signatureType === SignatureTypes.JCS_ED25519_2020) {
            return this.doSignJson(doc, options);
        }

        if (options.signatureType === SignatureTypes.ED25519_2018) {
            return this.doSignJsonLd(doc, options);
        }

        // Otherwise exception is thrown
        throw new LdProofError(LdProofErrorNames.NOT_SUPPORTED_SIGNATURE,
            `Only '${SignatureTypes.JCS_ED25519_2020}' and '${SignatureTypes.ED25519_2018}' are supported`);
    }

    /**
     * Signs a JSON document
     *
     * @param doc The JSON document as an object or as a string
     * @param options the parameters to use to generate the signature
     *
     * @returns The JSON document including its corresponding Linked Data Signature
     */
    private async doSignJson(doc: string | IJsonDocument, options: ISigningOptions): Promise<ILinkedDataSignature> {
        const docToBeSigned = JsonHelper.getDocument(doc);

        if (options.signatureType !== SignatureTypes.JCS_ED25519_2020) {
            throw new LdProofError(LdProofErrorNames.NOT_SUPPORTED_SIGNATURE,
                "Only the 'JcsEd25519Signature2020' is supported");
        }

        const proof = {
            type: SignatureTypes.JCS_ED25519_2020,
            verificationMethod: `${this._didDocument.id}#${options.verificationMethod}`,
            proofPurpose: "dataVerification",
            created: new Date().toISOString()
        };

        // The canonicalization has to be performed over the whole object excluding the proof value
        docToBeSigned.proof = proof;

        // JSON Canonicalization Scheme
        const canonized = JsonCanonicalization.calculate(docToBeSigned);

        // We use SHA256 to calculate the digest as mandated by https://identity.foundation/JcsEd25519Signature2020/
        const digest = crypto.createHash("sha256").update(canonized)
            .digest();

        const signature = await this.sign(digest, options);

        // Finally restore the original object
        delete docToBeSigned.proof;

        return {
            proofValue: signature.signatureValue,
            ...proof
        };
    }

    /**
     *  Signs a JSON-LD document
     *
     * @param doc The JSON-LD document as an object or as a string
     * @param options the parameters to use to generate the signature
     *
     * @returns The Linked Data Signature represented as a Linked Data Proof
     *
     */
    private async doSignJsonLd(doc: string | IJsonDocument, options: ISigningOptions): Promise<ILinkedDataSignature> {
        const docToBeSigned = JsonHelper.getJsonLdDocument(doc);

        if (options.signatureType !== SignatureTypes.ED25519_2018) {
            throw new LdProofError(LdProofErrorNames.NOT_SUPPORTED_SIGNATURE,
                "Only the 'Ed25519Signature2018' is supported");
        }

        const canonizeOptions = {
            algorithm: "URDNA2015",
            format: "application/n-quads",
            documentLoader: customLdContextLoader
        };

        // RDF canonization algorithm over the document
        const canonized = await jsonld.canonize(docToBeSigned, canonizeOptions);

        const docHash = crypto
            .createHash("sha512").update(canonized)
            .digest();

        const proofOptionsLd = {
            "@context": LdContextURL.W3C_SECURITY,
            verificationMethod: `${this._didDocument.id}#${options.verificationMethod}`,
            created: new Date().toISOString()
        };

        const proofOptionsCanonized = await jsonld.canonize(proofOptionsLd, canonizeOptions);

        const proofOptionsHash = crypto
            .createHash("sha512").update(proofOptionsCanonized)
            .digest();

        const finalHash = Buffer.concat([docHash, proofOptionsHash]);

        const signature = await this.sign(finalHash, options);

        return {
            type: SignatureTypes.ED25519_2018,
            verificationMethod: proofOptionsLd.verificationMethod,
            proofValue: signature.signatureValue,
            proofPurpose: "dataVerification",
            created: proofOptionsLd.created
        };
    }
}
