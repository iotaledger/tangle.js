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
        if (resolution.type().toString() !== "Ed25519VerificationKey2018") {
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
        // Assumption is that multibase always represent Base58
        const result = this.verifySignature(proof.proofValue, hashToVerify, resolution.toJSON().publicKeyMultibase.slice(1));
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
        if (resolution.type().toString() !== "Ed25519VerificationKey2018") {
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