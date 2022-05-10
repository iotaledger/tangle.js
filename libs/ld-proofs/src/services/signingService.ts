import type { VerificationMethod } from "@iota/identity-wasm/node";
import bs58 from "bs58";
import { eddsa as EdDSA } from "elliptic";
import LdProofError from "../errors/ldProofError";
import LdProofErrorNames from "../errors/ldProofErrorNames";
import type { ISigningRequest } from "../models/ISigningRequest";
import type { ISigningResult } from "../models/ISigningResult";
import DidService from "./didService";

export default class SigningService {
    /**
     * Signs the message using the identity and method specified
     *
     * It uses the Ed25519 as the signature algorithm and the hash algorithm passed as parameter
     *
     * @param request Signing Request
     *
     * @returns The signature details
     *
     */
    public static async sign(request: ISigningRequest): Promise<ISigningResult> {
        const didDocument = request.didDocument;

        let methodDocument: VerificationMethod;
        try {
            methodDocument = didDocument.resolveKey(`${didDocument.id}#${request.method}`);
        } catch {
            throw new LdProofError(LdProofErrorNames.INVALID_DID_METHOD,
                "The method has not been found on the DID Document");
        }
        if (methodDocument && methodDocument.type !== "Ed25519VerificationKey2018") {
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
            verificationMethod: `${didDocument.id}#${request.method}`,
            signatureValue
        };

        return response;
    }

    /**
     * Calculates the signature
     * @param privateKey private key
     * @param message message to be signed
     *
     * @returns the signature value
     */
    private static calculateSignature(privateKey: string, message: Buffer): string {
        const bytesKey = bs58.decode(privateKey);

        const ed25519 = new EdDSA("ed25519");
        const ecKey = ed25519.keyFromSecret(bytesKey.toString("hex"), "hex");

        const signatureHex = ecKey.sign(message).toHex();

        // Final conversion to B58
        const signature = bs58.encode(Buffer.from(signatureHex, "hex"));
        return signature as string;
    }
}
