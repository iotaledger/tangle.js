/* eslint-disable jsdoc/require-jsdoc */

import type { Document as DidDocument, VerificationMethod } from "@iota/identity-wasm/node/identity_wasm.js";
import { ProofOptions, VerifierOptions } from "@iota/identity-wasm/web";
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
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
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
     * @param didMethod DID method to be resolved.
     * @returns The DID Document resolved from Tangle.
     */
    public static async resolveMethod(node: string, didMethod: string): Promise<VerificationMethod> {
        try {
            const didDocument = await this.resolve(node, didMethod.split("#")[0]);

            const scope = undefined;
            return didDocument.resolveMethod(didMethod, scope);
        } catch {
            throw new LdProofError(LdProofErrorNames.DID_NOT_FOUND,
                "DID cannot be resolved");
        }
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
        try {
            const scope = undefined;
            didDocument.resolveMethod(`${didDocument.id()}#${method}`, scope);
        } catch {
            throw new LdProofError(LdProofErrorNames.INVALID_DID_METHOD,
                "The DID method supplied is not valid");
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
}
