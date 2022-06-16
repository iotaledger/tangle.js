/* eslint-disable jsdoc/require-jsdoc */

import { type VerificationMethod, MethodScope } from "@iota/identity-wasm/node/identity_wasm.js";
import bs58 from "bs58";
import pkg from "elliptic";
import LdProofError from "../errors/ldProofError";
import LdProofErrorNames from "../errors/ldProofErrorNames";
import type { ISigningRequest } from "../models/ISigningRequest";
import type { ISigningResult } from "../models/ISigningResult";
import DidService from "./didService";

// eslint-disable-next-line @typescript-eslint/naming-convention
const { eddsa: EdDSA } = pkg;

export default class SigningService {
    /**
     * Signs the message using the identity and method specified.
     *
     * It uses the Ed25519 as the signature algorithm and the hash algorithm passed as parameter.
     *
     * @param request Signing Request.
     * @returns The signature details.
     */
    public static async sign(request: ISigningRequest): Promise<ISigningResult> {
        const didDocument = request.didDocument;

        // eslint-disable-next-line new-cap
        const scope = MethodScope.VerificationMethod();
        const methodDocument: VerificationMethod = didDocument.resolveMethod(`${didDocument.id()}#${request.method}`, scope);
        if (!methodDocument) {
            throw new LdProofError(LdProofErrorNames.INVALID_DID_METHOD,
                "The method has not been found on the DID Document");
        }
        if (methodDocument.type().toString() !== "Ed25519VerificationKey2018") {
            throw new LdProofError(LdProofErrorNames.INVALID_DID_METHOD,
                "Only 'Ed25519VerificationKey2018' verification methods are allowed");
        }

        const proofedOwnership = await DidService.verifyOwnership(request.didDocument,
            request.method, request.secret);

        if (!proofedOwnership) {
            throw new LdProofError(LdProofErrorNames.INVALID_SIGNING_KEY,
                "The secret key supplied does not correspond to the verification method");
        }

        const signatureValue = this.calculateSignature(request.secret, request.message);

        const response: ISigningResult = {
            created: new Date().toISOString(),
            verificationMethod: `${didDocument.id()}#${request.method}`,
            signatureValue
        };

        return response;
    }

    /**
     * Calculates the signature.
     * @param privateKey Private key.
     * @param message Message to be signed.
     * @returns The signature value.
     */
    private static calculateSignature(privateKey: Uint8Array, message: Buffer): string {
        const ed25519 = new EdDSA("ed25519");
        const ecKey = ed25519.keyFromSecret(Buffer.from(privateKey).toString("hex"), "hex");

        const signatureHex = ecKey.sign(message).toHex();

        // Final conversion to B58
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const signature = bs58.encode(Buffer.from(signatureHex, "hex"));
        return signature as string;
    }
}
