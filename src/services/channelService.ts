import { Author, Subscriber, Address, ChannelType, SendOptions } from "wasm-node/iota_streams_wasm";
import AnchorError from "../errors/anchorError";
import AnchorErrorNames from "../errors/anchorErrorNames";
import { IBindChannelRequest } from "../models/IBindChannelRequest";


/**
 *  Service to interact with IOTA Streams Channels
 *
 */
export default class ChannelService {
    /**
     * Creates a new Channel
     * @param node The node on which the channel is created
     * @param seed The channel's seed
     *
     * @returns The address of the channel created and the announce message ID
     *
     */
    public static async createChannel(node: string, seed: string):
        Promise<{ channelAddress: string; announceMsgID: string }> {
        const options = new SendOptions(node, true);
        const auth = new Author(seed, options.clone(), ChannelType.SingleBranch);

        const response = await auth.clone().send_announce();
        const announceLink = response.get_link().copy();

        return {
            announceMsgID: announceLink.msg_id,
            channelAddress: auth.channel_address()
        };
    }

    /**
     *  Binds to a channel by creating the corresponding IOTA Streams Subscriber and reading
     *  the announce message
     * 
     * @param request The channel details
     * 
     * @returns IOTA Streams Subscriber object
     */
    public static async bindToChannel(request: IBindChannelRequest): Promise<Subscriber> {
        try {
            const options = new SendOptions(request.node, true);
            const subs = new Subscriber(request.seed, options.clone());

            // Channel contains the channel address and the announce messageID
            const channel = request.channelID;
            const announceLink = Address.from_string(channel).copy();

            await subs.clone().receive_announcement(announceLink);

            return subs;
        } catch {
            throw new AnchorError(AnchorErrorNames.CHANNEL_BINDING_ERROR,
                `Cannot bind to channel ${request.channelID}`);
        }
    }
}
