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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-duplicate-imports */
const iota_streams_wasm_1 = require("@jmcanterafonseca-iota/iota_streams_wasm");
const anchoringChannelError_1 = __importDefault(require("../errors/anchoringChannelError"));
const anchoringChannelErrorNames_1 = __importDefault(require("../errors/anchoringChannelErrorNames"));
const channelHelper_1 = require("../helpers/channelHelper");
class FetchMsgService {
    static fetch(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const subs = request.subscriber;
            const announceMsgID = request.channelID.split(":")[1];
            const anchorageID = request.anchorageID;
            let found = true;
            if (anchorageID !== announceMsgID) {
                ({ found } = yield channelHelper_1.ChannelHelper.findAnchorage(subs, anchorageID));
            }
            if (!found) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.ANCHORAGE_NOT_FOUND, `The anchorage point ${anchorageID} has not been found on the channel`);
            }
            const msgID = request.msgID;
            let response;
            // If the messageID is passed we retrieve it
            if (msgID) {
                const msgLink = iota_streams_wasm_1.Address.from_string(`${subs.clone().channel_address()}:${msgID}`);
                try {
                    response = yield subs.clone().receive_signed_packet(msgLink);
                }
                catch (_a) {
                    throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.MSG_NOT_FOUND, `The message ${msgID} has not been found on the Channel`);
                }
            }
            else {
                // Otherwise we just fetch the next message
                const messages = yield subs.clone().fetch_next_msgs();
                if (!messages || messages.length === 0) {
                    throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.MSG_NOT_FOUND, `There is not message anchored to ${anchorageID}`);
                }
                response = messages[0];
            }
            const messageContent = Buffer.from(response.get_message().get_public_payload()).toString();
            const receivedMsgID = response.get_link().copy().msg_id;
            if (msgID && receivedMsgID !== msgID) {
                throw new Error("Requested message ID and fetched message ID are not equal");
            }
            const pk = response.get_message().get_pk();
            return {
                message: messageContent,
                msgID,
                pk
            };
        });
    }
}
exports.default = FetchMsgService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2hNc2dTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL2ZldGNoTXNnU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHlDQUF5QztBQUN6QyxnRkFBbUU7QUFDbkUsNEZBQW9FO0FBQ3BFLHNHQUE4RTtBQUM5RSw0REFBeUQ7QUFJekQsTUFBcUIsZUFBZTtJQUMzQixNQUFNLENBQU8sS0FBSyxDQUFDLE9BQXNCOztZQUM5QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBRWhDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7WUFFeEMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBRWpCLElBQUksV0FBVyxLQUFLLGFBQWEsRUFBRTtnQkFDakMsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7YUFDcEU7WUFFRCxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNWLE1BQU0sSUFBSSwrQkFBcUIsQ0FBQyxvQ0FBMEIsQ0FBQyxtQkFBbUIsRUFDNUUsdUJBQXVCLFdBQVcsb0NBQW9DLENBQUMsQ0FBQzthQUMzRTtZQUVELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDNUIsSUFBSSxRQUFRLENBQUM7WUFFYiw0Q0FBNEM7WUFDNUMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsTUFBTSxPQUFPLEdBQUcsMkJBQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsZUFBZSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDbEYsSUFBSTtvQkFDRixRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQzlEO2dCQUFDLFdBQU07b0JBQ04sTUFBTSxJQUFJLCtCQUFxQixDQUFDLG9DQUEwQixDQUFDLGFBQWEsRUFDdEUsZUFBZSxLQUFLLG9DQUFvQyxDQUFDLENBQUM7aUJBQzdEO2FBQ0Y7aUJBQU07Z0JBQ0wsMkNBQTJDO2dCQUMzQyxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFFdEQsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDdEMsTUFBTSxJQUFJLCtCQUFxQixDQUFDLG9DQUEwQixDQUFDLGFBQWEsRUFDdEUsb0NBQW9DLFdBQVcsRUFBRSxDQUFDLENBQUM7aUJBQ3REO2dCQUVELFFBQVEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEI7WUFFRCxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDM0YsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUV4RCxJQUFJLEtBQUssSUFBSSxhQUFhLEtBQUssS0FBSyxFQUFFO2dCQUNwQyxNQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7YUFDOUU7WUFDRCxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFM0MsT0FBTztnQkFDTCxPQUFPLEVBQUUsY0FBYztnQkFDdkIsS0FBSztnQkFDTCxFQUFFO2FBQ0gsQ0FBQztRQUNKLENBQUM7S0FBQTtDQUNGO0FBekRELGtDQXlEQyJ9