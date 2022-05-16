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
            const identityClient = await IdentityHelper.getClient(node);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9kaWRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdDQUF3QztBQUV4QyxPQUFPLEVBQUUsUUFBUSxJQUFJLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3hHLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNoRCxPQUFPLFlBQVksTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLGlCQUFpQixNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUUzRCxNQUFNLENBQUMsT0FBTyxPQUFPLFVBQVU7SUFDM0I7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFZLEVBQUUsR0FBVztRQUNqRCxJQUFJO1lBQ0EsTUFBTSxjQUFjLEdBQUcsTUFBTSxjQUFjLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTVELE1BQU0sVUFBVSxHQUFHLE1BQU0sY0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyRCxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1lBRXBDLE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDZixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixFQUNyRCx3QkFBd0IsQ0FBQyxDQUFDO2FBQ2pDO1lBRUQsT0FBTyxHQUFHLENBQUM7U0FDZDtRQUFDLE1BQU07WUFDSixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFDbEQsd0JBQXdCLENBQUMsQ0FBQztTQUNqQztJQUNMLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQVksRUFBRSxTQUFpQjtRQUM3RCxJQUFJO1lBQ0EsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEUsT0FBTyxXQUFXLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzVDO1FBQUMsTUFBTTtZQUNKLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUNsRCx3QkFBd0IsQ0FBQyxDQUFDO1NBQ2pDO0lBQ0wsQ0FBQztJQUdEOzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxXQUF3QixFQUFFLE1BQWMsRUFBRSxNQUFjO1FBQ3hGLHlEQUF5RDtRQUN6RCxJQUFJO1lBQ0EsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztTQUN6RDtRQUFDLE1BQU07WUFDSixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixFQUN2RCxzQ0FBc0MsQ0FBQyxDQUFDO1NBQy9DO1FBRUQsSUFBSTtZQUNBLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBRXJFLE1BQU0sU0FBUyxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDM0QsTUFBTTtnQkFDTixNQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTthQUN4QyxDQUFDLENBQUM7WUFFSCxPQUFPLFdBQVcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDNUM7UUFBQyxNQUFNO1lBQ0osTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFDeEQsK0JBQStCLENBQUMsQ0FBQztTQUN4QztJQUNMLENBQUM7Q0FDSiJ9