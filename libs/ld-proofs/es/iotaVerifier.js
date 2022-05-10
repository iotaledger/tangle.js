import bs58 from "bs58";
import * as crypto from "crypto";
import { eddsa as EdDSA } from "elliptic";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVZlcmlmaWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2lvdGFWZXJpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFDeEIsT0FBTyxLQUFLLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDakMsT0FBTyxFQUFFLEtBQUssSUFBSSxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDMUMsT0FBTyxLQUFLLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDakMsT0FBTyxZQUFZLE1BQU0sdUJBQXVCLENBQUM7QUFDakQsT0FBTyxpQkFBaUIsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN0RSxPQUFPLFVBQVUsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUMvRCxPQUFPLGdCQUFnQixNQUFNLDRCQUE0QixDQUFDO0FBSTFELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDekQsT0FBTyxVQUFVLE1BQU0sdUJBQXVCLENBQUM7QUFFL0MsTUFBTSxPQUFPLFlBQVk7SUFDckI7Ozs7Ozs7Ozs7T0FVRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQWUsRUFBRSxjQUFzQixFQUM5RCxPQUE2QjtRQUM3QixJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3JELE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUNqRCwwQkFBMEIsQ0FBQyxDQUFDO1NBQ25DO1FBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdB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