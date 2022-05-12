import { Author, Subscriber, Address, ChannelType, StreamsClient } from "@iota/streams/node/streams.js";
import { AnchoringChannelError } from "../errors/anchoringChannelError";
import { AnchoringChannelErrorNames } from "../errors/anchoringChannelErrorNames";
import { ChannelHelper } from "../helpers/channelHelper";
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
     * @returns The address of the channel created and the announce message ID
     */
    static async createChannel(client, seed, isPrivate, psks) {
        try {
            const auth = Author.fromClient(client, seed, ChannelType.SingleBranch);
            const response = await auth.clone().send_announce();
            const announceLink = response.link.copy();
            let keyLoadMsgID;
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
        }
        catch (error) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.OTHER_ERROR, error.message);
        }
    }
    /**
     *  Binds to a channel by creating the corresponding IOTA Streams Subscriber and reading
     *  the announce message
     *
     * @param request The channel details
     * @returns IOTA Streams Subscriber object
     */
    static async bindToChannel(request) {
        let subscriber;
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
        }
        catch {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR, `Cannot bind to channel ${request.channelID}`);
        }
        // If the "keyload" has not been received we cannot continue it is a not allowed subscriber
        if (!keyLoadReceived) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.CHANNEL_BINDING_PERMISSION_ERROR, `Not allowed to bind to ${request.channelID}.`);
        }
        return { subscriber, authorPk: subscriber.author_public_key() };
    }
    static async preparePrivateChannel(announceLink, auth, psks) {
        for (const psk of psks) {
            auth.store_psk(psk);
        }
        const keyLoadResponse = await auth.clone().send_keyload_for_everyone(announceLink.copy());
        const keyLoadLinkCopy = keyLoadResponse.link.copy();
        return keyLoadLinkCopy.msgId.toString();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvY2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUN4RyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUN4RSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNsRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFJekQ7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFjO0lBQy9COzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFxQixFQUFFLElBQVksRUFBRSxTQUFrQixFQUFFLElBQWU7UUFFdEcsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFdkUsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDcEQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUUxQyxJQUFJLFlBQW9CLENBQUM7WUFFekIscUZBQXFGO1lBQ3JGLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtnQkFDcEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDakMsWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7YUFDdEY7WUFFRCxPQUFPO2dC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