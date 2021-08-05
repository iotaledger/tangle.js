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
const node_1 = require("@tangle.js/streams-wasm/node");
class ChannelHelper {
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
            // First we try to read such message
            const candidateLink = node_1.Address.from_string(`${subs.clone().channel_address()}:${anchorageID}`);
            let response;
            try {
                response = yield subs.clone().receive_signed_packet(candidateLink);
            }
            catch (_a) {
                // The message has not been found
            }
            if (response) {
                anchorageLink = response.get_link().copy();
                found = true;
            }
            // Iteratively retrieve messages until We find the one to anchor to
            while (!found) {
                const messages = yield subs.clone().fetch_next_msgs();
                if (!messages || messages.length === 0) {
                    break;
                }
                // In our case only one message is expected
                anchorageLink = messages[0].get_link().copy();
                if (anchorageLink.msg_id === anchorageID) {
                    found = true;
                }
            }
            return { found, anchorageLink };
        });
    }
}
exports.ChannelHelper = ChannelHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbEhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2NoYW5uZWxIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsdURBQW1FO0FBRW5FLE1BQWEsYUFBYTtJQUN0Qjs7Ozs7OztPQU9HO0lBQ0ksTUFBTSxDQUFPLGFBQWEsQ0FBQyxJQUFnQixFQUFFLFdBQW1COztZQUVuRSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbEIsSUFBSSxhQUFzQixDQUFDO1lBRTNCLG9DQUFvQztZQUNwQyxNQUFNLGFBQWEsR0FBRyxjQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLGVBQWUsRUFBRSxJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFFOUYsSUFBSSxRQUFRLENBQUM7WUFDYixJQUFJO2dCQUNBLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUN0RTtZQUFDLFdBQU07Z0JBQ0wsaUNBQWlDO2FBQ25DO1lBRUQsSUFBSSxRQUFRLEVBQUU7Z0JBQ1YsYUFBYSxHQUFHLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDM0MsS0FBSyxHQUFHLElBQUksQ0FBQzthQUNoQjtZQUVELG1FQUFtRTtZQUNuRSxPQUFPLENBQUMsS0FBSyxFQUFFO2dCQUNYLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUN0RCxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUNwQyxNQUFNO2lCQUNUO2dCQUVELDJDQUEyQztnQkFDM0MsYUFBYSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFOUMsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBRTtvQkFDdEMsS0FBSyxHQUFHLElBQUksQ0FBQztpQkFDaEI7YUFDSjtZQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLENBQUM7UUFDcEMsQ0FBQztLQUFBO0NBQ0o7QUE5Q0Qsc0NBOENDIn0=