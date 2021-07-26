import { Subscriber } from "@tangle.js/streams-wasm/node";

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
