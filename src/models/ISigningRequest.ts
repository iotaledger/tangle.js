import { Document as DidDocument } from "@iota/identity-wasm/node";

export interface ISigningRequest {
    node: string;
    didDocument: DidDocument;
    message: string;
    verificationMethod: string;
    secret: string;
}
