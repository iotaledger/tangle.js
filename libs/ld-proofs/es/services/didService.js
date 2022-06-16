/* eslint-disable jsdoc/require-jsdoc */
import { VerificationMethod, MethodScope, ProofOptions, VerifierOptions } from "@iota/identity-wasm/node/identity_wasm.js";
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
        let doc;
        try {
            const identityClient = await IdentityHelper.getClient(node);
            const resolution = await identityClient.resolve(did);
            doc = resolution.document();
        }
        catch {
            throw new LdProofError(LdProofErrorNames.DID_NOT_FOUND, "DID cannot be resolved");
        }
        try {
            doc.verifyDocument(doc);
        }
        catch {
            throw new LdProofError(LdProofErrorNames.DID_NOT_VERIFIED, "DID cannot be verified");
        }
        return doc;
    }
    /**
     * Resolves the DID verification method.
     * @param node Node against the DID is resolved.
     * @param didMethod DID method to be resolved. It must include a hash fragment.
     * @returns The DID Document resolved from Tangle.
     */
    static async resolveMethod(node, didMethod) {
        let didDocument;
        try {
            didDocument = await this.resolve(node, didMethod.split("#")[0]);
        }
        catch {
            throw new LdProofError(LdProofErrorNames.DID_NOT_FOUND, "DID cannot be resolved");
        }
        // eslint-disable-next-line new-cap
        const method = didDocument.resolveMethod(didMethod, MethodScope.VerificationMethod());
        if (!method) {
            throw new LdProofError(LdProofErrorNames.VERIFICATION_METHOD_NOT_FOUND, "Verification Method cannot be found");
        }
        return method;
    }
    /**
     * Verifies that the secret really corresponds to the verification method.
     *
     * @param didDocument DID document.
     * @param method The method (expressed as a fragment identifier).
     * @param secret The private key.
     * @returns True if verified false if not.
     */
    static async verifyOwnership(didDocument, method, secret) {
        // First we verify if the method really exists on the DID
        // eslint-disable-next-line new-cap
        const scope = MethodScope.VerificationMethod();
        const methodObj = didDocument.resolveMethod(`${didDocument.id()}#${method}`, scope);
        if (!methodObj) {
            throw new LdProofError(LdProofErrorNames.VERIFICATION_METHOD_NOT_FOUND, "The DID verification method supplied has not been found");
        }
        try {
            const verificationData = { "testData": SeedHelper.generateSeed(10) };
            const signature = await didDocument.signData(verificationData, secret, `${didDocument.id()}#${method}`, ProofOptions.default());
            return didDocument.verifyData(signature, VerifierOptions.default());
        }
        catch {
            throw new LdProofError(LdProofErrorNames.INVALID_SIGNING_KEY, "The key supplied is not valid");
        }
    }
    /**
     * Extracts the public key from the verification method.
     * Only tolerates Base58 public keys.
     * @param verificationMethod The Verification Method.
     * @returns The public key in Base 58.
     * @throws LdProofError if Verification Method does not comply.
     */
    static extractPublicKey(verificationMethod) {
        const verMethod = verificationMethod.toJSON();
        const publicKeyMultibase = verMethod.publicKeyMultibase;
        if (!publicKeyMultibase) {
            throw new LdProofError(LdProofErrorNames.INVALID_VERIFICATION_METHOD, "Only multibase keys are supported");
        }
        if (!publicKeyMultibase.startsWith("z")) {
            throw new LdProofError(LdProofErrorNames.INVALID_VERIFICATION_METHOD, "Only multibase keys Base 58 are supported");
        }
        return publicKeyMultibase.slice(1);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9kaWRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdDQUF3QztBQUV4QyxPQUFPLEVBQWdDLGtCQUFrQixFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDekosT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ2hELE9BQU8sWUFBWSxNQUFNLHdCQUF3QixDQUFDO0FBQ2xELE9BQU8saUJBQWlCLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRTNELE1BQU0sQ0FBQyxPQUFPLE9BQU8sVUFBVTtJQUMzQjs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQVksRUFBRSxHQUFXO1FBQ2pELElBQUksR0FBZ0IsQ0FBQztRQUNyQixJQUFJO1lBQ0EsTUFBTSxjQUFjLEdBQUcsTUFBTSxjQUFjLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTVELE1BQU0sVUFBVSxHQUFHLE1BQU0sY0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyRCxHQUFHLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQy9CO1FBQUMsTUFBTTtZQUNKLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUNsRCx3QkFBd0IsQ0FBQyxDQUFDO1NBQ2pDO1FBRUQsSUFBSTtZQUNBLEdBQUcsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDM0I7UUFBQyxNQUFNO1lBQ0osTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsRUFDckQsd0JBQXdCLENBQUMsQ0FBQztTQUNqQztRQUNELE9BQU8sR0FBRyxDQUFD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