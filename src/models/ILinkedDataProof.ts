export interface ILinkedDataProof {
    proof: {
        type: string;
        verificationMethod: string;
        created: string;
        signatureValue: string;
    };
}
