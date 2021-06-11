import { Author, ChannelType, SendOptions } from "wasm-node/iota_streams_wasm";
import AnchorMsgService from "./anchorMsgService";
import { ChannelHelper } from "./channelHelper";
import FetchMsgService from "./fetchMsgService";
import { IAnchoringRequest } from "./IAnchoringRequest";
import { IAnchoringResult } from "./IAnchoringResult";
import { IFetchRequest } from "./IFetchRequest";
import { IFetchResult } from "./IFetchResult";

export class IotaAnchoringChannel {
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
     */
    public async bind(channelID?: string): Promise<IotaAnchoringChannel> {
        if (!channelID) {
            const { channelAddress, announceMsgID } = await this.createChannel();
            this._channelAddress = channelAddress;
            this._announceMsgID = announceMsgID;
            this._channelID = `${channelAddress}:${announceMsgID}`;

            return;
        }

        const components: string[] = channelID.split(":");

        if (!Array.isArray(components) || components.length !== 2) {
            throw new Error("Invalid Channel ID");
        }

        this._channelAddress = components[0];
        this._announceMsgID = components[1];

        return this;
    }

    get channelID(): string {
        return this._channelID;
    }

    get channelAddress(): string {
        return this._channelAddress;
    }

    get announceMsgID(): string {
        return this._announceMsgID;
    }

    get node(): string {
        return this._node;
    }

    get seed(): string {
        return this._seed;
    }

    private _channelID: string;
    private _node: string;
    private _seed: string;

    private _channelAddress: string;
    private _announceMsgID: string;

    private constructor(node: string, seed?: string) {
        this._node = node;
        this._seed = seed;

        if (!seed) {
            this._seed = ChannelHelper.generateSeed();
        }
    }

    public async anchor(message: string, anchorageID: string): Promise<IAnchoringResult> {
        if (!this._channelAddress) {
            throw new Error("Unbound anchoring channel. Please call bind first");
        }

        const request: IAnchoringRequest = {
            node: this._node,
            seed: this._seed,
            channelID: this._channelID,
            message,
            anchorageID
        };

        return await AnchorMsgService.anchor(request);
    }

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

        return await FetchMsgService.fetch(request);
    }

    /**
     *  Creates a new Channel 
     * 
     */
    private async createChannel(): Promise<{ channelAddress: string, announceMsgID: string }> {
        const options = new SendOptions(this._node, true);
        const auth = new Author(this._seed, options.clone(), ChannelType.SingleBranch);

        const response = await auth.clone().send_announce();
        const announceLink = response.get_link().copy();

        return {
            announceMsgID: announceLink.msg_id,
            channelAddress: auth.channel_address()
        }
    }
}
