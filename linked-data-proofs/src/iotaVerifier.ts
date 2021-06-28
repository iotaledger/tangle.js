import { VerificationMethod } from "@iota/identity-wasm/node";
import bs58 from "bs58";
import * as crypto from "crypto";
import { eddsa as EdDSA } from "elliptic";
import * as jsonld from "jsonld";
import AnchoringChannelError from "./errors/anchoringChannelError";
import AnchoringChannelErrorNames from "./errors/anchoringChannelErrorNames";
import { JsonCanonicalization } from "./helpers/jsonCanonicalization";
import JsonHelper from "./helpers/jsonHelper";
import { customLdContextLoader } from "./helpers/jsonLdHelper";
import ValidationHelper from "./helpers/validationHelper";
import { IJsonSignedDocument } from "./models/IJsonSignedDocument";
import { IJsonVerificationRequest } from "./models/IJsonVerificationRequest";
import { IVerificationRequest } from "./models/IVerificationRequest";
import { LdContextURL } from "./models/ldContextURL";
import DidService from "./services/didService";

export class IotaVerifier {
    /**
     * Verifies a Ed25519 signature corresponding to a string message
     *
     * @param request The verification request
     *
     * @returns true or false depending on the verification result
     *
     */
    public static async verify(request: IVerificationRequest): Promise<boolean> {
        if (!ValidationHelper.url(request.node)) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_NODE,
                "The node has to be a URL");
        }

        if (!ValidationHelper.did(request.verificationMethod)) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_DID, "Invalid DID");
        }

        const resolution = await DidService.resolveMethod(request.node,
            request.verificationMethod);

        if (resolution.type !== "Ed25519VerificationKey2018") {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_DID_METHOD,
                "Only 'Ed25519VerificationKey2018' verification methods are allowed");
        }

        return this.verifySignature(request.signatureValue, request.message,
            resolution.toJSON().publicKeyBase58);
    }

    /**
     * Verifies a plain JSON document containing a Linked Data Signature
     *
     * @param request Verification request
     *
     * @returns true or false depending on the verification result
     */
    public static async verifyJson(request: IJsonVerificationRequest): Promise<boolean> {
        const document = JsonHelper.getSignedDocument(request.document);

        const resolution = await this.verificationMethod(request);

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
     * @param request Verification request
     *
     * @returns true or false depending on the verification result
     */
    public static async verifyJsonLd(request: IJsonVerificationRequest): Promise<boolean> {
        const document = JsonHelper.getSignedJsonLdDocument(request.document);

        const resolution = await this.verificationMethod(request);

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

    private static async verificationMethod(request: IJsonVerificationRequest): Promise<VerificationMethod> {
        if (request.node && !ValidationHelper.url(request.node)) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_NODE,
                "The node has to be a URL");
        }

        // Here the document has already been parsed
        const document = request.document as IJsonSignedDocument;
        const proof = document.proof;

        const verificationMethod = proof.verificationMethod;

        if (!ValidationHelper.did(verificationMethod)) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_DID, "Invalid DID");
        }

        const resolution = await DidService.resolveMethod(request.node, verificationMethod);

        if (resolution.type !== "Ed25519VerificationKey2018") {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_DID_METHOD,
                "Only 'Ed25519VerificationKey2018' verification methods are allowed");
        }

        return resolution;
    }

    private static verifySignature(signature: string, message: Buffer, publicKeyBase58: string): boolean {
        try {
            const signatureBytes = bs58.decode(signature);
            const publicKeyBytes = bs58.decode(publicKeyBase58);

            const ed25519 = new EdDSA("ed25519");
            const ecKey = ed25519.keyFromPublic(publicKeyBytes.toString("hex"), "hex");

            return (ecKey.verify(message, signatureBytes.toString("hex"))) as boolean;
        } catch (error) {
            console.log("Error while verifying signature:", error);
            return false;
        }
    }
}
