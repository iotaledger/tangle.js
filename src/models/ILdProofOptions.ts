import ILdSignatureOptions from "./ILdSignatureOptions";

export default interface ILdProofOptions extends ILdSignatureOptions {
    /** The anchorage to which anchor the proof */
    anchorageID: string;
}
