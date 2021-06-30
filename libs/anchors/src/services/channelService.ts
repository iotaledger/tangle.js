import { Author, Subscriber, Address, ChannelType, SendOptions } from "@tangle.js/iota_streams_wasm";
import { AnchoringChannelError } from "../errors/anchoringChannelError";
import { AnchoringChannelErrorNames } from "../errors/anchoringChannelErrorNames";
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
        Promise<{ channelAddress: string; announceMsgID: string; authorPk: string }> {
        const options = new SendOptions(node, true);
        const auth = new Author(seed, options.clone(), ChannelType.SingleBranch);

        const response = await auth.clone().send_announce();
        const announceLink = response.get_link().copy();

        return {
            announceMsgID: announceLink.msg_id,
            channelAddress: auth.channel_address(),
            authorPk: auth.get_public_key()
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
    public static async bindToChannel(request: IBindChannelRequest): Promise<{
        subscriber: Subscriber;
        authorPk: string;
    }> {
        try {
            const options = new SendOptions(request.node, true);
            const subscriber = new Subscriber(request.seed, options.clone());

            // Channel contains the channel address and the announce messageID
            const channel = request.channelID;
            const announceLink = Address.from_string(channel).copy();

            /* const announcement = */ await subscriber.clone().receive_announcement(announceLink);

            return { subscriber, authorPk: /* announcement.get_message().get_pk()*/ "" };
        } catch {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR,
                `Cannot bind to channel ${request.channelID}`);
        }
    }
}
