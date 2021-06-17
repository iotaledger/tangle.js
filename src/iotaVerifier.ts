import bs58 from "bs58";
import * as crypto from "crypto";
import { eddsa as EdDSA } from "elliptic";
import AnchoringChannelError from "./errors/anchoringChannelError";
import AnchoringChannelErrorNames from "./errors/anchoringChannelErrorNames";
import ValidationHelper from "./helpers/validationHelper";
import { IVerificationRequest } from "./models/IVerificationRequest";
import DidService from "./services/didService";

export default class IotaVerifier {
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

        return this.verifySignature(request.signatureValue, request.message,
            request.hashAlgorithm, resolution.toJSON().publicKeyBase58);
    }

    private static verifySignature(signature: string, message: string,
        hashAlgorithm: string, publicKeyBase58: string): boolean {
        try {
            const signatureBytes = bs58.decode(signature);
            const publicKeyBytes = bs58.decode(publicKeyBase58);

            const ed25519 = new EdDSA("ed25519");
            const ecKey = ed25519.keyFromPublic(publicKeyBytes.toString("hex"), "hex");

            const msgHash = crypto.createHash(hashAlgorithm).update(message)
.digest();

            return (ecKey.verify(msgHash, signatureBytes.toString("hex"))) as boolean;
        } catch (error) {
            console.log("Error while verifying signature:", error);
            return false;
        }
    }
}

