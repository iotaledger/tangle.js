export interface IFetchRequest {
    node: string;
    seed?: string;
    msgID: string;
    anchorageID: string;
    channelID: string;
    /** The first component of the channelID */
    channelAddress: string;
}
