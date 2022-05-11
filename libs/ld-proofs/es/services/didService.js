import { Document as DidDocument, VerificationMethod } from "@iota/identity-wasm/node/identity_wasm.js";
import { SeedHelper } from "@tangle-js/anchors";
import LdProofError from "../errors/ldProofError";
import LdProofErrorNames from "../errors/ldProofErrorNames";
import { IdentityHelper } from "../helpers/identityHelper";
export default class DidService {
    /**
     * Resolves the DID
     * @param node Node against the DID is resolved
     * @param did  DID to be resolved
     * @returns The DID Document resolved from Tangle
     */
    static async resolve(node, did) {
        try {
            const identityClient = IdentityHelper.getClient(node);
            const jsonDoc = (await identityClient.resolve(did)).document;
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
     * Resolves the DID verification method
     * @param node Node against the DID is resolved
     * @param didMethod  DID method to be resolved
     * @returns The DID Document resolved from Tangle
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
     * Verifies that the secret really corresponds to the verification method
     *
     * @param didDocument DID document
     * @param method The method (expressed as a fragment identifier)
     * @param secret The private key (in base 58)
     *
     * @returns true if verified false if not
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9kaWRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLElBQUksV0FBVyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDeEcsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ2hELE9BQU8sWUFBWSxNQUFNLHdCQUF3QixDQUFDO0FBQ2xELE9BQU8saUJBQWlCLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRTNELE1BQU0sQ0FBQyxPQUFPLE9BQU8sVUFBVTtJQUMzQjs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQVksRUFBRSxHQUFXO1FBQ2pELElBQUk7WUFDQSxNQUFNLGNBQWMsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXRELE1BQU0sT0FBTyxHQUFHLENBQUMsTUFBTSxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1lBRTdELE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDZixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixFQUNyRCx3QkFBd0IsQ0FBQyxDQUFDO2FBQ2pDO1lBRUQsT0FBTyxHQUFHLENBQUM7U0FDZDtRQUFDLE1BQU07WUFDSixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFDbEQsd0JBQXdCLENBQUMsQ0FBQztTQUNqQztJQUNMLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQVksRUFBRSxTQUFpQjtRQUM3RCxJQUFJO1lBQ0EsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEUsT0FBTyxXQUFXLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzVDO1FBQUMsTUFBTTtZQUNKLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUNsRCx3QkFBd0IsQ0FBQyxDQUFDO1NBQ2pDO0lBQ0wsQ0FBQztJQUdEOzs7Ozs7OztPQVFHO0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsV0FBd0IsRUFBRSxNQUFjLEVBQUUsTUFBYztRQUN4Rix5REFBeUQ7UUFDekQsSUFBSTtZQUNBLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxXQUFXLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDekQ7UUFBQyxNQUFNO1lBQ0osTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFDdkQsc0NBQXNDLENBQUMsQ0FBQztTQUMvQztRQUVELElBQUk7WUFDQSxNQUFNLGdCQUFnQixHQUFHLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUVyRSxNQUFNLFNBQVMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzNELE1BQU07Z0JBQ04sTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7YUFDeEMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxXQUFXLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzVDO1FBQUMsTUFBTTtZQUNKLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQ3hELCtCQUErQixDQUFDLENBQUM7U0FDeEM7SUFDTCxDQUFDO0NBQ0oifQ==