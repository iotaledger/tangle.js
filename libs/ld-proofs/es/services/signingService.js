/* eslint-disable jsdoc/require-jsdoc */
import { MethodScope } from "@iota/identity-wasm/node/identity_wasm.js";
import bs58 from "bs58";
import pkg from "elliptic";
import LdProofError from "../errors/ldProofError";
import LdProofErrorNames from "../errors/ldProofErrorNames";
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
    static async sign(request) {
        const didDocument = request.didDocument;
        // eslint-disable-next-line new-cap
        const scope = MethodScope.VerificationMethod();
        const methodDocument = didDocument.resolveMethod(`${didDocument.id()}#${request.method}`, scope);
        if (!methodDocument) {
            throw new LdProofError(LdProofErrorNames.VERIFICATION_METHOD_NOT_FOUND, "The verification method has not been found on the DID Document");
        }
        if (methodDocument.type().toString() !== "Ed25519VerificationKey2018") {
            throw new LdProofError(LdProofErrorNames.INVALID_VERIFICATION_METHOD, "Only 'Ed25519VerificationKey2018' verification methods are allowed");
        }
        const proofedOwnership = await DidService.verifyOwnership(request.didDocument, request.method, request.secret);
        if (!proofedOwnership) {
            throw new LdProofError(LdProofErrorNames.INVALID_SIGNING_KEY, "The secret key supplied does not correspond to the verification method");
        }
        const signatureValue = this.calculateSignature(request.secret, request.message);
        const response = {
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
    static calculateSignature(privateKey, message) {
        const ed25519 = new EdDSA("ed25519");
        const ecKey = ed25519.keyFromSecret(Buffer.from(privateKey).toString("hex"), "hex");
        const signatureHex = ecKey.sign(message).toHex();
        // Final conversion to B58
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const signature = bs58.encode(Buffer.from(signatureHex, "hex"));
        return signature;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmluZ1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvc2lnbmluZ1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsd0NBQXdDO0FBRXhDLE9BQU8sRUFBMkIsV0FBVyxFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDakcsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBQ3hCLE9BQU8sR0FBRyxNQUFNLFVBQVUsQ0FBQztBQUMzQixPQUFPLFlBQVksTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLGlCQUFpQixNQUFNLDZCQUE2QixDQUFDO0FBRzVELE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQztBQUV0QyxnRUFBZ0U7QUFDaEUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxHQUFHLENBQUM7QUFFN0IsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFjO0lBQy9COzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUF3QjtRQUM3QyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBRXhDLG1DQUFtQztRQUNuQyxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMvQyxNQUFNLGNBQWMsR0FBdUIsV0FBVyxDQUFDLGFBQWEsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckgsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNqQixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLDZCQUE2QixFQUNsRSxnRUFBZ0UsQ0FBQyxDQUFDO1NBQ3pFO1FBQ0QsSUFBSSxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssNEJBQTRCLEVBQUU7WUFDbkUsTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQywyQkFBMkIsRUFDaEUsb0VBQW9FLENBQUMsQ0FBQztTQUM3RTtRQUVELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxVQUFVLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQ3pFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXBDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUNuQixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixFQUN4RCx3RUFBd0UsQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWhGLE1BQU0sUUFBUSxHQUFtQjtZQUM3QixPQUFPLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7WUFDakMsa0JBQWtCLEVBQUUsR0FBRyxXQUFXLENBQUMsRUFBRSxFQUFFLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUMzRCxjQUFjO1NBQ2pCLENBQUM7UUFFRixPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxNQUFNLENBQUMsa0JBQWtCLENBQUMsVUFBc0IsRUFBRSxPQUFlO1FBQ3JFLE1BQU0sT0FBTyxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFcEYsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVqRCwwQkFBMEI7UUFDMUIsaUVBQWlFO1FBQ2pFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoRSxPQUFPLFNBQW1CLENBQUM7SUFDL0IsQ0FBQztDQUNKIn0=