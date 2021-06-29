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
const iota_streams_wasm_1 = require("@tangle.js/iota_streams_wasm");
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
            const candidateLink = iota_streams_wasm_1.Address.from_string(`${subs.clone().channel_address()}:${anchorageID}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbEhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2NoYW5uZWxIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsb0VBQW1FO0FBRW5FLE1BQWEsYUFBYTtJQUN0Qjs7Ozs7OztPQU9HO0lBQ0ksTUFBTSxDQUFPLGFBQWEsQ0FBQyxJQUFnQixFQUFFLFdBQW1COztZQUVuRSxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbEIsSUFBSSxhQUFzQixDQUFDO1lBRTNCLG9DQUFvQztZQUNwQyxNQUFNLGFBQWEsR0FBRywyQkFBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxlQUFlLEVBQUUsSUFBSSxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBRTlGLElBQUksUUFBUSxDQUFDO1lBQ2IsSUFBSTtnQkFDQSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMscUJBQXFCLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDdEU7WUFBQyxXQUFNO2dCQUNMLGlDQUFpQzthQUNuQztZQUVELElBQUksUUFBUSxFQUFFO2dCQUNWLGFBQWEsR0FBRyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzNDLEtBQUssR0FBRyxJQUFJLENBQUM7YUFDaEI7WUFFRCxtRUFBbUU7WUFDbkUsT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDWCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDdEQsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDcEMsTUFBTTtpQkFDVDtnQkFFRCwyQ0FBMkM7Z0JBQzNDLGFBQWEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRTlDLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUU7b0JBQ3RDLEtBQUssR0FBRyxJQUFJLENBQUM7aUJBQ2hCO2FBQ0o7WUFFRCxPQUFPLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxDQUFDO1FBQ3BDLENBQUM7S0FBQTtDQUNKO0FBOUNELHNDQThDQyJ9