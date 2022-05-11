import bs58 from "bs58";
import * as crypto from "crypto";
import pkg from 'elliptic';
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
const { eddsa: EdDSA } = pkg;
export class IotaVerifier {
    /**
     * Verifies a Ed25519 signature corresponding to a string message
     *
     * @param  message the message to be verified
     * @param  signatureValue the signature value
     *
     * @param options The verification request
     *
     * @returns true or false depending on the verification result
     *
     */
    static async verify(message, signatureValue, options) {
        if (options.node && !ValidationHelper.url(options.node)) {
            throw new LdProofError(LdProofErrorNames.INVALID_NODE, "The node has to be a URL");
        }
        if (!ValidationHelper.did(options.verificationMethod)) {
            throw new LdProofError(LdProofErrorNames.INVALID_DID, "Invalid DID");
        }
        const resolution = await DidService.resolveMethod(options?.node, options.verificationMethod);
        if (resolution.type !== "Ed25519VerificationKey2018") {
            throw new LdProofError(LdProofErrorNames.INVALID_DID_METHOD, "Only 'Ed25519VerificationKey2018' verification methods are allowed");
        }
        return this.verifySignature(signatureValue, message, resolution.toJSON().publicKeyBase58);
    }
    /**
     * Verifies a JSON(-LD) document containing a Linked Data Signature
     *
     * @param doc The document to verify
     * @param options The verification options
     *
     * @returns true or false depending on the verification result
     */
    static async verifyJson(doc, options) {
        const document = JsonHelper.getSignedDocument(doc);
        if (document.proof.type === SignatureTypes.JCS_ED25519_2020) {
            return this.doVerifyJson(document, options);
        }
        if (document.proof.type === SignatureTypes.ED25519_2018) {
            return this.doVerifyJsonLd(document, options);
        }
        // Otherwise exception is thrown
        throw new LdProofError(LdProofErrorNames.NOT_SUPPORTED_SIGNATURE, `Only '${SignatureTypes.JCS_ED25519_2020}' and '${SignatureTypes.ED25519_2018}' are supported`);
    }
    /**
     * Verifies a JSON document containing a Linked Data Signature
     *
     * @param doc The document to verify
     * @param options The verification options
     *
     * @returns true or false depending on the verification result
     */
    static async doVerifyJson(doc, options) {
        const document = JsonHelper.getSignedDocument(doc);
        const resolution = await this.verificationMethod(document, options?.node);
        const proof = document.proof;
        // After removing the proofValue we obtain the canonical form and that will be verified
        const proofValue = proof.proofValue;
        delete proof.proofValue;
        const canonical = JsonCanonicalization.calculate(document);
        const msgHash = crypto
            .createHash("sha256").update(canonical)
            .digest();
        const result = this.verifySignature(proofValue, msgHash, resolution.toJSON().publicKeyBase58);
        // Restore the proof value
        proof.proofValue = proofValue;
        return result;
    }
    /**
     * Verifies a JSON-LD document containing a Linked Data Signature
     *
     * @param doc The document to be verified
     * @param options The verification options
     * @returns true or false depending on the verification result
     */
    static async doVerifyJsonLd(doc, options) {
        const document = JsonHelper.getSignedJsonLdDocument(doc);
        const resolution = await this.verificationMethod(document, options?.node);
        const proof = document.proof;
        const proofOptions = {
            "@context": LdContextURL.W3C_SECURITY,
            verificationMethod: proof.verificationMethod,
            created: proof.created
        };
        // Remove the document proof to calculate the canonization without the proof
        delete document.proof;
        const canonizeOptions = {
            algorithm: "URDNA2015",
            format: "application/n-quads",
            documentLoader: customLdContextLoader
        };
        const docCanonical = await jsonld.canonize(document, canonizeOptions);
        const docHash = crypto.createHash("sha512").update(docCanonical)
            .digest();
        const proofCanonical = await jsonld.canonize(proofOptions, canonizeOptions);
        const proofHash = crypto.createHash("sha512").update(proofCanonical)
            .digest();
        const hashToVerify = Buffer.concat([docHash, proofHash]);
        const result = this.verifySignature(proof.proofValue, hashToVerify, resolution.toJSON().publicKeyBase58);
        // Restore the proof value on the original document
        document.proof = proof;
        return result;
    }
    static async verificationMethod(document, node) {
        if (node && !ValidationHelper.url(node)) {
            throw new LdProofError(LdProofErrorNames.INVALID_NODE, "The node has to be a URL");
        }
        const proof = document.proof;
        const verificationMethod = proof.verificationMethod;
        if (!ValidationHelper.did(verificationMethod)) {
            throw new LdProofError(LdProofErrorNames.INVALID_DID, "Invalid DID");
        }
        const resolution = await DidService.resolveMethod(node, verificationMethod);
        if (resolution.type !== "Ed25519VerificationKey2018") {
            throw new LdProofError(LdProofErrorNames.INVALID_DID_METHOD, "Only 'Ed25519VerificationKey2018' verification methods are allowed");
        }
        return resolution;
    }
    static verifySignature(signature, message, publicKeyBase58) {
        try {
            const signatureBytes = bs58.decode(signature);
            const publicKeyBytes = bs58.decode(publicKeyBase58);
            const ed25519 = new EdDSA("ed25519");
            const ecKey = ed25519.keyFromPublic(publicKeyBytes.toString("hex"), "hex");
            return (ecKey.verify(message, signatureBytes.toString("hex")));
        }
        catch (error) {
            console.log("Error while verifying signature:", error);
            return false;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVZlcmlmaWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2lvdGFWZXJpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFDeEIsT0FBTyxLQUFLLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDakMsT0FBTyxHQUFHLE1BQU0sVUFBVSxDQUFDO0FBQzNCLE9BQU8sS0FBSyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQ2pDLE9BQU8sWUFBWSxNQUFNLHVCQUF1QixDQUFDO0FBQ2pELE9BQU8saUJBQWlCLE1BQU0sNEJBQTRCLENBQUM7QUFDM0QsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdEUsT0FBTyxVQUFVLE1BQU0sc0JBQXNCLENBQUM7QUFDOUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDL0QsT0FBTyxnQkFBZ0IsTUFBTSw0QkFBNEIsQ0FBQztBQUkxRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3pELE9BQU8sVUFBVSxNQUFNLHVCQUF1QixDQUFDO0FBRS9DLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDO0FBRTdCLE1BQU0sT0FBTyxZQUFZO0lBQ3JCOzs7Ozs7Ozs7O09BVUc7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFlLEVBQUUsY0FBc0IsRUFDOUQsT0FBNkI7UUFDN0IsSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNyRCxNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFDakQsMEJBQTBCLENBQUMsQ0FBQztTQUNu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