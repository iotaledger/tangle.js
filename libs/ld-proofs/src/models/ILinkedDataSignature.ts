import type { ILinkedDataProof } from "./ILinkedDataProof";

export interface ILinkedDataSignature extends ILinkedDataProof {
    proofValue: string;
}
