import { SingleNodeClient } from "@iota/iota.js";
import { Address, ChannelAddress, MsgId } from "@iota/streams/node/streams.js";
import { AnchoringChannelError } from "../errors/anchoringChannelError";
import { AnchoringChannelErrorNames } from "../errors/anchoringChannelErrorNames";
/**
 * Helper class to deal with protocol aspects
 *
 */
export class ProtocolHelper {
    /**
     * Given a channel address and a message Id returns the corresponding L1 tangle index that
     * allows to locate the L1 Ledger message
     *
     * @param channelAddress The channel address
     * @param messageId The message identifier
     * @returns the tangle index encoded in hexadecimal chars
     */
    static getIndexL1(channelAddress, messageId) {
        const addr = new Address(ChannelAddress.parse(channelAddress), MsgId.parse(messageId));
        return addr.toMsgIndexHex();
    }
    /**
     * Given an anchoring channel and an anchored message ID returns the
     * corresponding message ID at L1 on the Ledger
     *
     * @param channel   The anchoring channel
     * @param messageId The Streams Message Id
     * @returns the Layer 1 message ID
     */
    static async getMsgIdL1(channel, messageId) {
        const addr = new Address(ChannelAddress.parse(channel.channelAddr), MsgId.parse(messageId));
        const index = addr.toMsgIndex();
        const client = new SingleNodeClient(channel.node);
        const messagesResponse = await client.messagesFind(index);
        if (messagesResponse.count === 0) {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.L1_MSG_NOT_FOUND, "L1 message has not been found");
        }
        return messagesResponse.messageIds[0];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9jb2xIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9wcm90b2NvbEhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDL0UsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDeEUsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFHbEY7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGNBQWM7SUFDdkI7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBQyxVQUFVLENBQUMsY0FBc0IsRUFBRSxTQUFpQjtRQUM5RCxNQUFNLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUV2RixPQUFPLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQTZCLEVBQUUsU0FBaUI7UUFDM0UsTUFBTSxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQzVGLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUVoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsRCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxRCxJQUFJLGdCQUFnQixDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7WUFDOUIsTUFBTSxJQUFJLHFCQUFxQixDQUMzQiwwQkFBMEIsQ0FBQyxnQkFBZ0IsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO1NBQ3JGO1FBRUQsT0FBTyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQztDQUNKIn0=