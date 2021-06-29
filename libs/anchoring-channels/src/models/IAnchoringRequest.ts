import { Subscriber } from "@tangle.js/iota_streams_wasm";

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
