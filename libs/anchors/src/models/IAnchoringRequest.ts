import { Subscriber } from "../iotaStreams";

export interface IAnchoringRequest {
    /** The channel ID */
    channelID: string;
    /** Whether the channel is encrypted */
    encrypted: boolean;
    /** Whether the channel is private */
    isPrivate: boolean;
    /** The IOTA Streams Subscriber */
    subscriber: InstanceType<typeof Subscriber>;
    /** The message */
    message: Buffer;
    /** The anchorage point */
    anchorageID: string;
}
