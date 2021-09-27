import { Author, Subscriber, Address, ChannelType, SendOptions } from "@tangle.js/streams-wasm/node";
import { AnchoringChannelError } from "../errors/anchoringChannelError";
import { AnchoringChannelErrorNames } from "../errors/anchoringChannelErrorNames";
import { ChannelHelper } from "../helpers/channelHelper";
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
     * @param encrypted Whether the channel is encrypted or not
     *
     * @returns The address of the channel created and the announce message ID
     *
     */
    public static async createChannel(node: string, seed: string, encrypted: boolean):
        Promise<{ channelAddress: string; announceMsgID: string; keyLoadMsgID?: string; authorPk: string }> {
        const options = new SendOptions(node, true);
        try {
            const auth = new Author(seed, options.clone(), ChannelType.SingleBranch);

            const response = await auth.clone().send_announce();
            const announceLink = response.link.copy();

            let keyLoadMsgID: string;

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
            if (encrypted === true) {
                keyLoadMsgID = await this.prepareChannelEncryption(seed, options, announceLink, auth);
            }

            return {
                announceMsgID: announceLink.msgId.toString(),
                channelAddress: auth.channel_address(),
                authorPk: auth.get_public_key(),
                keyLoadMsgID
            };
        } catch (error) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.OTHER_ERROR, error.message);
        }
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
            const announceLink = ChannelHelper.parseAddress(channel);

            await subscriber.clone().receive_announcement(announceLink);

            if (request.encrypted) {
                console.log("Receiving a KeyLoad");

                const keyLoadMsgID = request.channelID.split(":")[2];
                const keyLoadLinkStr = `${request.channelID.split(":")[0]}:${keyLoadMsgID}`;
                 const keyLoadLink = ChannelHelper.parseAddress(keyLoadLinkStr);
                await subscriber.clone().receive_keyload(keyLoadLink);

                console.log("KeyLoad Received!!!");
            }

            return { subscriber, authorPk: subscriber.author_public_key() };
        } catch {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR,
                `Cannot bind to channel ${request.channelID}`);
        }
    }

    private static async prepareChannelEncryption(seed: string, options: SendOptions,
        announceLink: Address, auth: Author): Promise<string> {
        const subs = new Subscriber(seed, options.clone());

        let announceLinkCopy = announceLink.copy();
        await subs.clone().receive_announcement(announceLinkCopy);
        console.log("Announce received");

        announceLinkCopy = announceLink.copy();
        const subscrResponse = await subs.clone().send_subscribe(announceLinkCopy);
        console.log("Subscribe sent");

        const subscribeLink = subscrResponse.link.copy();
        await auth.clone().receive_subscribe(subscribeLink);
        console.log("Subscription finalized");

        announceLinkCopy = announceLink.copy();

        const keyLoadResponse = await auth.clone().send_keyload_for_everyone(announceLinkCopy);
        const keyLoadLinkCopy = keyLoadResponse.link.copy();

       return keyLoadLinkCopy.msgId.toString();
    }
}
