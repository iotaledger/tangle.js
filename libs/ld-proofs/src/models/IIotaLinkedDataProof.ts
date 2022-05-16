/* eslint-disable jsdoc/require-jsdoc */

import type { ILinkedDataProof } from "./ILinkedDataProof";

export interface IIotaLinkedDataProof extends ILinkedDataProof {
    proofValue: {
        channelID: string;
        anchorageID: string;
        /** Message ID is optional and in that case. */
        /* The message shall be the only one anchored to the anchorage. */
        msgID?: string;
        /** The message ID on Layer 1. */
        msgIDL1?: string;
    };
}
