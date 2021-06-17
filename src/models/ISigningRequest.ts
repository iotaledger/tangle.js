import { Document as DidDocument } from "@iota/identity-wasm/node";

/**
 *  Signing Response
 */
export interface ISigningRequest {
    /** DID Document */
    didDocument: DidDocument;
    /** Message to be signed */
    message: string;
    /** Hash algorithm */
    hashAlgorithm: string;
    /** Method for signing and verification */
    method: string;
    /** Private key used for signing */
    secret: string;
}
