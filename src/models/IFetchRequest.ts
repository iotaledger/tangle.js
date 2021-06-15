import { Subscriber } from "wasm-node/iota_streams_wasm";

export interface IFetchRequest {
    /** The channel ID */
    channelID: string;
    /** The specific message */
    msgID?: string;
    /** The anchorage */
    anchorageID: string;
    /** The IOTA Streams Subscriber */
    subscriber: Subscriber;
}
