/**
 *  Result of signing request
 */
export interface ISigningResult {
    /** Id of the Verification method */
    verificationMethod: string;
    /** The value of th signature */
    signatureValue: string;
    /** When the signature was created */
    created: string;
}
