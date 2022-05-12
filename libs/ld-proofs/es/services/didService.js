/* eslint-disable jsdoc/require-jsdoc */
import { Document as DidDocument, VerificationMethod } from "@iota/identity-wasm/node/identity_wasm.js";
import { SeedHelper } from "@tangle-js/anchors";
import LdProofError from "../errors/ldProofError";
import LdProofErrorNames from "../errors/ldProofErrorNames";
import { IdentityHelper } from "../helpers/identityHelper";
export default class DidService {
    /**
     * Resolves the DID.
     * @param node Node against the DID is resolved.
     * @param did DID to be resolved.
     * @returns The DID Document resolved from Tangle.
     */
    static async resolve(node, did) {
        try {
            const identityClient = IdentityHelper.getClient(node);
            const resolution = await identityClient.resolve(did);
            const jsonDoc = resolution.document;
            const doc = DidDocument.fromJSON(jsonDoc);
            if (!doc.verify()) {
                throw new LdProofError(LdProofErrorNames.DID_NOT_VERIFIED, "DID cannot be verified");
            }
            return doc;
        }
        catch {
            throw new LdProofError(LdProofErrorNames.DID_NOT_FOUND, "DID cannot be resolved");
        }
    }
    /**
     * Resolves the DID verification method.
     * @param node Node against the DID is resolved.
     * @param didMethod DID method to be resolved.
     * @returns The DID Document resolved from Tangle.
     */
    static async resolveMethod(node, didMethod) {
        try {
            const didDocument = await this.resolve(node, didMethod.split("#")[0]);
            return didDocument.resolveKey(didMethod);
        }
        catch {
            throw new LdProofError(LdProofErrorNames.DID_NOT_FOUND, "DID cannot be resolved");
        }
    }
    /**
     * Verifies that the secret really corresponds to the verification method.
     *
     * @param didDocument DID document.
     * @param method The method (expressed as a fragment identifier).
     * @param secret The private key (in base 58).
     * @returns True if verified false if not.
     */
    static async verifyOwnership(didDocument, method, secret) {
        // First we verify if the method really exists on the DID
        try {
            didDocument.resolveKey(`${didDocument.id}#${method}`);
        }
        catch {
            throw new LdProofError(LdProofErrorNames.INVALID_DID_METHOD, "The DID method supplied is not valid");
        }
        try {
            const verificationData = { "testData": SeedHelper.generateSeed(10) };
            const signature = await didDocument.signData(verificationData, {
                secret,
                method: `${didDocument.id}#${method}`
            });
            return didDocument.verifyData(signature);
        }
        catch {
            throw new LdProofError(LdProofErrorNames.INVALID_SIGNING_KEY, "The key supplied is not valid");
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9kaWRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdDQUF3QztBQUV4QyxPQUFPLEVBQUUsUUFBUSxJQUFJLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3hHLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNoRCxPQUFPLFlBQVksTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLGlCQUFpQixNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUUzRCxNQUFNLENBQUMsT0FBTyxPQUFPLFVBQVU7SUFDM0I7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFZLEVBQUUsR0FBVztRQUNqRCxJQUFJO1lBQ0EsTUFBTSxjQUFjLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV0RCxNQUFNLFVBQVUsR0FBRyxNQUFNLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckQsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztZQUVwQyxNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQ2YsTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsRUFDckQsd0JBQXdCLENBQUMsQ0FBQzthQUNqQztZQUVELE9BQU8sR0FBRyxDQUFDO1NBQ2Q7UUFBQyxNQUFNO1lBQ0osTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQ2xELHdCQUF3QixDQUFDLENBQUM7U0FDakM7SUFDTCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFZLEVBQUUsU0FBaUI7UUFDN0QsSUFBSTtZQUNBLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRFLE9BQU8sV0FBVyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM1QztRQUFDLE1BQU07WUFDSixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFDbEQsd0JBQXdCLENBQUMsQ0FBQztTQUNqQztJQUNMLENBQUM7SUFHRDs7Ozs7OztPQU9HO0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsV0FBd0IsRUFBRSxNQUFjLEVBQUUsTUFBYztRQUN4Rix5REFBeUQ7UUFDekQsSUFBSTtZQUNBLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxXQUFXLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDekQ7UUFBQyxNQUFNO1lBQ0osTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFDdkQsc0NBQXNDLENBQUMsQ0FBQztTQUMvQztRQUVELElBQUk7WUFDQSxNQUFNLGdCQUFnQixHQUFHLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUVyRSxNQUFNLFNBQVMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzNELE1BQU07Z0JBQ04sTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7YUFDeEMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxXQUFXLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzVDO1FBQUMsTUFBTTtZQUNKLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQ3hELCtCQUErQixDQUFDLENBQUM7U0FDeEM7SUFDTCxDQUFDO0NBQ0oifQ==