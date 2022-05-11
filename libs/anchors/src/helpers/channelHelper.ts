import { Address, ChannelAddress, MsgId, Subscriber } from "@iota/streams/node/streams.js";

export class ChannelHelper {
    /**
     * Converts an address representing as a two component string (channel addr: message Id)
     * into an Address object
     *
     * @param addressStr the address string
     * @returns the Address object
     */
    public static parseAddress(addressStr: string): Address {
        const [channelAddr, msgId] = addressStr.split(":");
        return new Address(ChannelAddress.parse(channelAddr).copy(), MsgId.parse(msgId));
    }

    /**
     *  Finds an anchorage message on the channel by going through the messages
     *
     * @param subs  Subscriber
     * @param anchorageID The anchorage identifier
     *
     * @returns whether it has been found and the link to the anchorage on the Channel
     */
    public static async findAnchorage(subs: Subscriber, anchorageID: string):
        Promise<{ found: boolean; anchorageLink?: Address }> {
        let found = false;
        let anchorageLink: Address;

        let response;

        try {
            // First we try to read such message
            const candidateLink = new Address(
                ChannelAddress.parse(subs.clone().channel_address()),
                MsgId.parse(anchorageID)
            );
            response = await subs.clone().receive_signed_packet(candidateLink);
        } catch {
            // The message has not been found
        }

        if (response) {
            anchorageLink = response.link.copy();
            found = true;
        }

        while (!found) {
             // Iteratively retrieve messages until We find the one to anchor to
            let message = await subs.clone().fetchNextMsg();
            if (!message) {
                break;
            }

            anchorageLink = message.link.copy();

            if (anchorageLink.msgId.toString() === anchorageID) {
                found = true;
            }
        }

        return { found, anchorageLink };
    }
}
