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
const iota_streams_wasm_1 = require("@jmcanterafonseca-iota/iota_streams_wasm");
const anchoringChannelError_1 = require("../errors/anchoringChannelError");
const anchoringChannelErrorNames_1 = require("../errors/anchoringChannelErrorNames");
const channelHelper_1 = require("../helpers/channelHelper");
/**
 * Service to deal with message anchors
 *
 */
class AnchorMsgService {
    /**
     * Anchors a message to an anchorage
     *
     * @param request The anchoring details
     *
     * @returns The result or error
     */
    static anchor(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // The address of the anchorage message
                const anchorageID = request.anchorageID;
                // The subscriber
                const subs = request.subscriber;
                const announceMsgID = request.channelID.split(":")[1];
                let anchorageLink;
                let found = true;
                if (announceMsgID === anchorageID) {
                    anchorageLink = iota_streams_wasm_1.Address.from_string(request.channelID).copy();
                }
                else {
                    // If we are not anchoring to the announce Msg ID we find the proper anchorage
                    // Iteratively retrieve messages until We find the one to anchor to
                    ({ found, anchorageLink } = yield channelHelper_1.ChannelHelper.findAnchorage(subs, anchorageID));
                    if (!found) {
                        throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND, `The anchorage ${anchorageID} has not been found on the channel`);
                    }
                }
                const publicPayload = request.message;
                const maskedPayload = Buffer.from("");
                const anchoringResp = yield subs.clone().send_signed_packet(anchorageLink, publicPayload, maskedPayload);
                const msgID = anchoringResp.get_link().msg_id;
                return {
                    anchorageID,
                    msgID
                };
            }
            catch (error) {
                if (error.type === anchoringChannelError_1.AnchoringChannelError.ERR_TYPE) {
                    throw error;
                }
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.OTHER_ERROR, `Error while anchoring to ${request.anchorageID} on ${request.channelID} -> ${error}`);
            }
        });
    }
}
exports.default = AnchorMsgService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yTXNnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9hbmNob3JNc2dTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEseUNBQXlDO0FBQ3pDLGdGQUFtRTtBQUNuRSwyRUFBd0U7QUFDeEUscUZBQWtGO0FBQ2xGLDREQUF5RDtBQUl6RDs7O0dBR0c7QUFDSCxNQUFxQixnQkFBZ0I7SUFDbkM7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFPLE1BQU0sQ0FBQyxPQUEwQjs7WUFDbkQsSUFBSTtnQkFDRix1Q0FBdUM7Z0JBQ3ZDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7Z0JBRXhDLGlCQUFpQjtnQkFDakIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztnQkFFaEMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRELElBQUksYUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUVqQixJQUFJLGFBQWEsS0FBSyxXQUFXLEVBQUU7b0JBQ2pDLGFBQWEsR0FBRywyQkFBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQy9EO3FCQUFNO29CQUNKLDhFQUE4RTtvQkFDL0UsbUVBQW1FO29CQUNuRSxDQUFDLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBRWxGLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ1YsTUFBTSxJQUFJLDZDQUFxQixDQUFDLHVEQUEwQixDQUFDLG1CQUFtQixFQUM1RSxpQkFBaUIsV0FBVyxvQ0FBb0MsQ0FBQyxDQUFDO3FCQUNyRTtpQkFDRjtnQkFFRCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO2dCQUN0QyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUV0QyxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQ3ZFLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFFaEMsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQztnQkFFOUMsT0FBTztvQkFDTCxXQUFXO29CQUNYLEtBQUs7aUJBQ04sQ0FBQzthQUNIO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2QsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLDZDQUFxQixDQUFDLFFBQVEsRUFBRTtvQkFDakQsTUFBTSxLQUFLLENBQUM7aUJBQ2I7Z0JBQ0QsTUFBTSxJQUFJLDZDQUFxQixDQUFDLHVEQUEwQixDQUFDLFdBQVcsRUFDcEUsNEJBQTRCLE9BQU8sQ0FBQyxXQUFXLE9BQU8sT0FBTyxDQUFDLFNBQVMsT0FBTyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQzFGO1FBQ0gsQ0FBQztLQUFBO0NBQ0Y7QUF0REQsbUNBc0RDIn0=