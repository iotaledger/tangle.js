/* eslint-disable jsdoc/require-jsdoc */

import { type Document as DidDocument, VerificationMethod, MethodScope, ProofOptions, VerifierOptions } from "@iota/identity-wasm/node/identity_wasm.js";
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
    public static async resolve(node: string, did: string): Promise<DidDocument> {
        let doc: DidDocument;
        try {
            const identityClient = await IdentityHelper.getClient(node);

            const resolution = await identityClient.resolve(did);
            doc = resolution.document();
        } catch {
            throw new LdProofError(LdProofErrorNames.DID_NOT_FOUND,
                "DID cannot be resolved");
        }

        try {
            doc.verifyDocument(doc);
        } catch {
            throw new LdProofError(LdProofErrorNames.DID_NOT_VERIFIED,
                "DID cannot be verified");
        }
        return doc;
    }

    /**
     * Resolves the DID verification method.
     * @param node Node against the DID is resolved.
     * @param didMethod DID method to be resolved. It must include a hash fragment.
     * @returns The DID Document resolved from Tangle.
     */
    public static async resolveMethod(node: string, didMethod: string): Promise<VerificationMethod> {
        let didDocument: DidDocument;

        try {
            didDocument = await this.resolve(node, didMethod.split("#")[0]);
        } catch {
            throw new LdProofError(LdProofErrorNames.DID_NOT_FOUND,
                "DID cannot be resolved");
        }
        // eslint-disable-next-line new-cap
        const method = didDocument.resolveMethod(didMethod, MethodScope.VerificationMethod());

        if (!method) {
            throw new LdProofError(LdProofErrorNames.VERIFICATION_METHOD_NOT_FOUND,
                "Verification Method cannot be found");
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
    public static async verifyOwnership(didDocument: DidDocument,
        method: string, secret: Uint8Array): Promise<boolean> {
        // First we verify if the method really exists on the DID
        // eslint-disable-next-line new-cap
        const scope = MethodScope.VerificationMethod();
        const methodObj = didDocument.resolveMethod(`${didDocument.id()}#${method}`, scope);
        if (!methodObj) {
            throw new LdProofError(LdProofErrorNames.VERIFICATION_METHOD_NOT_FOUND,
                "The DID verification method supplied has not been found");
        }

        try {
            const verificationData = { "testData": SeedHelper.generateSeed(10) };

            const signature = await didDocument.signData(verificationData,
                secret,
                `${didDocument.id()}#${method}`, ProofOptions.default());

            return didDocument.verifyData(signature, VerifierOptions.default());
        } catch {
            throw new LdProofError(LdProofErrorNames.INVALID_SIGNING_KEY,
                "The key supplied is not valid");
        }
    }

    /**
     * Extracts the public key from the verification method.
     * Only tolerates Base58 public keys.
     * @param verificationMethod The Verification Method.
     * @returns The public key in Base 58.
     * @throws LdProofError if Verification Method does not comply.
     */
    public static extractPublicKey(verificationMethod: VerificationMethod): string {
        const verMethod = verificationMethod.toJSON();
        const publicKeyMultibase: string = verMethod.publicKeyMultibase;

        if (!publicKeyMultibase) {
            throw new LdProofError(LdProofErrorNames.INVALID_VERIFICATION_METHOD,
                "Only multibase keys are supported");
        }

        if (!publicKeyMultibase.startsWith("z")) {
            throw new LdProofError(LdProofErrorNames.INVALID_VERIFICATION_METHOD,
                "Only multibase keys Base 58 are supported");
        }

        return publicKeyMultibase.slice(1);
    }
}
