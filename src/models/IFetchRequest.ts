export interface IFetchRequest {
    /** The node */
    node: string;
    /** The seed to be used */
    seed?: string;
    /** The message */
    msgID?: string;
    /** The anchorage */
    anchorageID: string;
    /** Channel ID ('channel_address:announce_msg_id') */
    channelID: string;
    /** The first component of the channelID */
    channelAddress: string;
}
