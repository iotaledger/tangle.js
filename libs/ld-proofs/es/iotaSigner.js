/* eslint-disable jsdoc/require-jsdoc */
// eslint-disable-next-line unicorn/prefer-node-protocol
import * as crypto from "crypto";
import jsonld from "jsonld";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVNpZ25lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhU2lnbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdDQUF3QztBQUd4Qyx3REFBd0Q7QUFDeEQsT0FBTyxLQUFLLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDakMsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQzVCLE9BQU8sWUFBWSxNQUFNLHVCQUF1QixDQUFDO0FBQ2pELE9BQU8saUJBQWlCLE1BQU0sNEJBQTRCLENBQUM7QUFDM0QsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdEUsT0FBTyxVQUFVLE1BQU0sc0JBQXNCLENBQUM7QUFDOUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDL0QsT0FBTyxnQkFBZ0IsTUFBTSw0QkFBNEIsQ0FBQztBQU0xRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3pELE9BQU8sVUFBVSxNQUFNLHVCQUF1QixDQUFDO0FBQy9DLE9BQU8sY0FBYyxNQUFNLDJCQUEyQixDQUFDO0FBR3ZEOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFPLFVBQVU7SUFLbkIsWUFBb0IsR0FBVyxFQUFFLFdBQXdCO1FBQ3JELElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxJQUFXLEdBQUc7UUFDVixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQVcsRUFBRSxJQUFhO1FBQ2pELElBQUksSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUks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