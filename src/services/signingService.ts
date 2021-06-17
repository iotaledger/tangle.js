import bs58 from "bs58";
import * as crypto from "crypto";
import { eddsa as EdDSA } from "elliptic";
import AnchoringChannelError from "../errors/anchoringChannelError";
import AnchoringChannelErrorNames from "../errors/anchoringChannelErrorNames";
import { ISigningRequest } from "../models/ISigningRequest";
import { ISigningResult } from "../models/ISigningResult";
import DidService from "./didService";

export default class SigningService {
    /**
     * Signs the message using the identity and method specified
     *
     * @param request Signing Request
     *
     * @returns The signing result
     *
     */
    public static async sign(request: ISigningRequest): Promise<ISigningResult> {
        const didDocument = request.didDocument;

        const proofedOwnership = await DidService.verifyOwnership(request.didDocument,
            request.method, request.secret);

        if (!proofedOwnership) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_SIGNING_KEY,
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
     *
     * @param privateKey private key
     * @param message message to be signed
     *
     * @returns the signature value
     */
    private static calculateSignature(privateKey: string, message: string): string {
        const bytesKey = bs58.decode(privateKey);

        const ed25519 = new EdDSA("ed25519");
        const ecKey = ed25519.keyFromSecret(bytesKey.toString("hex"), "hex");

        const msgHash = crypto.createHash("sha256").update(message);

        const signatureHex = ecKey.sign(msgHash).toHex();

        // Final conversion to B58
        const signature = bs58.encode(Buffer.from(signatureHex, "hex"));
        return signature as string;
    }
}
