/* eslint-disable jsdoc/require-jsdoc */
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
        let methodDocument;
        try {
            const scope = undefined;
            methodDocument = didDocument.resolveMethod(`${didDocument.id()}#${request.method}`, scope);
        }
        catch {
            throw new LdProofError(LdProofErrorNames.INVALID_DID_METHOD, "The method has not been found on the DID Document");
        }
        if (methodDocument && methodDocument.type().toString() !== "Ed25519VerificationKey2018") {
            throw new LdProofError(LdProofErrorNames.INVALID_DID_METHOD, "Only 'Ed25519VerificationKey2018' verification methods are allowed");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmluZ1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvc2lnbmluZ1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsd0NBQXdDO0FBR3hDLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUN4QixPQUFPLEdBQUcsTUFBTSxVQUFVLENBQUM7QUFDM0IsT0FBTyxZQUFZLE1BQU0sd0JBQXdCLENBQUM7QUFDbEQsT0FBTyxpQkFBaUIsTUFBTSw2QkFBNkIsQ0FBQztBQUc1RCxPQUFPLFVBQVUsTUFBTSxjQUFjLENBQUM7QUFFdEMsZ0VBQWdFO0FBQ2hFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDO0FBRTdCLE1BQU0sQ0FBQyxPQUFPLE9BQU8sY0FBYztJQUMvQjs7Ozs7OztPQU9HO0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBd0I7UUFDN0MsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUV4QyxJQUFJLGNBQWtDLENBQUM7UUFDdkMsSUFBSTtZQUNBLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQztZQUN4QixjQUFjLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDOUY7UUFBQyxNQUFNO1lBQ0osTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFDdkQsbURBQW1ELENBQUMsQ0FBQztTQUM1RDtRQUNELElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyw0QkFBNEIsRUFBRTtZQUNyRixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixFQUN2RCxvRUFBb0UsQ0FBQyxDQUFDO1NBQzdFO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLFVBQVUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFDekUsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFcEMsSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQ25CLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQ3hELHdFQUF3RSxDQUFDLENBQUM7U0FDakY7UUFFRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFaEYsTUFBTSxRQUFRLEdBQW1CO1lBQzdCLE9BQU8sRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtZQUNqQyxrQkFBa0IsRUFBRSxHQUFHLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQzNELGNBQWM7U0FDakIsQ0FBQztRQUVGLE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxVQUFzQixFQUFFLE9BQWU7UUFDckUsTUFBTSxPQUFPLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVwRixNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRWpELDBCQUEwQjtRQUMxQixpRUFBaUU7UUFDakUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sU0FBbUIsQ0FBQztJQUMvQixDQUFDO0NBQ0oifQ==