import { Address, ChannelAddress, MsgId } from "@tangle.js/streams-wasm/node";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbEhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2NoYW5uZWxIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFjLE1BQU0sOEJBQThCLENBQUM7QUFFMUYsTUFBTSxPQUFPLGFBQWE7SUFDdEI7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFDLFlBQVksQ0FBQyxVQUFrQjtRQUN6QyxNQUFNLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQWdCLEVBQUUsV0FBbUI7UUFFbkUsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLElBQUksYUFBc0IsQ0FBQztRQUUzQixJQUFJLFFBQVEsQ0FBQztRQUViLElBQUk7WUFDQSxvQ0FBb0M7WUFDcEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxPQUFPLENBQzdCLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQ3BELEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQzNCLENBQUM7WUFDRixRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMscUJBQXFCLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDdEU7UUFBQyxNQUFNO1lBQ0osaUNBQWlDO1NBQ3BDO1FBRUQsSUFBSSxRQUFRLEVBQUU7WUFDVixhQUFhLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1NBQ2hCO1FBRUQsbUVBQW1FO1FBQ25FLE9BQU8sQ0FBQyxLQUFLLEVBQUU7WUFDWCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNwQyxNQUFNO2FBQ1Q7WUFFRCwyQ0FBMkM7WUFDM0MsYUFBYSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFeEMsSUFBSSxhQUFhLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLFdBQVcsRUFBRTtnQkFDaEQsS0FBSyxHQUFHLElBQUksQ0FBQzthQUNoQjtTQUNKO1FBRUQsT0FBTyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0NBQ0oifQ==