import { Subscriber } from "@tangle.js/streams-wasm/node";

export interface IAnchoringRequest {
    /** The channel ID */
    channelID: string;
    /** The IOTA Streams Subscriber */
    subscriber: Subscriber;
    /** The message */
    message: Buffer;
    /** The anchorage point */
    anchorageID: string;
}
