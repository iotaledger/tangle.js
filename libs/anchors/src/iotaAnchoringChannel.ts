import { Subscriber } from "@tangle.js/iota_streams_wasm";
import { AnchoringChannelError } from "./errors/anchoringChannelError";
import { AnchoringChannelErrorNames } from "./errors/anchoringChannelErrorNames";
import initialize from "./helpers/initializationHelper";
import { SeedHelper } from "./helpers/seedHelper";
import ValidationHelper from "./helpers/validationHelper";
import { IAnchoringRequest } from "./models/IAnchoringRequest";
import { IAnchoringResult } from "./models/IAnchoringResult";
import { IBindChannelRequest } from "./models/IBindChannelRequest";
import { IFetchRequest } from "./models/IFetchRequest";
import { IFetchResult } from "./models/IFetchResult";
import AnchorMsgService from "./services/anchorMsgService";
import ChannelService from "./services/channelService";
import FetchMsgService from "./services/fetchMsgService";

// Needed for the Streams WASM bindings
initialize();

export class IotaAnchoringChannel {
    private _channelID: string;

    private readonly _node: string;

    private readonly _seed: string;

    private _channelAddress: string;

    private _announceMsgID: string;

    private _subscriber: Subscriber;

    private _authorPk: string;

    private _publisherPk: string;

    private constructor(node: string, seed?: string) {
        this._node = node;
        this._seed = seed;

        if (!seed) {
            this._seed = SeedHelper.generateSeed();
        }
    }

    /**
     * Creates a new Anchoring Channel
     *
     * @param node  The node
     * @param seed  The seed
     *
     * @returns The anchoring channel
     */
    public static create(node: string, seed?: string): IotaAnchoringChannel {
        if (!ValidationHelper.url(node)) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.INVALID_NODE,
                "The node has to be a URL");
        }

        return new IotaAnchoringChannel(node, seed);
    }

    /**
     * Binds to an existing channel or creates a new binding
     *
     * @param channelID in the form of 'channel_address:announce_msg_id'
     *
     * @returns reference to the channel
     *
     */
    public async bind(channelID?: string): Promise<IotaAnchoringChannel> {
        if (this._subscriber) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_ALREADY_BOUND,
                `Channel already bound to ${this._channelID}`);
        }
        if (!channelID) {
            const { channelAddress, announceMsgID, authorPk } =
                        await ChannelService.createChannel(this._node, this._seed);
            this._channelAddress = channelAddress;
            this._announceMsgID = announceMsgID;
            this._channelID = `${channelAddress}:${announceMsgID}`;
            this._authorPk = authorPk;
        } else {
            const components: string[] = channelID.split(":");

            if (Array.isArray(components) && components.length === 2) {
                this._channelID = channelID;
                this._channelAddress = components[0];
                this._announceMsgID = components[1];
            } else {
                throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR,
                    `Invalid channel identifier: ${channelID}`);
            }
        }

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
        this._publisherPk = subscriber.get_public_key();

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
     *  Returns the channel's seed
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
     public get authorPk(): string {
        return this._authorPk;
    }

    /**
     *  Returns the channel's publisher Public Key
     *
     *  @returns the publisher's Public key
     *
     */
     public get publisherPk(): string {
        return this._publisherPk;
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
        if (!this._channelAddress) {
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
        if (!this._channelAddress) {
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
     * Receives a previously anchored message
     * provided its anchorage has already been seen on the channel
     *
     * @param messageID  The ID of the message
     * @param anchorageID The expected ID of message's anchorage
     *
     * @returns The message received and associated metadata
     */
     public async receive(messageID: string, anchorageID?: string): Promise<IFetchResult> {
        if (!this._channelAddress) {
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
