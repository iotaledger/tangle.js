import { Subscriber } from "@tangle.js/iota_streams_wasm";
import { AnchoringChannelError } from "./errors/anchoringChannelError";
import { AnchoringChannelErrorNames } from "./errors/anchoringChannelErrorNames";
import initialize from "./helpers/initializationHelper";
import { SeedHelper } from "./helpers/seedHelper";
import ValidationHelper from "./helpers/validationHelper";
import { IAnchoringRequest } from "./models/IAnchoringRequest";
import { IAnchoringResult } from "./models/IAnchoringResult";
import { IBindChannelRequest } from "./models/IBindChannelRequest";
import { IChannelDetails } from "./models/IChannelDetails";
import { IChannelOptions } from "./models/IChannelOptions";
import { IFetchRequest } from "./models/IFetchRequest";
import { IFetchResult } from "./models/IFetchResult";
import AnchorMsgService from "./services/anchorMsgService";
import ChannelService from "./services/channelService";
import FetchMsgService from "./services/fetchMsgService";


// Needed for the Streams WASM bindings
initialize();

export class IotaAnchoringChannel {
    public static readonly DEFAULT_NODE = "https://chrysalis-nodes.iota.org";

    private readonly _channelID: string;

    private readonly _node: string;

    private _seed: string;

    private readonly _channelAddress: string;

    private readonly _announceMsgID: string;

    private _subscriber: Subscriber;

    private readonly _authorPubKey: string;

    private _publisherPubKey: string;

    // authorPubKey param will disappear in the future
    private constructor(channelAddr: string, announceMsgID: string, node: string, authorPubKey: string) {
        this._node = node;

        this._channelID = `${channelAddr}:${announceMsgID}`;
        this._channelAddress = channelAddr;
        this._announceMsgID = announceMsgID;

        this._authorPubKey = authorPubKey;
    }

    /**
     * Creates a new Anchoring Channel
     *
     * @param seed Author's seed
     * @param options  The options
     * @param options.node The node used to create the channel
     *
     * @returns The anchoring channel details
     */
    public static async create(seed: string, options?: IChannelOptions): Promise<IChannelDetails> {
        if (options?.node && !ValidationHelper.url(options?.node)) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_NODE,
                "The node has to be a URL");
        }

        let node = options?.node;

        if (!node) {
            node = this.DEFAULT_NODE;
        }

        const { channelAddress, announceMsgID, authorPk } =
            await ChannelService.createChannel(node, seed);

        const details: IChannelDetails = {
            channelID: `${channelAddress}:${announceMsgID}`,
            firstAnchorageID: announceMsgID,
            authorPubKey: authorPk,
            authorSeed: seed,
            node
        };

        return details;
    }

    /**
     * Instantiates an existing Anchoring Channel from a Channel ID
     *
     * @param channelID in the form of 'channel_address:announce_msg_id'
     * @param options Channel options
     *
     * @returns reference to the channel
     *
     */
    public static fromID(channelID: string, options?: IChannelOptions): IotaAnchoringChannel {
        const components: string[] = channelID.split(":");

        if (Array.isArray(components) && components.length === 2) {
            let node = options?.node;

            if (!node) {
                node = this.DEFAULT_NODE;
            }
            const authorPubKey = options?.authorPubKey;
            return new IotaAnchoringChannel(components[0], components[1], node, authorPubKey);
        }
        throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR,
            `Invalid channel identifier: ${channelID}`);
    }

    /**
     *  Builds a new IotaAnchoringChannel by creating it and binding it using the Author's seed
     *  i.e. Author === Subscriber
     *  A new Seed is automatically generated
     *
     * @param options The channel creation options
     * @returns The Anchoring Channel
     */
    public static async buildNew(options?: IChannelOptions): Promise<IotaAnchoringChannel> {
        const details = await IotaAnchoringChannel.create(SeedHelper.generateSeed(), options);
        // Temporarily until Streams exposed it on the Subscriber
        let opts = options;
        if (!opts) {
            opts = {};
        }
        opts.authorPubKey = details.authorPubKey;
        return IotaAnchoringChannel.fromID(details.channelID, opts).bind(details.authorSeed);
    }

    /**
     * Binds the channel so that the subscriber is instantiated using the seed passed as parameter
     *
     * @param seed The Subscriber (publisher) seed
     * @returns a Reference to the channel
     *
     */
    public async bind(seed: string): Promise<IotaAnchoringChannel> {
        if (this._subscriber) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_ALREADY_BOUND,
                `Channel already bound to ${this._channelID}`);
        }
        this._seed = seed;

        const bindRequest: IBindChannelRequest = {
            node: this._node,
            seed: this._seed,
            channelID: this._channelID
        };

        // The author's PK for the time being is not set because cannot be obtained from the
        // announce message
        const { subscriber } = await ChannelService.bindToChannel(bindRequest);

        this._subscriber = subscriber;
        // this._authorPk = authorPk;
        this._publisherPubKey = subscriber.get_public_key();

        return this;
    }

    /**
     *  Returns the channelID ('channelAddress:announce_msg_id')
     *
     *  @returns channel ID
     *
     */
    public get channelID(): string {
        return this._channelID;
    }

    /**
     *  Returns the channel's address
     *
     *  @returns channel address
     *
     */
    public get channelAddr(): string {
        return this._channelAddress;
    }

    /**
     *  Returns the channel's first anchorage ID
     *
     *  @returns anchorageID
     *
     */
    public get firstAnchorageID(): string {
        return this._announceMsgID;
    }

    /**
     *  Returns the channel's node
     *
     *  @returns node
     *
     */
    public get node(): string {
        return this._node;
    }

    /**
     *  Returns the channel's publisher seed
     *
     *  @returns seed
     *
     */
    public get seed(): string {
        return this._seed;
    }

    /**
     *  Returns the channel's author Public Key
     *
     *  @returns the Author's Public key
     *
     */
    public get authorPubKey(): string {
        return this._authorPubKey;
    }

    /**
     *  Returns the channel's publisher Public Key
     *
     *  @returns the publisher's Public key
     *
     */
    public get publisherPubKey(): string {
        return this._publisherPubKey;
    }

    /**
     * Anchors a message to the anchoring channel
     *
     * @param message Message to be anchored
     * @param anchorageID The anchorage to be used
     *
     * @returns The result of the operation
     *
     */
    public async anchor(message: Buffer, anchorageID: string): Promise<IAnchoringResult> {
        if (!this._subscriber) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_NOT_BOUND,
                "Unbound anchoring channel. Please call bind first");
        }

        const request: IAnchoringRequest = {
            channelID: this._channelID,
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
     *
     * @returns The fetch result
     */
    public async fetch(anchorageID: string, messageID?: string): Promise<IFetchResult> {
        if (!this._subscriber) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_NOT_BOUND,
                "Unbound anchoring channel. Please call bind first");
        }

        const request: IFetchRequest = {
            channelID: this._channelID,
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
    public async fetchNext(): Promise<IFetchResult | undefined> {
        if (!this._subscriber) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_NOT_BOUND,
                "Unbound anchoring channel. Please call bind first");
        }

        return FetchMsgService.fetchNext(this._subscriber);
    }

    /**
     * Receives a previously anchored message
     * provided its anchorage has already been seen on the channel
     *
     * @param messageID  The ID of the message
     * @param anchorageID The expected ID of message's anchorage
     *
     * @returns The message received and associated metadata
     */
    public async receive(messageID: string, anchorageID?: string): Promise<IFetchResult> {
        if (!this._subscriber) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_NOT_BOUND,
                "Unbound anchoring channel. Please call bind first");
        }

        const request: IFetchRequest = {
            channelID: this._channelID,
            subscriber: this._subscriber,
            msgID: messageID,
            anchorageID
        };

        return FetchMsgService.receive(request);
    }
}
