import { Address, ChannelAddress, MsgId, Subscriber } from "@tangle.js/streams-wasm/node/streams.js";
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
        while (!found) {
            // Iteratively retrieve messages until We find the one to anchor to
            const message = await subs.clone().fetchNextMsg();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbEhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2NoYW5uZWxIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBRXJHLE1BQU0sT0FBTyxhQUFhO0lBQ3RCOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBa0I7UUFDekMsTUFBTSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25ELE9BQU8sSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQWdCLEVBQUUsV0FBbUI7UUFFbkUsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLElBQUksYUFBc0IsQ0FBQztRQUUzQixJQUFJLFFBQVEsQ0FBQztRQUViLElBQUk7WUFDQSxvQ0FBb0M7WUFDcEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxPQUFPLENBQzdCLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQ3BELEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQzNCLENBQUM7WUFDRixRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMscUJBQXFCLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDdEU7UUFBQyxNQUFNO1lBQ0osaUNBQWlDO1NBQ3BDO1FBRUQsSUFBSSxRQUFRLEVBQUU7WUFDVixhQUFhLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1NBQ2hCO1FBRUQsT0FBTyxDQUFDLEtBQUssRUFBRTtZQUNYLG1FQUFtRTtZQUNuRSxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNsRCxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNWLE1BQU07YUFDVDtZQUVELGFBQWEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRXBDLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxXQUFXLEVBQUU7Z0JBQ2hELEtBQUssR0FBRyxJQUFJLENBQUM7YUFDaEI7U0FDSjtRQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLENBQUM7SUFDcEMsQ0FBQztDQUNKIn0=