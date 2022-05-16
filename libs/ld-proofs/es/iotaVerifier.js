/* eslint-disable jsdoc/require-jsdoc */
import bs58 from "bs58";
// eslint-disable-next-line unicorn/prefer-node-protocol
import * as crypto from "crypto";
import pkg from "elliptic";
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
// eslint-disable-next-line @typescript-eslint/naming-convention
const { eddsa: EdDSA } = pkg;
export class IotaVerifier {
    /**
     * Verifies a Ed25519 signature corresponding to a string message.
     *
     * @param message The message to be verified.
     * @param signatureValue The signature value.
     * @param options The verification request.
     * @returns True or false depending on the verification result.
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
     * Verifies a JSON(-LD) document containing a Linked Data Signature.
     *
     * @param doc The document to verify.
     * @param options The verification options.
     * @returns True or false depending on the verification result.
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
     * Verifies a JSON document containing a Linked Data Signature.
     *
     * @param doc The document to verify.
     * @param options The verification options.
     * @returns True or false depending on the verification result.
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
     * Verifies a JSON-LD document containing a Linked Data Signature.
     *
     * @param doc The document to be verified.
     * @param options The verification options.
     * @returns True or false depending on the verifi.cation result.
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const docHash = crypto.createHash("sha512").update(docCanonical)
            .digest();
        const proofCanonical = await jsonld.canonize(proofOptions, canonizeOptions);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
            // eslint-disable-next-line no-console
            console.log("Error while verifying signature:", error);
            return false;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVZlcmlmaWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2lvdGFWZXJpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx3Q0FBd0M7QUFHeEMsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBQ3hCLHdEQUF3RDtBQUN4RCxPQUFPLEtBQUssTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUNqQyxPQUFPLEdBQUcsTUFBTSxVQUFVLENBQUM7QUFDM0IsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQzVCLE9BQU8sWUFBWSxNQUFNLHVCQUF1QixDQUFDO0FBQ2pELE9BQU8saUJBQWlCLE1BQU0sNEJBQTRCLENBQUM7QUFDM0QsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdEUsT0FBTyxVQUFVLE1BQU0sc0JBQXNCLENBQUM7QUFDOUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDL0QsT0FBTyxnQkFBZ0IsTUFBTSw0QkFBNEIsQ0FBQztBQUkxRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3pELE9BQU8sVUFBVSxNQUFNLHVCQUF1QixDQUFDO0FBRS9DLGdFQUFnRTtBQUNoRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUU3QixNQUFNLE9BQU8sWUFBWTtJQUNyQjs7Ozs7OztPQU9HO0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBZSxFQUFFLGNBQXNCLEVBQzlELE9BQTZCO1FBQzdCLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDckQsTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxZ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