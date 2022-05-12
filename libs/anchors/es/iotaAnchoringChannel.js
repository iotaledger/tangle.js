import { AnchoringChannelError } from "./errors/anchoringChannelError";
import { AnchoringChannelErrorNames } from "./errors/anchoringChannelErrorNames";
import { ClientHelper } from "./helpers/clientHelper";
import { SeedHelper } from "./helpers/seedHelper";
import ValidationHelper from "./helpers/validationHelper";
import AnchorMsgService from "./services/anchorMsgService";
import ChannelService from "./services/channelService";
import FetchMsgService from "./services/fetchMsgService";
export class IotaAnchoringChannel {
    constructor(channelID, nodeInfo, isPrivate, encrypted) {
        this._node = nodeInfo;
        this._channelID = channelID;
        const components = channelID.split(":");
        this._channelAddress = components[0];
        this._announceMsgID = components[1];
        if (isPrivate) {
            this._keyLoadMsgID = components[2];
        }
        this._encrypted = encrypted;
        this._isPrivate = isPrivate;
    }
    /**
     *  Returns the channelID ('channelAddress:announce_msg_id')
     *
     *  @returns channel ID
     */
    get channelID() {
        return this._channelID;
    }
    /**
     *  Returns the channel's address
     *
     *  @returns channel address
     */
    get channelAddr() {
        return this._channelAddress;
    }
    /**
     *  Returns the channel's first anchorage ID
     *
     *  @returns anchorageID
     */
    get firstAnchorageID() {
        let result = this._keyLoadMsgID;
        if (!result) {
            result = this._announceMsgID;
        }
        return result;
    }
    /**
     *  Returns the channel's node
     *
     *  @returns node
     */
    get node() {
        return this._node.node;
    }
    /**
     *  Returns the channel's publisher seed
     *
     *  @returns seed
     */
    get seed() {
        return this._seed;
    }
    /**
     *  Returns the channel's author Public Key
     *
     *  @returns the Author's Public key
     */
    get authorPubKey() {
        return this._authorPubKey;
    }
    /**
     *  Returns the channel's subscriber Public Key
     *
     *  @returns the subscriber's Public key
     */
    get subscriberPubKey() {
        return this._subscriberPubKey;
    }
    /**
     *  Returns whether the channel is encrypted or not
     *
     *  @returns boolean
     */
    get encrypted() {
        return this._encrypted;
    }
    /**
     *  Returns whether the channel is private or not
     *
     *  @returns boolean
     */
    get isPrivate() {
        return this._isPrivate;
    }
    /**
     * Creates a new Anchoring Channel
     *
     * @param seed Author's seed
     * @param options  The options
     * @param options.node The node used to create the channel
     * @returns The anchoring channel details
     */
    static async create(seed, options) {
        if (options?.node && !ValidationHelper.url(options?.node)) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_NODE, "The node has to be a URL");
        }
        const node = options?.node;
        const permanode = options?.permanode;
        let encrypted = false;
        let isPrivate = false;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
        if (options?.encrypted === true) {
            encrypted = true;
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
        if (options?.isPrivate === true) {
            isPrivate = true;
        }
        if (!isPrivate && options?.presharedKeys) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR, "Pre-shared keys are only for Private Channels");
        }
        const client = await this.getClient(node, permanode);
        const { channelAddress, announceMsgID, keyLoadMsgID, authorPk } = await ChannelService.createChannel(client, seed, isPrivate, options?.presharedKeys);
        let firstAnchorageID = announceMsgID;
        if (keyLoadMsgID) {
            firstAnchorageID = keyLoadMsgID;
        }
        const details = {
            channelAddr: channelAddress,
            channelID: `${channelAddress}:${announceMsgID}${keyLoadMsgID ? `:${keyLoadMsgID}` : ""}`,
            firstAnchorageID,
            authorPubKey: authorPk,
            authorSeed: seed,
            node: node || this.DEFAULT_NODE,
            encrypted,
            isPrivate
        };
        return details;
    }
    /**
     * Instantiates an existing Anchoring Channel from a Channel ID
     *
     * @param channelID in the form of 'channel_address:announce_msg_id'
     * @param options Channel options
     * @returns reference to the channel
     */
    static fromID(channelID, options) {
        const components = channelID.split(":");
        let encrypted = false;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
        if (options?.encrypted === true) {
            encrypted = true;
        }
        let isPrivate = false;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
        if (options?.isPrivate === true) {
            isPrivate = true;
        }
        if (Array.isArray(components) &&
            ((components.length === 2 && !isPrivate) || (components.length === 3 && isPrivate))) {
            let node = options?.node;
            const permanode = options?.permanode;
            if (!node) {
                node = this.DEFAULT_NODE;
            }
            return new IotaAnchoringChannel(channelID, { node, permanode }, isPrivate, encrypted);
        }
        throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR, `Invalid channel identifier: ${channelID}`);
    }
    /**
     *  Creates a new IotaAnchoringChannel and subscribes to it using the Author's seed
     *
     *  i.e. Author === Subscriber
     *  A new Seed is automatically generated
     *
     * @param options The channel creation options
     * @returns The Anchoring Channel
     */
    static async bindNew(options) {
        const details = await IotaAnchoringChannel.create(SeedHelper.generateSeed(), options);
        let opts = options;
        if (!opts) {
            opts = {};
        }
        return IotaAnchoringChannel.fromID(details.channelID, opts).bind(details.authorSeed);
    }
    static async getClient(node, permanode) {
        let client;
        if (!node && !permanode) {
            client = await ClientHelper.getMainnetClient();
        }
        else if (!node) {
            client = await ClientHelper.getClient(ClientHelper.DEFAULT_NODE, permanode);
        }
        else {
            client = await ClientHelper.getClient(node, permanode);
        }
        return client;
    }
    /**
     * Binds the channel so that the subscriber is instantiated using the seed passed as parameter
     *
     * @param seed The Subscriber (publisher) seed
     * @param psk The Subscriber preshared key
     * @returns a Reference to the channel
     */
    async bind(seed, psk) {
        if (this._subscriber) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_ALREADY_BOUND, `Channel already bound to ${this._channelID}`);
        }
        this._seed = seed;
        const client = await IotaAnchoringChannel.getClient(this._node.node, this._node.permanode);
        const bindRequest = {
            client,
            seed: this._seed,
            isPrivate: this._isPrivate,
            presharedKey: psk,
            encrypted: this._encrypted,
            channelID: this._channelID
        };
        // The author's PK for the time being is not set because cannot be obtained from the
        // announce message
        const { subscriber, authorPk } = await ChannelService.bindToChannel(bindRequest);
        this._authorPubKey = authorPk;
        this._subscriber = subscriber;
        this._subscriberPubKey = subscriber.get_public_key();
        return this;
    }
    /**
     * Anchors a message to the anchoring channel
     *
     * @param message Message to be anchored
     * @param anchorageID The anchorage to be used
     * @returns The result of the operation
     */
    async anchor(message, anchorageID) {
        if (!this._subscriber) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_NOT_BOUND, "Unbound anchoring channel. Please call bind first");
        }
        const request = {
            channelID: this._channelID,
            encrypted: this._encrypted,
            isPrivate: this._isPrivate,
            subscriber: this._subscriber,
            message,
            anchorageID
        };
        const result = await AnchorMsgService.anchor(request);
        return result;
    }
    /**
     * Fetches a previously anchored message
     *
     * @param anchorageID The anchorage point
     * @param messageID  The expected ID of the anchored message
     * @returns The fetch result
     */
    async fetch(anchorageID, messageID) {
        if (!this._subscriber) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_NOT_BOUND, "Unbound anchoring channel. Please call bind first");
        }
        const request = {
            channelID: this._channelID,
            encrypted: this._encrypted,
            isPrivate: this._isPrivate,
            subscriber: this._subscriber,
            msgID: messageID,
            anchorageID
        };
        return FetchMsgService.fetch(request);
    }
    /**
     * Fetches the next message anchored to the channel
     *
     * @returns The fetch result or undefined if no more messages can be fetched
     */
    async fetchNext() {
        if (!this._subscriber) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_NOT_BOUND, "Unbound anchoring channel. Please call bind first");
        }
        return FetchMsgService.fetchNext(this._subscriber, this._encrypted);
    }
    /**
     * Receives a previously anchored message
     * provided its anchorage has already been seen on the channel
     *
     * @param messageID  The ID of the message
     * @param anchorageID The expected ID of message's anchorage
     * @returns The message received and associated metadata
     */
    async receive(messageID, anchorageID) {
        if (!this._subscriber) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_NOT_BOUND, "Unbound anchoring channel. Please call bind first");
        }
        const request = {
            channelID: this._channelID,
            encrypted: this._encrypted,
            isPrivate: this._isPrivate,
            subscriber: this._subscriber,
            msgID: messageID,
            anchorageID
        };
        return FetchMsgService.receive(request);
    }
}
IotaAnchoringChannel.DEFAULT_NODE = ClientHelper.DEFAULT_NODE;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUFuY2hvcmluZ0NoYW5uZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YUFuY2hvcmluZ0NoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdkUsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDakYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3RELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLGdCQUFnQixNQUFNLDRCQUE0QixDQUFDO0FBVTFELE9BQU8sZ0JBQWdCLE1BQU0sNkJBQTZCLENBQUM7QUFDM0QsT0FBTyxjQUFjLE1BQU0sMkJBQTJCLENBQUM7QUFDdkQsT0FBTyxlQUFlLE1BQU0sNEJBQTRCLENBQUM7QUFHekQsTUFBTSxPQUFPLG9CQUFvQjtJQXlCN0IsWUFBb0IsU0FBaUIsRUFBRSxRQUFtQixFQUFFLFNBQWtCLEVBQUUsU0FBa0I7UUFDOUYsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7UUFFdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFFNUIsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV4QyxJQUFJLENBQUMsZUFBZSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVwQyxJQUFJLFNBQVMsRUFBRTtZQUNYLElBQUksQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RDO1FBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7SUFDaEMs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