import type { IJsonDocument } from "./IJsonDocument";
import type { ILinkedDataSignature } from "./ILinkedDataSignature";

/**
 * A JSON signed document must include a proof
 */
export interface IJsonSignedDocument extends IJsonDocument {
    proof: ILinkedDataSignature;
}
