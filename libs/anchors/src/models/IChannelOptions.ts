/** Options for creating a channel */
export interface IChannelOptions {
    node?: string;
    /** Used internally. In the near future Streams will expose it seamlessly */
    authorPubKey?: string;

    /** Whether the data is going to be encrypted or not on the Tangle */
    encrypted?: boolean;

    /** Whether the channel is private and only authorized subscribers can get access to it */
    isPrivate?: boolean;
}
