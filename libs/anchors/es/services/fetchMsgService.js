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
const anchoringChannelError_1 = require("../errors/anchoringChannelError");
const anchoringChannelErrorNames_1 = require("../errors/anchoringChannelErrorNames");
const channelHelper_1 = require("../helpers/channelHelper");
class FetchMsgService {
    static fetch(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const subs = request.subscriber;
            const components = request.channelID.split(":");
            let targetMsgID = components[1];
            // If it is encrypted the first anchorage is the keyLoad
            if (request.encrypted) {
                targetMsgID = components[2];
            }
            const anchorageID = request.anchorageID;
            let found = true;
            if (anchorageID !== targetMsgID) {
                ({ found } = yield channelHelper_1.ChannelHelper.findAnchorage(subs, anchorageID));
            }
            if (!found) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND, `The anchorage point ${anchorageID} has not been found on the channel`);
            }
            const msgID = request.msgID;
            let response;
            // If the messageID is passed we retrieve it
            if (msgID) {
                const msgLink = channelHelper_1.ChannelHelper.parseAddress(`${subs.clone().channel_address()}:${msgID}`);
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
            let messageContent = Buffer.from(response.message.get_public_payload());
            if (request.encrypted) {
                messageContent = Buffer.from(response.message.get_masked_payload());
            }
            const receivedMsgID = response.link.copy().msgId.toString();
            if (msgID && receivedMsgID !== msgID) {
                throw new Error("Requested message ID and fetched message ID are not equal");
            }
            const pk = response.message.get_pk();
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
            const msgLink = channelHelper_1.ChannelHelper.parseAddress(`${subs.clone().channel_address()}:${msgID}`);
            try {
                response = yield subs.clone().receive_signed_packet(msgLink);
            }
            catch (_a) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.MSG_NOT_FOUND, `The message ${msgID} has not been found on the Channel`);
            }
            // In the future we would need to check that the anchorageID is the expected one
            let messageContent = Buffer.from(response.message.get_public_payload());
            if (request.encrypted) {
                messageContent = Buffer.from(response.message.get_masked_payload());
            }
            const pk = response.message.get_pk();
            return {
                message: messageContent,
                msgID,
                pk
            };
        });
    }
    static fetchNext(subscriber, encrypted) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield subscriber.clone().fetch_next_msgs();
            if (!messages || messages.length === 0) {
                return;
            }
            const msg = messages[0];
            const result = {
                msgID: msg.link.copy().msgId.toString(),
                pk: msg.message.get_pk(),
                message: Buffer.from(msg.message.get_public_payload())
            };
            if (encrypted) {
                result.message = Buffer.from(msg.message.get_masked_payload());
            }
            return result;
        });
    }
}
exports.default = FetchMsgService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2hNc2dTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL2ZldGNoTXNnU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUVBLDJFQUF3RTtBQUN4RSxxRkFBa0Y7QUFDbEYsNERBQXlEO0FBSXpELE1BQXFCLGVBQWU7SUFDM0IsTUFBTSxDQUFPLEtBQUssQ0FBQyxPQUFzQjs7WUFDOUMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztZQUVoQyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoRCxJQUFJLFdBQVcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEMsd0RBQXdEO1lBQ3hELElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtnQkFDckIsV0FBVyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM3QjtZQUVELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7WUFFeEMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBRWpCLElBQUksV0FBVyxLQUFLLFdBQVcsRUFBRTtnQkFDL0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7YUFDcEU7WUFFRCxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNWLE1BQU0sSUFBSSw2Q0FBcUIsQ0FBQyx1REFBMEIsQ0FBQyxtQkFBbUIsRUFDNUUsdUJBQXVCLFdBQVcsb0NBQW9DLENBQUMsQ0FBQzthQUMzRTtZQUVELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDNUIsSUFBSSxRQUFRLENBQUM7WUFFYiw0Q0FBNEM7WUFDNUMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsTUFBTSxPQUFPLEdBQUcs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