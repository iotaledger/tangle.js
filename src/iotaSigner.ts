import { Document as DidDocument } from "@iota/identity-wasm/node";
import AnchoringChannelError from "./errors/anchoringChannelError";
import AnchoringChannelErrorNames from "./errors/anchoringChannelErrorNames";
import ValidationHelper from "./helpers/validationHelper";
import { ISigningRequest } from "./models/ISigningRequest";
import DidService from "./services/didService";
import SigningService from "./services/signingService";

/**
 *  It allows to sign messages using a Verification Method provided by a DID
 *
 *  It uses EdDSA Ed25519 signatures
 *
 */
export default class IotaSigner {
    private readonly _node: string;

    private readonly _did: string;

    private readonly _didDocument: DidDocument;

    private constructor(node: string, did: string, didDocument: DidDocument) {
        this._node = node;
        this._did = did;
        this._didDocument = didDocument;
    }

    public get did(): string {
        return this._did;
    }

    /**
     * Creates a new signer associating it with a particular decentralized identity
     *
     * @param node The node
     *
     * @param did The DID
     *
     * @returns The newly created signer
     */
    public static async create(node: string, did: string): Promise<IotaSigner> {
        if (!ValidationHelper.url(node)) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_NODE, "Node is not a URL");
        }

        if (!ValidationHelper.did(did)) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_DID, "Invalid DID");
        }

        const didDoc = await DidService.resolve(did);

        return new IotaSigner(node, did, didDoc);
    }

    /**
     *  Signs a string message
     *
     * @param message The message
     * @param verificationMethod The verification method
     * @param secret The secret
     *
     * @returns The signature
     *
     */
    public async sign(message: string, verificationMethod: string, secret: string): Promise<string> {
        const request: ISigningRequest = {
            node: this._node,
            didDocument: this._didDocument,
            verificationMethod,
            secret,
            message
        };

        const result = await SigningService.sign(request);

        return result.signature;
    }

    /**
     *  Signs a JSON message but first executes a canonicalisation
     *
     * @param message The JSON
     *
     * @param verificationMethod  Verification method
     * @param secret The secret
     *
     * @returns The signature
     *
     */
    public async signJson(message: unknown, verificationMethod: string, secret: string): Promise<string> {
        return "";
    }
}
