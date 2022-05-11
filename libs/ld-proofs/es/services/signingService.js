import bs58 from "bs58";
import pkg from 'elliptic';
import LdProofError from "../errors/ldProofError";
import LdProofErrorNames from "../errors/ldProofErrorNames";
import DidService from "./didService";
const { eddsa: EdDSA } = pkg;
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
     *
     * @returns the signature value
     */
    static calculateSignature(privateKey, message) {
        const bytesKey = bs58.decode(privateKey);
        const ed25519 = new EdDSA("ed25519");
        const ecKey = ed25519.keyFromSecret(bytesKey.toString("hex"), "hex");
        const signatureHex = ecKey.sign(message).toHex();
        // Final conversion to B58
        const signature = bs58.encode(Buffer.from(signatureHex, "hex"));
        return signature;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmluZ1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvc2lnbmluZ1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBQ3hCLE9BQU8sR0FBRyxNQUFNLFVBQVUsQ0FBQztBQUMzQixPQUFPLFlBQVksTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLGlCQUFpQixNQUFNLDZCQUE2QixDQUFDO0FBRzVELE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQztBQUV0QyxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUU3QixNQUFNLENBQUMsT0FBTyxPQUFPLGNBQWM7SUFDL0I7Ozs7Ozs7OztPQVNHO0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBd0I7UUFDN0MsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUV4QyxJQUFJLGNBQWtDLENBQUM7UUFDdkMsSUFBSTtZQUNBLGNBQWMsR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsV0FBVyxDQUFDLEVBQUUsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUNsRjtRQUFDLE1BQU07WUFDSixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixFQUN2RCxtREFBbUQsQ0FBQyxDQUFDO1NBQzVEO1FBQ0QsSUFBSSxjQUFjLElBQUksY0FBYyxDQUFDLElBQUksS0FBSyw0QkFBNEIsRUFBRTtZQUN4RSxNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixFQUN2RCxvRUFBb0UsQ0FBQyxDQUFDO1NBQzdFO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLFVBQVUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFDekUsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFcEMsSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQ25CLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQ3hELHdFQUF3RSxDQUFDLENBQUM7U0FDakY7UUFFRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFaEYsTUFBTSxRQUFRLEdBQW1CO1lBQzdCLE9BQU8sRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtZQUNqQyxrQkFBa0IsRUFBRSxHQUFHLFdBQVcsQ0FBQyxFQUFFLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUN6RCxjQUFjO1NBQ2pCLENBQUM7UUFFRixPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ssTUFBTSxDQUFDLGtCQUFrQixDQUFDLFVBQWtCLEVBQUUsT0FBZTtRQUNqRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXpDLE1BQU0sT0FBTyxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVyRSxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRWpELDBCQUEwQjtRQUMxQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDaEUsT0FBTyxTQUFtQixDQUFDO0lBQy9CLENBQUM7Q0FDSiJ9