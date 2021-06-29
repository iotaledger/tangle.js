export default interface ILdSignatureOptions {
    /** Signature Type */
    signatureType?: string;
    /** Verification method to be used */
    verificationMethod: string;
    /** Secret associated to the verification method to be used */
    secret: string;
}
