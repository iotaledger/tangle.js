import { Document as DidDocument } from "@iota/identity-wasm/node";
import AnchoringChannelError from "./errors/anchoringChannelError";
import AnchoringChannelErrorNames from "./errors/anchoringChannelErrorNames";
import ValidationHelper from "./helpers/validationHelper";
import { ISigningRequest } from "./models/ISigningRequest";
import { ISigningResult } from "./models/ISigningResult";
import DidService from "./services/didService";
import SigningService from "./services/signingService";

/**
 *  It allows to sign and verify messages using a Verification Method provided by a DID
 *
 *  It generates and verifies EdDSA (Ed25519) signatures
 *
 */
export default class IotaSigner {
    private readonly _did: string;

    private readonly _didDocument: DidDocument;

    private constructor(did: string, didDocument: DidDocument) {
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
     * @param did The DID that has the verification methods of the signer
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

        const didDoc = await DidService.resolve(node, did);

        return new IotaSigner(did, didDoc);
    }

    /**
     *
     * Signs a string message using the Ed25519 signature algorithm
     *
     * @param message The message
     * @param method The method used for signing (referred as a DID fragment identifier)
     * @param secret The secret
     * @param hashAlgorithm The hash algorithm ('sha256' by default) used
     *
     * @returns The signature details including its value encoded in Base58
     *
     */
    public async sign(message: string, method: string, secret: string,
        hashAlgorithm = "sha256"): Promise<ISigningResult> {
        const request: ISigningRequest = {
            didDocument: this._didDocument,
            method,
            secret,
            message,
            hashAlgorithm
        };

        const result = await SigningService.sign(request);

        return result;
    }

    /**
     *  Signs a JSON document 
     *
     * @param doc The JSON document as an object or as a string
     * @param verificationMethod  Verification method
     * @param secret The secret
     * @param hashAlgorithm The hash algorithm ('sha256' by default) used
     *
     * @returns The JSON document including its corresponding Linked Data Signature
     *
     */
    public async signJson(message: unknown, verificationMethod: string, secret: string, 
        hashAlgorithm = "sha256"): Promise<unknown> {
        return "";
    }

    /**
     *  Signs a JSON-LD document 
     *
     * @param doc The JSON-LD document as an object or as a string
     * @param verificationMethod  Verification method
     * @param secret The secret
     * @param hashAlgorithm The hash algorithm ('sha256' by default) used
     *
     * @returns The JSON-LD document including its corresponding Linked Data Signature
     *
     */
     public async signJsonLd(message: unknown, verificationMethod: string, secret: string, 
        hashAlgorithm = "sha256"): Promise<unknown> {
        return "";
    }
}
