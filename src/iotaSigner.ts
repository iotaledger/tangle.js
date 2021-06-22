import { Document as DidDocument } from "@iota/identity-wasm/node";
import * as crypto from "crypto";
import * as jsonld from "jsonld";
import AnchoringChannelError from "./errors/anchoringChannelError";
import AnchoringChannelErrorNames from "./errors/anchoringChannelErrorNames";
import { JsonCanonicalization } from "./helpers/jsonCanonicalization";
import JsonHelper from "./helpers/jsonHelper";
import { customLdContextLoader } from "./helpers/jsonLdHelper";
import ValidationHelper from "./helpers/validationHelper";
import { ILinkedDataSignature } from "./models/ILinkedDataSignature";
import { ISigningRequest } from "./models/ISigningRequest";
import { ISigningResult } from "./models/ISigningResult";
import { LdContextURL } from "./models/ldContextURL";
import { SignatureTypes } from "./models/signatureTypes";
import DidService from "./services/didService";
import SigningService from "./services/signingService";

/**
 *  It allows to sign and verify messages using a Verification Method provided by a DID
 *
 *  It generates and verifies EdDSA (Ed25519) signatures
 *
 */
export default class IotaSigner {
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
     * @param node The node
     *
     * @param did The DID that has the verification methods of the signer
     *
     * @returns The newly created signer
     */
    public static async create(node: string, did: string): Promise<IotaSigner> {
        if (!ValidationHelper.url(node)) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_NODE, "Node is not a URL");
        }

        if (!ValidationHelper.did(did)) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_DID, "Invalid DID");
        }

        const didDoc = await DidService.resolve(node, did);

        return new IotaSigner(did, didDoc);
    }

    /**
     *
     * Signs a string message using the Ed25519 signature algorithm
     *
     * @param message The message
     * @param method The method used for signing (referred as a DID fragment identifier)
     * @param secret The secret
     *
     * @returns The signature details including its value encoded in Base58
     *
     */
    public async sign(message: Buffer, method: string, secret: string): Promise<ISigningResult> {
        const request: ISigningRequest = {
            didDocument: this._didDocument,
            type: SignatureTypes.ED25519_2018,
            method,
            secret,
            message
        };

        const result = await SigningService.sign(request);

        return result;
    }

    /**
     * Signs a JSON document
     *
     * @param doc The JSON document as an object or as a string
     * @param verificationMethod  Verification method
     * @param secret The secret
     * @param signatureType The type of signature to be generated
     *
     * @returns The JSON document including its corresponding Linked Data Signature
     */
    public async signJson(doc: string | Record<string, unknown>, verificationMethod: string,
        secret: string, signatureType = SignatureTypes.JCS_ED25519_2020): Promise<ILinkedDataSignature> {

        const docToBeSigned = JsonHelper.getDocument(doc);

        if (signatureType !== SignatureTypes.JCS_ED25519_2020) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.NOT_SUPPORTED_SIGNATURE,
                "Only the 'JcsEd25519Signature2020' is supported");
        }

        const proof = {
            type: SignatureTypes.JCS_ED25519_2020,
            verificationMethod: `${this._didDocument.id}#${verificationMethod}`,
            proofPurpose: "dataVerification",
            created: new Date().toISOString()
        };

        // The canonicalization has to be performed over the whole object excluding the proof value
        docToBeSigned.proof = proof;

        // JSON Canonicalization Scheme
        const canonized = JsonCanonicalization.calculate(docToBeSigned);

        // We use SHA256 to calculate the digest as mandated by https://identity.foundation/JcsEd25519Signature2020/
        const digest = crypto.createHash("sha256").update(canonized).digest();

        const signature = await this.sign(digest, verificationMethod, secret);

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
     * @param verificationMethod  Verification method
     * @param secret The secret
     * @param signatureType The type of signature to be generated (by default 'Ed25519Signature2018')
     *
     * @returns The Linked Data Signature represented as a Linked Data Proof
     *
     */
    public async signJsonLd(doc: string | Record<string, unknown>, verificationMethod: string, secret: string,
        signatureType = SignatureTypes.ED25519_2018): Promise<ILinkedDataSignature> {

        const docToBeSigned = JsonHelper.getJsonLdDocument(doc);

        if (signatureType !== SignatureTypes.ED25519_2018) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.NOT_SUPPORTED_SIGNATURE,
                "Only the 'Ed25519Signature2018' is supported");
        }

        const canonizeOptions = {
            algorithm: "URDNA2015",
            format: "application/n-quads",
            documentLoader: customLdContextLoader
        };

        // RDF canonization algorithm over the document
        const canonized = await jsonld.canonize(docToBeSigned, canonizeOptions);

        const docHash = crypto.
                            createHash("sha512").update(canonized).digest();

        const proofOptionsLd = {
            "@context": LdContextURL.W3C_SECURITY,
            verificationMethod: `${this._didDocument.id}#${verificationMethod}`,
            created: new Date().toISOString()
        };

        const proofOptionsCanonized = await jsonld.canonize(proofOptionsLd, canonizeOptions);

        const proofOptionsHash = crypto.
                                    createHash("sha512").update(proofOptionsCanonized).digest();

        const finalHash = Buffer.concat([docHash, proofOptionsHash]);

        const signature = await this.sign(finalHash, verificationMethod, secret);

        return {
            type: SignatureTypes.ED25519_2018,
            verificationMethod: proofOptionsLd.verificationMethod,
            proofValue: signature.signatureValue,
            proofPurpose: "dataVerification",
            created: proofOptionsLd.created
        };
    }
}
