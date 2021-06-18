export interface ILinkedDataSignature {
    proof: {
        type: string;
        verificationMethod: string;
        created: string;
        proofPurpose: string;
        proofValue: string;
    };
}
