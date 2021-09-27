import { Subscriber } from "@tangle.js/streams-wasm/node";
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

    private readonly _encrypted: boolean;

    private readonly _channelAddress: string;

    private readonly _announceMsgID: string;

    private readonly _keyLoadMsgID: string;

    private _subscriber: Subscriber;

    private _authorPubKey: string;

    private _subscriberPubKey: string;

    private constructor(channelID: string, node: string, encrypted: boolean) {
        this._node = node;

        this._channelID = channelID;

        const components = channelID.split(":");

        this._channelAddress = components[0];
        this._announceMsgID = components[1];

        if (encrypted) {
            this._keyLoadMsgID = components[2];
        }

        this._encrypted = encrypted;
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

        let encrypted = false;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
        if (options?.encrypted === true) {
            encrypted = true;
        }

        const { channelAddress, announceMsgID, keyLoadMsgID, authorPk } =
            await ChannelService.createChannel(node, seed, encrypted);

        let firstAnchorageID = announceMsgID;
        if (keyLoadMsgID) {
            firstAnchorageID = keyLoadMsgID;
        }

        const details: IChannelDetails = {
            channelAddr: channelAddress,
            channelID: `${channelAddress}:${announceMsgID}${keyLoadMsgID ? `:${keyLoadMsgID}` : ""}`,
            firstAnchorageID,
            authorPubKey: authorPk,
            authorSeed: seed,
            node,
            encrypted
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

        let encrypted = false;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
        if (options?.encrypted === true) {
            encrypted = true;
        }

        if (Array.isArray(components) &&
            ((components.length === 2 && !encrypted) || (components.length === 3 && encrypted))) {
            let node = options?.node;

            if (!node) {
                node = this.DEFAULT_NODE;
            }
            return new IotaAnchoringChannel(channelID, node, encrypted);
        }
        throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR,
            `Invalid channel identifier: ${channelID}`);
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
    public static async bindNew(options?: IChannelOptions): Promise<IotaAnchoringChannel> {
        const details = await IotaAnchoringChannel.create(SeedHelper.generateSeed(), options);
        // Temporarily until Streams exposed it on the Subscriber
        let opts = options;
        if (!opts) {
            opts = {};
        }
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
     *  Returns the channel's subscriber Public Key
     *
     *  @returns the subscriber's Public key
     *
     */
    public get subscriberPubKey(): string {
        return this._subscriberPubKey;
    }

    /**
     *  Returns whether the channel is encrypted or not
     *
     *  @returns boolean
     *
     */
    public get encrypted(): boolean {
        return this._encrypted;
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
            encrypted: this._encrypted,
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
            encrypted: this._encrypted,
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

        return FetchMsgService.fetchNext(this._subscriber, this._encrypted);
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
            encrypted: this._encrypted,
            subscriber: this._subscriber,
            msgID: messageID,
            anchorageID
        };

        return FetchMsgService.receive(request);
    }
}
