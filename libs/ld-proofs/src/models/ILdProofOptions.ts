import { ISigningOptions } from "./ISigningOptions";

export default interface ILdProofOptions extends ISigningOptions {
    /** The anchorage to which anchor the proof */
    anchorageID: string;
}
