import bs58 from "bs58";
import pkg from "elliptic";
import LdProofError from "../errors/ldProofError";
import LdProofErrorNames from "../errors/ldProofErrorNames";
import DidService from "./didService";
// eslint-disable-next-line @typescript-eslint/naming-convention
const { eddsa: EdDSA } = pkg;
export default class SigningService {
    /**
     * Signs the message using the identity and method specified
     *
     * It uses the Ed25519 as the signature algorithm and the hash algorithm passed as parameter
     *
     * @param request Signing Request
     * @returns The signature details
     */
    static async sign(request) {
        const didDocument = request.didDocument;
        let methodDocument;
        try {
            methodDocument = didDocument.resolveKey(`${didDocument.id}#${request.method}`);
        }
        catch {
            throw new LdProofError(LdProofErrorNames.INVALID_DID_METHOD, "The method has not been found on the DID Document");
        }
        if (methodDocument && methodDocument.type !== "Ed25519VerificationKey2018") {
            throw new LdProofError(LdProofErrorNames.INVALID_DID_METHOD, "Only 'Ed25519VerificationKey2018' verification methods are allowed");
        }
        const proofedOwnership = await DidService.verifyOwnership(request.didDocument, request.method, request.secret);
        if (!proofedOwnership) {
            throw new LdProofError(LdProofErrorNames.INVALID_SIGNING_KEY, "The secret key supplied does not correspond to the verification method");
        }
        const signatureValue = this.calculateSignature(request.secret, request.message);
        const response = {
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
     * @returns the signature value
     */
    static calculateSignature(privateKey, message) {
        const bytesKey = bs58.decode(privateKey);
        const ed25519 = new EdDSA("ed25519");
        const ecKey = ed25519.keyFromSecret(bytesKey.toString("hex"), "hex");
        const signatureHex = ecKey.sign(message).toHex();
        // Final conversion to B58
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const signature = bs58.encode(Buffer.from(signatureHex, "hex"));
        return signature;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmluZ1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvc2lnbmluZ1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBQ3hCLE9BQU8sR0FBRyxNQUFNLFVBQVUsQ0FBQztBQUMzQixPQUFPLFlBQVksTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLGlCQUFpQixNQUFNLDZCQUE2QixDQUFDO0FBRzVELE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQztBQUV0QyxnRUFBZ0U7QUFDaEUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxHQUFHLENBQUM7QUFFN0IsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFjO0lBQy9COzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUF3QjtRQUM3QyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBRXhDLElBQUksY0FBa0MsQ0FBQztRQUN2QyxJQUFJO1lBQ0EsY0FBYyxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxXQUFXLENBQUMsRUFBRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ2xGO1FBQUMsTUFBTTtZQUNKLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLEVBQ3ZELG1EQUFtRCxDQUFDLENBQUM7U0FDNUQ7UUFDRCxJQUFJLGNBQWMsSUFBSSxjQUFjLENBQUMsSUFBSSxLQUFLLDRCQUE0QixFQUFFO1lBQ3hFLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLEVBQ3ZELG9FQUFvRSxDQUFDLENBQUM7U0FDN0U7UUFFRCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sVUFBVSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUN6RSxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVwQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDbkIsTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFDeEQsd0VBQXdFLENBQUMsQ0FBQztTQUNqRjtRQUVELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVoRixNQUFNLFFBQVEsR0FBbUI7WUFDN0IsT0FBTyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO1lBQ2pDLGtCQUFrQixFQUFFLEdBQUcsV0FBVyxDQUFDLEVBQUUsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQ3pELGNBQWM7U0FDakIsQ0FBQztRQUVGLE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxVQUFrQixFQUFFLE9BQWU7UUFDakUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV6QyxNQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFckUsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVqRCwwQkFBMEI7UUFDMUIsaUVBQWlFO1FBQ2pFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoRSxPQUFPLFNBQW1CLENBQUM7SUFDL0IsQ0FBQztDQUNKIn0=