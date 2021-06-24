import { IJsonDocument } from "./IJsonDocument";
import { ILinkedDataSignature } from "./ILinkedDataSignature";

/**
 * A JSON signed document must include a proof
 */
export interface IJsonSignedDocument extends IJsonDocument {
    proof: ILinkedDataSignature;
}
