/* eslint-disable jsdoc/require-jsdoc */

import type { IIotaLinkedDataProof } from "./IIotaLinkedDataProof";
import type { IJsonDocument } from "./IJsonDocument";

/**
 * A JSON anchored document must include a proof.
 */
export interface IJsonAnchoredDocument extends IJsonDocument {
    proof: IIotaLinkedDataProof;
}
