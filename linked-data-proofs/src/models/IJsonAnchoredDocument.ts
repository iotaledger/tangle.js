import { IIotaLinkedDataProof } from "./IIotaLinkedDataProof";
import { IJsonDocument } from "./IJsonDocument";

/**
 * A JSON anchored document must include a proof
 */
export interface IJsonAnchoredDocument extends IJsonDocument {
    proof: IIotaLinkedDataProof;
}
