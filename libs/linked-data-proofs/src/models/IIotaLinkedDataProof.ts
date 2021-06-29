import { ILinkedDataProof } from "./ILinkedDataProof";

export interface IIotaLinkedDataProof extends ILinkedDataProof {
    proofValue: {
        channelID: string;
        anchorageID: string;
        /** Message ID is optional and in that case */
        /* the message shall be the only one anchored to the anchorage */
        msgID?: string;
    };
}
