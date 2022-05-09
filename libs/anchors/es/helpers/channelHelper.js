import { Address, ChannelAddress, MsgId, Subscriber } from "@iota/streams/node";
export class ChannelHelper {
    /**
     * Converts an address representing as a two component string (channel addr: message Id)
     * into an Address object
     *
     * @param addressStr the address string
     * @returns the Address object
     */
    static parseAddress(addressStr) {
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
    static async findAnchorage(subs, anchorageID) {
        let found = false;
        let anchorageLink;
        let response;
        try {
            // First we try to read such message
            const candidateLink = new Address(ChannelAddress.parse(subs.clone().channel_address()), MsgId.parse(anchorageID));
            response = await subs.clone().receive_signed_packet(candidateLink);
        }
        catch {
            // The message has not been found
        }
        if (response) {
            anchorageLink = response.link.copy();
            found = true;
        }
        // Iteratively retrieve messages until We find the one to anchor to
        while (!found) {
            const messages = await subs.clone().fetch_next_msgs();
            if (!messages || messages.length === 0) {
                break;
            }
            // In our case only one message is expected
            anchorageLink = messages[0].link.copy();
            if (anchorageLink.msgId.toString() === anchorageID) {
                found = true;
            }
        }
        return { found, anchorageLink };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbEhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2NoYW5uZWxIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRWhGLE1BQU0sT0FBTyxhQUFhO0lBQ3RCOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBa0I7UUFDekMsTUFBTSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25ELE9BQU8sSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFnQixFQUFFLFdBQW1CO1FBRW5FLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNsQixJQUFJLGFBQXNCLENBQUM7UUFFM0IsSUFBSSxRQUFRLENBQUM7UUFFYixJQUFJO1lBQ0Esb0NBQW9DO1lBQ3BDLE1BQU0sYUFBYSxHQUFHLElBQUksT0FBTyxDQUM3QixjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUNwRCxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUMzQixDQUFDO1lBQ0YsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQ3RFO1FBQUMsTUFBTTtZQUNKLGlDQUFpQztTQUNwQztRQUVELElBQUksUUFBUSxFQUFFO1lBQ1YsYUFBYSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDckMsS0FBSyxHQUFHLElBQUksQ0FBQztTQUNoQjtRQUVELG1FQUFtRTtRQUNuRSxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQ1gsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDdEQsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDcEMsTUFBTTthQUNUO1lBRUQsMkNBQTJDO1lBQzNDLGFBQWEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRXhDLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxXQUFXLEVBQUU7Z0JBQ2hELEtBQUssR0FBRyxJQUFJLENBQUM7YUFDaEI7U0FDSjtRQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLENBQUM7SUFDcEMsQ0FBQztDQUNKIn0=