/* eslint-disable jsdoc/require-jsdoc */
// eslint-disable-next-line unicorn/prefer-node-protocol
import * as crypto from "crypto";
import * as jsonld from "jsonld";
import LdProofError from "./errors/ldProofError";
import LdProofErrorNames from "./errors/ldProofErrorNames";
import { JsonCanonicalization } from "./helpers/jsonCanonicalization";
import JsonHelper from "./helpers/jsonHelper";
import { customLdContextLoader } from "./helpers/jsonLdHelper";
import ValidationHelper from "./helpers/validationHelper";
import { LdContextURL } from "./models/ldContextURL";
import { SignatureTypes } from "./models/signatureTypes";
import DidService from "./services/didService";
import SigningService from "./services/signingService";
/**
 * It allows to sign and verify messages using a Verification Method provided by a DID.
 *
 * It generates and verifies EdDSA (Ed25519) signatures.
 *
 */
export class IotaSigner {
    constructor(did, didDocument) {
        this._did = did;
        this._didDocument = didDocument;
    }
    get did() {
        return this._did;
    }
    /**
     * Creates a new signer associating it with a particular decentralized identity.
     *
     * @param did The DID that has the verification methods of the signer.
     * @param node The node.
     * @returns The newly created signer.
     */
    static async create(did, node) {
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
     * Signs a string message using the Ed25519 signature algorithm.
     *
     * @param message The message.
     * @param options The signing options.
     * @returns The signature details including its value encoded in Base58.
     */
    async sign(message, options) {
        const request = {
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
     * Signs a JSON(-LD) document.
     *
     * @param doc The JSON(-LD) document as an object or as a string.
     * @param options The parameters to use to generate the signature.
     * @returns The JSON document including its corresponding Linked Data Signature.
     */
    async signJson(doc, options) {
        if (options.signatureType === SignatureTypes.JCS_ED25519_2020) {
            return this.doSignJson(doc, options);
        }
        if (options.signatureType === SignatureTypes.ED25519_2018) {
            return this.doSignJsonLd(doc, options);
        }
        // Otherwise exception is thrown
        throw new LdProofError(LdProofErrorNames.NOT_SUPPORTED_SIGNATURE, `Only '${SignatureTypes.JCS_ED25519_2020}' and '${SignatureTypes.ED25519_2018}' are supported`);
    }
    /**
     * Signs a JSON document.
     *
     * @param doc The JSON document as an object or as a string.
     * @param options The parameters to use to generate the signature.
     * @returns The JSON document including its corresponding Linked Data Signature.
     */
    async doSignJson(doc, options) {
        const docToBeSigned = JsonHelper.getDocument(doc);
        if (options.signatureType !== SignatureTypes.JCS_ED25519_2020) {
            throw new LdProofError(LdProofErrorNames.NOT_SUPPORTED_SIGNATURE, "Only the 'JcsEd25519Signature2020' is supported");
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
     * Signs a JSON-LD document.
     *
     * @param doc The JSON-LD document as an object or as a string.
     * @param options The parameters to use to generate the signature.
     * @returns The Linked Data Signature represented as a Linked Data Proof.
     */
    async doSignJsonLd(doc, options) {
        const docToBeSigned = JsonHelper.getJsonLdDocument(doc);
        if (options.signatureType !== SignatureTypes.ED25519_2018) {
            throw new LdProofError(LdProofErrorNames.NOT_SUPPORTED_SIGNATURE, "Only the 'Ed25519Signature2018' is supported");
        }
        const canonizeOptions = {
            algorithm: "URDNA2015",
            format: "application/n-quads",
            documentLoader: customLdContextLoader
        };
        // RDF canonization algorithm over the document
        const canonized = await jsonld.canonize(docToBeSigned, canonizeOptions);
        const docHash = crypto
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            .createHash("sha512").update(canonized)
            .digest();
        const proofOptionsLd = {
            "@context": LdContextURL.W3C_SECURITY,
            verificationMethod: `${this._didDocument.id}#${options.verificationMethod}`,
            created: new Date().toISOString()
        };
        const proofOptionsCanonized = await jsonld.canonize(proofOptionsLd, canonizeOptions);
        const proofOptionsHash = crypto
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVNpZ25lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhU2lnbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdDQUF3QztBQUd4Qyx3REFBd0Q7QUFDeEQsT0FBTyxLQUFLLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDakMsT0FBTyxLQUFLLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDakMsT0FBTyxZQUFZLE1BQU0sdUJBQXVCLENBQUM7QUFDakQsT0FBTyxpQkFBaUIsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN0RSxPQUFPLFVBQVUsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUMvRCxPQUFPLGdCQUFnQixNQUFNLDRCQUE0QixDQUFDO0FBTTFELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDekQsT0FBTyxVQUFVLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxjQUFjLE1BQU0sMkJBQTJCLENBQUM7QUFFdkQ7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQU8sVUFBVTtJQUtuQixZQUFvQixHQUFXLEVBQUUsV0FBd0I7UUFDckQsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDaEIsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7SUFDcEMsQ0FBQztJQUVELElBQVcsR0FBRztRQUNWLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBVyxFQUFFLElBQWE7UUFDakQsSUFBSSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMs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