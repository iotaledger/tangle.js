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
                    anchorageLink = node_1.Address.from_string(request.channelID).copy();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yTXNnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9hbmNob3JNc2dTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEseUNBQXlDO0FBQ3pDLHVEQUF1RDtBQUN2RCwyRUFBd0U7QUFDeEUscUZBQWtGO0FBQ2xGLDREQUF5RDtBQUl6RDs7O0dBR0c7QUFDSCxNQUFxQixnQkFBZ0I7SUFDbkM7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFPLE1BQU0sQ0FBQyxPQUEwQjs7WUFDbkQsSUFBSTtnQkFDRix1Q0FBdUM7Z0JBQ3ZDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7Z0JBRXhDLGlCQUFpQjtnQkFDakIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztnQkFFaEMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRELElBQUksYUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUVqQixJQUFJLGFBQWEsS0FBSyxXQUFXLEVBQUU7b0JBQ2pDLGFBQWEsR0FBRyxjQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDL0Q7cUJBQU07b0JBQ0osOEVBQThFO29CQUMvRSxtRUFBbUU7b0JBQ25FLENBQUMsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFFbEYsSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDVixNQUFNLElBQUksNkNBQXFCLENBQUMsdURBQTBCLENBQUMsbUJBQW1CLEVBQzVFLGlCQUFpQixXQUFXLG9DQUFvQyxDQUFDLENBQUM7cUJBQ3JFO2lCQUNGO2dCQUVELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7Z0JBQ3RDLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRXRDLE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFDdkUsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUVoQyxNQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDO2dCQUU5QyxPQUFPO29CQUNMLFdBQVc7b0JBQ1gsS0FBSztpQkFDTixDQUFDO2FBQ0g7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZCxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssNkNBQXFCLENBQUMsUUFBUSxFQUFFO29CQUNqRCxNQUFNLEtBQUssQ0FBQztpQkFDYjtnQkFDRCxNQUFNLElBQUksNkNBQXFCLENBQUMsdURBQTBCLENBQUMsV0FBVyxFQUNwRSw0QkFBNEIsT0FBTyxDQUFDLFdBQVcsT0FBTyxPQUFPLENBQUMsU0FBUyxPQUFPLEtBQUssRUFBRSxDQUFDLENBQUM7YUFDMUY7UUFDSCxDQUFDO0tBQUE7Q0FDRjtBQXRERCxtQ0FzREMifQ==