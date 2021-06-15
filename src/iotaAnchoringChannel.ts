import { Author, ChannelType, SendOptions } from "wasm-node/iota_streams_wasm";
import AnchorageError from "./anchorError";
import AnchorErrorNames from "./anchorErrorNames";
import AnchorMsgService from "./anchorMsgService";
import { ChannelHelper, initialize } from "./channelHelper";
import FetchMsgService from "./fetchMsgService";
import { IAnchoringRequest } from "./IAnchoringRequest";
import { IAnchoringResult } from "./IAnchoringResult";
import { IFetchRequest } from "./IFetchRequest";
import { IFetchResult } from "./IFetchResult";

// Needed for the Streams WASM bindings
initialize();

export class IotaAnchoringChannel {
    private _channelID: string;

    private readonly _node: string;

    private readonly _seed: string;

    private _channelAddress: string;

    private _announceMsgID: string;

    private constructor(node: string, seed?: string) {
        this._node = node;
        this._seed = seed;

        if (!seed) {
            this._seed = ChannelHelper.generateSeed();
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
        if (!channelID) {
            const { channelAddress, announceMsgID } = await this.createChannel();
            this._channelAddress = channelAddress;
            this._announceMsgID = announceMsgID;
            this._channelID = `${channelAddress}:${announceMsgID}`;

            return this;
        }

        const components: string[] = channelID.split(":");

        if (!Array.isArray(components) || components.length !== 2) {
            throw new Error("Invalid Channel ID");
        }

        this._channelAddress = components[0];
        this._announceMsgID = components[1];

        return this;
    }

    public get channelID(): string {
        return this._channelID;
    }

    public get channelAddr(): string {
        return this._channelAddress;
    }

    public get firstAnchorageID(): string {
        return this._announceMsgID;
    }

    public get node(): string {
        return this._node;
    }

    public get seed(): string {
        return this._seed;
    }

    /**
     * Anchors a message to the anchoring channel
     *
     * @param message Message to be anchored
     * @param anchorageID The anchorage
     * @returns The result of the operation
     */
    public async anchor(message: string, anchorageID: string): Promise<IAnchoringResult> {
        if (!this._channelAddress) {
            throw new AnchorageError(AnchorErrorNames.CHANNEL_NOT_BOUND,
                "Unbound anchoring channel. Please call bind first");
        }

        const request: IAnchoringRequest = {
            node: this._node,
            seed: this._seed,
            channelID: this._channelID,
            message,
            anchorageID
        };

        const result = await AnchorMsgService.anchor(request);

        if (result instanceof Error) {
            throw result;
        }

        return result;
    }

    /**
     * Fetch a previously anchored message
     *
     * @param anchorageID The anchorage point
     * @param messageID  The ID of the message
     *
     * @returns The fetch result
     */
    public async fetch(anchorageID: string, messageID?: string): Promise<IFetchResult> {
        if (!this._channelAddress) {
            throw new Error("Unbound anchoring channel. Please call bind first");
        }

        const request: IFetchRequest = {
            node: this._node,
            seed: this._seed,
            channelID: this._channelID,
            channelAddress: this._channelAddress,
            msgID: messageID,
            anchorageID
        };

        return FetchMsgService.fetch(request);
    }

    /**
     *  Creates a new Channel
     *
     *  @returns The address of the channel created and the announce message ID
     *
     */
    private async createChannel(): Promise<{ channelAddress: string; announceMsgID: string }> {
        const options = new SendOptions(this._node, true);
        const auth = new Author(this._seed, options.clone(), ChannelType.SingleBranch);

        const response = await auth.clone().send_announce();
        const announceLink = response.get_link().copy();

        return {
            announceMsgID: announceLink.msg_id,
            channelAddress: auth.channel_address()
        };
    }
}
