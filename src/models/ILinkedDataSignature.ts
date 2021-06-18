export interface ILinkedDataSignature {
    proof: {
        type: string;
        verificationMethod: string;
        created: string;
        signatureValue: string;
    };
}
