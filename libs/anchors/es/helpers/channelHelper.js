"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelHelper = void 0;
const iotaStreams_1 = require("../iotaStreams");
class ChannelHelper {
    /**
     * Converts an address representing as a two component string (channel addr: message Id)
     * into an Address object
     *
     * @param addressStr the address string
     * @returns the Address object
     */
    static parseAddress(addressStr) {
        const [channelAddr, msgId] = addressStr.split(":");
        return new iotaStreams_1.Address(iotaStreams_1.ChannelAddress.parse(channelAddr).copy(), iotaStreams_1.MsgId.parse(msgId));
    }
    /**
     *  Finds an anchorage message on the channel by going through the messages
     *
     * @param subs  Subscriber
     * @param anchorageID The anchorage identifier
     *
     * @returns whether it has been found and the link to the anchorage on the Channel
     */
    static findAnchorage(subs, anchorageID) {
        return __awaiter(this, void 0, void 0, function* () {
            let found = false;
            let anchorageLink;
            let response;
            try {
                // First we try to read such message
                const candidateLink = new iotaStreams_1.Address(iotaStreams_1.ChannelAddress.parse(subs.clone().channel_address()), iotaStreams_1.MsgId.parse(anchorageID));
                response = yield subs.clone().receive_signed_packet(candidateLink);
            }
            catch (_a) {
                // The message has not been found
            }
            if (response) {
                anchorageLink = response.link.copy();
                found = true;
            }
            // Iteratively retrieve messages until We find the one to anchor to
            while (!found) {
                const messages = yield subs.clone().fetch_next_msgs();
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
        });
    }
}
exports.ChannelHelper = ChannelHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbEhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2NoYW5uZWxIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsZ0RBQStHO0FBTS9HLE1BQWEsYUFBYTtJQUN0Qjs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsWUFBWSxDQUFDLFVBQWtCO1FBQ3pDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuRCxPQUFPLElBQUkscUJBQVksQ0FBQyw0QkFBYyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxtQkFBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksTUFBTSxDQUFPLGFBQWEsQ0FBQyxJQUFnQixFQUFFLFdBQW1COztZQUVuRSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbEIsSUFBSSxhQUFzQixDQUFDO1lBRTNCLElBQUksUUFBUSxDQUFDO1lBRWIsSUFBSTtnQkFDQSxvQ0FBb0M7Z0JBQ3BDLE1BQU0sYUFBYSxHQUFHLElBQUkscUJBQVksQ0FDbEMsNEJBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQ3BELG1CQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUMzQixDQUFDO2dCQUNGLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUN0RTtZQUFDLFdBQU07Z0JBQ0osaUNBQWlDO2FBQ3BDO1lBRUQsSUFBSSxRQUFRLEVBQUU7Z0JBQ1YsYUFBYSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3JDLEtBQUssR0FBRyxJQUFJLENBQUM7YUFDaEI7WUFFRCxtRUFBbUU7WUFDbkUsT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDWCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDdEQsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDcEMsTUFBTTtpQkFDVDtnQkFFRCwyQ0FBMkM7Z0JBQzNDLGFBQWEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUV4QyxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssV0FBVyxFQUFFO29CQUNoRCxLQUFLLEdBQUcsSUFBSSxDQUFDO2lCQUNoQjthQUNKO1lBRUQsT0FBTyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsQ0FBQztRQUNwQyxDQUFDO0tBQUE7Q0FDSjtBQTdERCxzQ0E2REMifQ==