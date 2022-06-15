/** Signing options. */
export interface ISigningOptions {
    /** Signature Type. */
    signatureType: string;
    /** The method used for signing (referred as a DID fragment identifier). */
    verificationMethod: string;
    /** The secret either as a base58 string or as Uint8 Array. */
    secret: string | Uint8Array;
}
