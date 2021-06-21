import { IJsonSignedDocument } from "./IJsonSignedDocument";

export interface IJsonVerificationRequest {
    node: string;
    document: IJsonSignedDocument
}
