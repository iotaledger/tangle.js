export interface IBindChannelRequest {
    /** The node */
    node: string;
    /** The channel ID 'channel_address:announce_msg_id' */
    channelID: string;
    /** The seed */
    seed: string;
}
