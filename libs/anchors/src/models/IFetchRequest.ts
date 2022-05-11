import type { Subscriber } from "@iota/streams/node/streams.cjs";

export interface IFetchRequest {
    /** The channel ID */
    channelID: string;
    /** Whether the channel is encrypted */
    encrypted: boolean;
    /** Whether the channel is private */
    isPrivate: boolean;
    /** The specific message */
    msgID?: string;
    /** The anchorage */
    anchorageID: string;
    /** The IOTA Streams Subscriber */
    subscriber: Subscriber;
}
