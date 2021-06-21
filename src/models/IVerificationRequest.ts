export interface IVerificationRequest {
    /** Message to be verified */
    message: string;
    /** Hash algorithm */
    hashAlgorithm: string;
    /** The signature (proof) value */
    signatureValue: string;
    /** Node to be used to resolve identities */
    node?: string;
    /** Verification method from a DID */
    verificationMethod: string;
}
