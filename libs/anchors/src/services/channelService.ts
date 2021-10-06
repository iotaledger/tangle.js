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
     * @param isPrivate Whether the channel is private or not
     *
     * @returns The address of the channel created and the announce message ID
     *
     */
    public static async createChannel(node: string, seed: string, isPrivate: boolean):
        Promise<{ channelAddress: string; announceMsgID: string; keyLoadMsgID?: string; authorPk: string }> {
        const options = new SendOptions(node, true);
        try {
            const auth = new Author(seed, options.clone(), ChannelType.SingleBranch);

            const response = await auth.clone().send_announce();
            const announceLink = response.link.copy();

            let keyLoadMsgID: string;

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
            if (isPrivate === true) {
                keyLoadMsgID = await this.prepareChannelEncryption(announceLink, auth);
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
        let subscriber: Subscriber;
        let keyLoadReceived = true;

        try {
            const options = new SendOptions(request.node, true);
            subscriber = new Subscriber(request.seed, options.clone());
            const channel = request.channelID;

            const [channelAddr, announceMsgID, keyLoadMsgID] = channel.split(":");

            const announceLink = ChannelHelper.parseAddress(`${channelAddr}:${announceMsgID}`);

            await subscriber.clone().receive_announcement(announceLink);

            if (request.isPrivate) {
                console.log("Receiving a KeyLoad");

                const keyLoadLinkStr = `${request.channelID.split(":")[0]}:${keyLoadMsgID}`;
                const keyLoadLink = ChannelHelper.parseAddress(keyLoadLinkStr);
                keyLoadReceived = await subscriber.clone().receive_keyload(keyLoadLink);

                console.log("KeyLoad Received!!!");
            }
        } catch {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR,
                `Cannot bind to channel ${request.channelID}`);
        }

        // If the keyload has not been received we cannot continue it is a not allowed subscriber
        if (!keyLoadReceived) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_BINDING_PERMISSION_ERROR,
                `Not allowed to bind to ${request.channelID}.`);
        }

        return { subscriber, authorPk: subscriber.author_public_key() };
    }

    private static async prepareChannelEncryption(announceLink: Address, auth: Author): Promise<string> {
        const keyLoadResponse = await auth.clone().send_keyload_for_everyone(announceLink.copy());
        const keyLoadLinkCopy = keyLoadResponse.link.copy();

        return keyLoadLinkCopy.msgId.toString();
    }
}
