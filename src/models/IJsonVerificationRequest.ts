import { IJsonSignedDocument } from "./IJsonSignedDocument";

export interface IJsonVerificationRequest {
    /** Node to be used to resolve DIDs */
    node?: string;
    /** The signed document (it must include a proof) */
    document: IJsonSignedDocument | string
}
