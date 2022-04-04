import { SeedHelper } from "@tangle-js/anchors";
import LdProofError from "../errors/ldProofError";
import LdProofErrorNames from "../errors/ldProofErrorNames";
import { IdentityHelper } from "../helpers/identityHelper";
import { Document, VerificationMethod as Vm } from "../iotaIdentity";

type DidDocument = InstanceType<typeof Document>;
type VerificationMethod = InstanceType<typeof Vm>;

export default class DidService {
    /**
     * Resolves the DID
     * @param node Node against the DID is resolved
     * @param did  DID to be resolved
     * @returns The DID Document resolved from Tangle
     */
    public static async resolve(node: string, did: string): Promise<DidDocument> {
        try {
            const identityClient = IdentityHelper.getClient(node);

            const jsonDoc = (await identityClient.resolve(did)).document;

            const doc = Document.fromJSON(jsonDoc);
            if (!doc.verify()) {
                throw new LdProofError(LdProofErrorNames.DID_NOT_VERIFIED,
                    "DID cannot be verified");
            }

            return doc;
        } catch {
            throw new LdProofError(LdProofErrorNames.DID_NOT_FOUND,
                "DID cannot be resolved");
        }
    }

    /**
     * Resolves the DID verification method
     * @param node Node against the DID is resolved
     * @param didMethod  DID method to be resolved
     * @returns The DID Document resolved from Tangle
     */
     public static async resolveMethod(node: string, didMethod: string): Promise<VerificationMethod> {
        try {
            const didDocument = await this.resolve(node, didMethod.split("#")[0]);

            return didDocument.resolveKey(didMethod);
        } catch {
            throw new LdProofError(LdProofErrorNames.DID_NOT_FOUND,
                "DID cannot be resolved");
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
    public static async verifyOwnership(didDocument: DidDocument, method: string, secret: string): Promise<boolean> {
        // First we verify if the method really exists on the DID
        try {
            didDocument.resolveKey(`${didDocument.id}#${method}`);
        } catch {
            throw new LdProofError(LdProofErrorNames.INVALID_DID_METHOD,
                "The DID method supplied is not valid");
        }

        try {
            const verificationData = { "testData": SeedHelper.generateSeed(10) };

            const signature = await didDocument.signData(verificationData, {
                secret,
                method: `${didDocument.id}#${method}`
            });

            return didDocument.verifyData(signature);
        } catch {
            throw new LdProofError(LdProofErrorNames.INVALID_SIGNING_KEY,
                "The key supplied is not valid");
        }
    }
}
