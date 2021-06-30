export interface IFetchResult {
    /** The message ID */
    msgID: string;
    /** The public key of the anchoring entity */
    pk: string;
    /** The message */
    message: Buffer;
}
