/* eslint-disable jsdoc/require-jsdoc */

import type { VerificationMethod } from "@iota/identity-wasm/node/identity_wasm.js";
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
import type { IJsonSignedDocument } from "./models/IJsonSignedDocument";
import type { IJsonVerificationOptions } from "./models/IJsonVerificationOptions";
import type { IVerificationOptions } from "./models/IVerificationOptions";
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
    public static async verify(message: Buffer, signatureValue: string,
        options: IVerificationOptions): Promise<boolean> {
        if (options.node && !ValidationHelper.url(options.node)) {
            throw new LdProofError(LdProofErrorNames.INVALID_NODE,
                "The node has to be a URL");
        }

        if (!ValidationHelper.did(options.verificationMethod)) {
            throw new LdProofError(LdProofErrorNames.INVALID_DID, "Invalid DID");
        }

        const resolution = await DidService.resolveMethod(options?.node,
            options.verificationMethod);

        if (resolution.type().toString() !== "Ed25519VerificationKey2018") {
            throw new LdProofError(LdProofErrorNames.INVALID_VERIFICATION_METHOD,
                "Only 'Ed25519VerificationKey2018' verification methods are allowed");
        }

        const publicKey = DidService.extractPublicKey(resolution);

        // Only works with multibase keys which are actually encoded using Base58
        return this.verifySignature(signatureValue, message, publicKey);
    }

    /**
     * Verifies a JSON(-LD) document containing a Linked Data Signature.
     *
     * @param doc The document to verify.
     * @param options The verification options.
     * @returns True or false depending on the verification result.
     */
    public static async verifyJson(doc: IJsonSignedDocument | string,
        options?: IJsonVerificationOptions): Promise<boolean> {
        const document = JsonHelper.getSignedDocument(doc);
        if (document.proof.type === SignatureTypes.JCS_ED25519_2020) {
            return this.doVerifyJson(document, options);
        }

        if (document.proof.type === SignatureTypes.ED25519_2018) {
            return this.doVerifyJsonLd(document, options);
        }

        // Otherwise exception is thrown
        throw new LdProofError(LdProofErrorNames.NOT_SUPPORTED_SIGNATURE,
            `Only '${SignatureTypes.JCS_ED25519_2020}' and '${SignatureTypes.ED25519_2018}' are supported`);
    }

    /**
     * Verifies a JSON document containing a Linked Data Signature.
     *
     * @param doc The document to verify.
     * @param options The verification options.
     * @returns True or false depending on the verification result.
     */
    private static async doVerifyJson(doc: IJsonSignedDocument | string,
        options?: IJsonVerificationOptions): Promise<boolean> {
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

        const publicKey = DidService.extractPublicKey(resolution);
        const result = this.verifySignature(proofValue, msgHash, publicKey);

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
    private static async doVerifyJsonLd(doc: IJsonSignedDocument | string,
        options?: IJsonVerificationOptions): Promise<boolean> {
        const document = JsonHelper.getSignedJsonLdDocument(doc);

        const resolution: VerificationMethod = await this.verificationMethod(document, options?.node);

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

        const publicKey = DidService.extractPublicKey(resolution);
        const result = this.verifySignature(proof.proofValue, hashToVerify, publicKey);

        // Restore the proof value on the original document
        document.proof = proof;

        return result;
    }

    private static async verificationMethod(document: IJsonSignedDocument, node: string): Promise<VerificationMethod> {
        if (node && !ValidationHelper.url(node)) {
            throw new LdProofError(LdProofErrorNames.INVALID_NODE,
                "The node has to be a URL");
        }

        const proof = document.proof;

        const verificationMethod = proof.verificationMethod;

        if (!ValidationHelper.did(verificationMethod)) {
            throw new LdProofError(LdProofErrorNames.INVALID_DID, "Invalid DID");
        }

        const resolution = await DidService.resolveMethod(node, verificationMethod);

        if (resolution.type().toString() !== "Ed25519VerificationKey2018") {
            throw new LdProofError(LdProofErrorNames.INVALID_VERIFICATION_METHOD,
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
            // eslint-disable-next-line no-console
            console.error("Error while verifying signature:", error);
            return false;
        }
    }
}
