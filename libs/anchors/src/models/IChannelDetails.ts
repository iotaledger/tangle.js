/** The details of a channel */
export interface IChannelDetails {
    /** ID of the channel */
    channelID: string;
    /** Channel Address */
    channelAddr: string;
    /** First anchorage ID */
    firstAnchorageID: string;
    /** Author's seed */
    authorSeed: string;
    /** Author's Public Key */
    authorPubKey: string;
    /** Node */
    node: string;
    /** encrypted or not encrypted */
    encrypted: boolean;
    /** isPrivate? */
    isPrivate: boolean;
}
