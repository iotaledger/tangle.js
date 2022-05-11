import { Author, Subscriber, Address, ChannelType, StreamsClient } from "@iota/streams/node/streams.cjs";
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
     *
     * @returns The address of the channel created and the announce message ID
     *
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
     *
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvY2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN6RyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUN4RSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNsRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFJekQ7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFjO0lBQy9COzs7Ozs7Ozs7T0FTRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQXFCLEVBQUUsSUFBWSxFQUFFLFNBQWtCLEVBQUUsSUFBZTtRQUV0RyxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUV2RSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNwRCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRTFDLElBQUksWUFBb0IsQ0FBQztZQUV6QixxRkFBcUY7WUFDckYsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO2dCQUNwQixNQUFNLGFBQWEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNqQyxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQzthQUN0RjtZQUVELE9BQU87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