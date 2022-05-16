/* eslint-disable jsdoc/require-jsdoc */

import type { ISigningOptions } from "./ISigningOptions";

export interface ILdProofOptions extends ISigningOptions {
    /** The anchorage to which anchor the proof. */
    anchorageID: string;
}
