import { SingleNodeClient } from "@iota/iota.js";
import { Address, ChannelAddress, MsgId } from "@iota/streams/node";
import { AnchoringChannelError } from "../errors/anchoringChannelError";
import { AnchoringChannelErrorNames } from "../errors/anchoringChannelErrorNames";
import { IotaAnchoringChannel } from "../iotaAnchoringChannel";

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
     *
     * @returns the tangle index encoded in hexadecimal chars
     */
    public static getIndexL1(channelAddress: string, messageId: string): string {
        const addr = new Address(ChannelAddress.parse(channelAddress), MsgId.parse(messageId));

        return addr.toMsgIndexHex();
    }

    /**
     * Given an anchoring channel and an anchored message ID returns the
     * corresponding message ID at L1 on the Ledger
     *
     * @param channel   The anchoring channel
     * @param messageId The Streams Message Id
     *
     * @returns the Layer 1 message ID
     */
    public static async getMsgIdL1(channel: IotaAnchoringChannel, messageId: string): Promise<string> {
        const addr = new Address(ChannelAddress.parse(channel.channelAddr), MsgId.parse(messageId));
        const index = addr.toMsgIndex();

        const client = new SingleNodeClient(channel.node);

        const messagesResponse = await client.messagesFind(index);

        if (messagesResponse.count === 0) {
            throw new AnchoringChannelError(
                AnchoringChannelErrorNames.L1_MSG_NOT_FOUND, "L1 message has not been found");
        }

        return messagesResponse.messageIds[0];
    }
}
