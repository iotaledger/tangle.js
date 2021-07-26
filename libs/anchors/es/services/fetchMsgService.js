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
/* eslint-disable no-duplicate-imports */
const node_1 = require("@tangle.js/streams-wasm/node");
const anchoringChannelError_1 = require("../errors/anchoringChannelError");
const anchoringChannelErrorNames_1 = require("../errors/anchoringChannelErrorNames");
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
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND, `The anchorage point ${anchorageID} has not been found on the channel`);
            }
            const msgID = request.msgID;
            let response;
            // If the messageID is passed we retrieve it
            if (msgID) {
                const msgLink = node_1.Address.from_string(`${subs.clone().channel_address()}:${msgID}`);
                try {
                    response = yield subs.clone().receive_signed_packet(msgLink);
                }
                catch (_a) {
                    throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.MSG_NOT_FOUND, `The message ${msgID} has not been found on the Channel`);
                }
            }
            else {
                // Otherwise we just fetch the next message
                const messages = yield subs.clone().fetch_next_msgs();
                if (!messages || messages.length === 0) {
                    throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.MSG_NOT_FOUND, `There is not message anchored to ${anchorageID}`);
                }
                response = messages[0];
            }
            const messageContent = Buffer.from(response.get_message().get_public_payload());
            const receivedMsgID = response.get_link().copy().msg_id;
            if (msgID && receivedMsgID !== msgID) {
                throw new Error("Requested message ID and fetched message ID are not equal");
            }
            const pk = response.get_message().get_pk();
            return {
                message: messageContent,
                msgID: receivedMsgID,
                pk
            };
        });
    }
    static receive(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const subs = request.subscriber;
            const msgID = request.msgID;
            let response;
            const msgLink = node_1.Address.from_string(`${subs.clone().channel_address()}:${msgID}`);
            try {
                response = yield subs.clone().receive_signed_packet(msgLink);
            }
            catch (_a) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.MSG_NOT_FOUND, `The message ${msgID} has not been found on the Channel`);
            }
            // In the future we would need to check that the anchorageID is the expected one
            const messageContent = Buffer.from(response.get_message().get_public_payload());
            const pk = response.get_message().get_pk();
            return {
                message: messageContent,
                msgID,
                pk
            };
        });
    }
    static fetchNext(subscriber) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield subscriber.clone().fetch_next_msgs();
            if (!messages || messages.length === 0) {
                return;
            }
            const msg = messages[0];
            const result = {
                msgID: msg.get_link().copy().msg_id,
                pk: msg.get_message().get_pk(),
                message: Buffer.from(msg.get_message().get_public_payload())
            };
            return result;
        });
    }
}
exports.default = FetchMsgService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2hNc2dTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL2ZldGNoTXNnU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHlDQUF5QztBQUN6Qyx1REFBbUU7QUFDbkUsMkVBQXdFO0FBQ3hFLHFGQUFrRjtBQUNsRiw0REFBeUQ7QUFJekQsTUFBcUIsZUFBZTtJQUMzQixNQUFNLENBQU8sS0FBSyxDQUFDLE9BQXNCOztZQUM5QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBRWhDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7WUFFeEMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBRWpCLElBQUksV0FBVyxLQUFLLGFBQWEsRUFBRTtnQkFDakMsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7YUFDcEU7WUFFRCxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNWLE1BQU0sSUFBSSw2Q0FBcUIsQ0FBQyx1REFBMEIsQ0FBQyxtQkFBbUIsRUFDNUUsdUJBQXVCLFdBQVcsb0NBQW9DLENBQUMsQ0FBQzthQUMzRTtZQUVELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDNUIsSUFBSSxRQUFRLENBQUM7WUFFYiw0Q0FBNEM7WUFDNUMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsTUFBTSxPQUFPLEdBQUcsY0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxlQUFlLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRixJQUFJ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