import { ILinkedDataSignature } from "./ILinkedDataSignature";

export interface IJsonSignedDocument extends Record<string, unknown> {
    proof: ILinkedDataSignature
}
