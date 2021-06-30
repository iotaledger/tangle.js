export interface IVerificationOptions {
    /** The type of signature */
    type: string;
    /** Node to be used to resolve identities */
    node?: string;
    /** Verification method from a DID */
    verificationMethod: string;
}
