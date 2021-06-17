import { resolve as iotaDidResolve, Document as DidDocument } from "@iota/identity-wasm/node";
import AnchoringChannelError from "../errors/anchoringChannelError";
import AnchoringChannelErrorNames from "../errors/anchoringChannelErrorNames";
import { ChannelHelper } from "../helpers/channelHelper";

export default class DidService {
    /**
     * Resolves the DID
     * @param node Node against the DID is resolved
     * @param did  DID to be resolved
     * @returns The DID Document resolved from Tangle
     */
    public static async resolve(node: string, did: string): Promise<DidDocument> {
        try {
            const jsonDoc = await iotaDidResolve(did, {
                network: "mainnet"
            });

            const doc = DidDocument.fromJSON(jsonDoc);
            if (!doc.verify()) {
                throw new AnchoringChannelError(AnchoringChannelErrorNames.DID_NOT_VERIFIED,
                    "DID cannot be verified");
            }

            return doc;
        } catch {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.DID_NOT_FOUND,
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
        }
        catch(error) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_DID_METHOD,
                "The DID method supplied is not valid");
        }

        try {
            const verificationData = { "testData": ChannelHelper.generateSeed(10) };

            const signature = await didDocument.signData(verificationData, {
                secret,
                method: `${didDocument.id}#${method}`
            });

            return didDocument.verifyData(signature);
        }
        catch (error) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_SIGNING_KEY,
                "The key supplied is not valid");
        }
    }
}
