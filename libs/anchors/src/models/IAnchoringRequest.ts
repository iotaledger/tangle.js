import { Subscriber } from "@tangle.js/streams-wasm/node";

export interface IAnchoringRequest {
    /** The channel ID */
    channelID: string;
    /** Whether the channel is encrypted */
    encrypted: boolean;
    /** The IOTA Streams Subscriber */
    subscriber: Subscriber;
    /** The message */
    message: Buffer;
    /** The anchorage point */
    anchorageID: string;
}
