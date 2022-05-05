import { Author, Subscriber, ChannelType } from "@iota/streams/node";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvY2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQVcsV0FBVyxFQUFpQixNQUFNLG9CQUFvQixDQUFDO0FBQzdGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUl6RDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsT0FBTyxPQUFPLGNBQWM7SUFDL0I7Ozs7Ozs7OztPQVNHO0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBcUIsRUFBRSxJQUFZLEVBQUUsU0FBa0IsRUFBRSxJQUFlO1FBRXRHLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXZFLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3BELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFMUMsSUFBSSxZQUFvQixDQUFDO1lBRXpCLHFGQUFxRjtZQUNyRixJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3BCLE1BQU0sYUFBYSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ2pDLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2FBQ3RGO1lBRUQsT0FBTztnQkFDSCxhQUFhLEVBQUUsWUFB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