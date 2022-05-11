import { Author, Subscriber, Address, ChannelType, StreamsClient } from "@iota/streams/node/streams.cjs";
import { AnchoringChannelError } from "../errors/anchoringChannelError";
import { AnchoringChannelErrorNames } from "../errors/anchoringChannelErrorNames";
import { ChannelHelper } from "../helpers/channelHelper";
import type { IBindChannelRequest } from "../models/IBindChannelRequest";


/**
 *  Service to interact with IOTA Streams Channels
 *
 */
export default class ChannelService {
    /**
     * Creates a new Channel
     * @param client The client to use
     * @param seed The channel's seed
     * @param isPrivate Whether the channel is private or not
     * @param psks Preshared keys for the channel
     *
     * @returns The address of the channel created and the announce message ID
     *
     */
    public static async createChannel(client: StreamsClient, seed: string, isPrivate: boolean, psks?: string[]):
        Promise<{ channelAddress: string; announceMsgID: string; keyLoadMsgID?: string; authorPk: string }> {
        try {
            const auth = Author.fromClient(client, seed, ChannelType.SingleBranch);

            const response = await auth.clone().send_announce();
            const announceLink = response.link.copy();

            let keyLoadMsgID: string;

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
            if (isPrivate === true) {
                const presharedKeys = psks || [];
                keyLoadMsgID = await this.preparePrivateChannel(announceLink, auth, presharedKeys);
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
            subscriber = Subscriber.fromClient(request.client, request.seed);
            const channel = request.channelID;

            const [channelAddr, announceMsgID, keyLoadMsgID] = channel.split(":");

            const announceLink = ChannelHelper.parseAddress(`${channelAddr}:${announceMsgID}`);

            await subscriber.clone().receive_announcement(announceLink);

            if (request.isPrivate) {
                if (request.presharedKey) {
                    subscriber.clone().store_psk(request.presharedKey);
                }
                const keyLoadLinkStr = `${request.channelID.split(":")[0]}:${keyLoadMsgID}`;
                const keyLoadLink = ChannelHelper.parseAddress(keyLoadLinkStr);
                keyLoadReceived = await subscriber.clone().receive_keyload(keyLoadLink);
            }
        } catch {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR,
                `Cannot bind to channel ${request.channelID}`);
        }

        // If the "keyload" has not been received we cannot continue it is a not allowed subscriber
        if (!keyLoadReceived) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_BINDING_PERMISSION_ERROR,
                `Not allowed to bind to ${request.channelID}.`);
        }

        return { subscriber, authorPk: subscriber.author_public_key() };
    }

    private static async preparePrivateChannel(announceLink: Address, auth: Author, psks: string[]): Promise<string> {
        for (const psk of psks) {
            auth.store_psk(psk);
        }
        const keyLoadResponse = await auth.clone().send_keyload_for_everyone(announceLink.copy());
        const keyLoadLinkCopy = keyLoadResponse.link.copy();

        return keyLoadLinkCopy.msgId.toString();
    }
}
