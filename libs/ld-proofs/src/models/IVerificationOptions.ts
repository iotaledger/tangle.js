/* eslint-disable jsdoc/require-jsdoc */

export interface IVerificationOptions {
    /** The type of signature. */
    signatureType: string;
    /** Node to be used to resolve identities. */
    node?: string;
    /** Verification method from a DID. */
    verificationMethod: string;
}
