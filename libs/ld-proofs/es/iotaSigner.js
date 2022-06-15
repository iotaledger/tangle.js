/* eslint-disable jsdoc/require-jsdoc */
// eslint-disable-next-line unicorn/prefer-node-protocol
import bs58 from "bs58";
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
        let secret = options.secret;
        if (typeof options.secret === "string") {
            secret = bs58.decode(options.secret);
        }
        const request = {
            didDocument: this._didDocument,
            type: SignatureTypes.ED25519_2018,
            method: options.verificationMethod,
            secret: secret,
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
            verificationMethod: `${this._didDocument.id()}#${options.verificationMethod}`,
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
            verificationMethod: `${this._didDocument.id()}#${options.verificationMethod}`,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVNpZ25lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhU2lnbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdDQUF3QztBQUd4Qyx3REFBd0Q7QUFDeEQsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBQ3hCLE9BQU8sS0FBSyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQ2pDLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUM1QixPQUFPLFlBQVksTUFBTSx1QkFBdUIsQ0FBQztBQUNqRCxPQUFPLGlCQUFpQixNQUFNLDRCQUE0QixDQUFDO0FBQzNELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3RFLE9BQU8sVUFBVSxNQUFNLHNCQUFzQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQy9ELE9BQU8sZ0JBQWdCLE1BQU0sNEJBQTRCLENBQUM7QUFNMUQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN6RCxPQUFPLFVBQVUsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQyxPQUFPLGNBQWMsTUFBTSwyQkFBMkIsQ0FBQztBQUd2RDs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxVQUFVO0lBS25CLFlBQW9CLEdBQVcsRUFBRSxXQUF3QjtRQUNyRCxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNoQixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztJQUNwQyxDQUFDO0lBRUQsSUFBVyxHQUFHO1FBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFXLEVBQUUsSUFBYTtRQUNqRCxJQUFJLElBQUksSUFBSSxD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