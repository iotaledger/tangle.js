export interface IVerificationRequest {
    message: string;
    hashAlgorithm: string;
    signatureValue: string;
    node: string;
    verificationMethod: string;
}
