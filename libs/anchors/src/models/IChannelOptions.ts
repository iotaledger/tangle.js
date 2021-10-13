/** Options for creating a channel */
export interface IChannelOptions {
    /** The node used */
    node?: string;
    /** The permanode used */
    permanode?: string;

    /** Whether the data is going to be encrypted or not on the Tangle */
    encrypted?: boolean;

    /** Whether the channel is private and only authorized subscribers can get access to it */
    isPrivate?: boolean;
}
