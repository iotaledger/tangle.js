/** Signing options */
export interface ISigningOptions {
    /** Signature Type */
    signatureType: string;
    /** The method used for signing (referred as a DID fragment identifier) */
    verificationMethod: string;
    /** The secret */
    secret: string;
}
