/** Options for creating a channel */
export interface IChannelOptions {
    node?: string;
    /** Used internally. In the near future Streams will expose it seamlessly */
    authorPubKey?: string;
}
