import { Subscriber } from "wasm-node/iota_streams_wasm";

export interface IAnchoringRequest {
    /** The channel ID */
    channelID: string;
    /** The IOTA Streams Subscriber */
    subscriber: Subscriber;
    /** The message */
    message: string;
    /** The anchorage point */
    anchorageID: string;
}
