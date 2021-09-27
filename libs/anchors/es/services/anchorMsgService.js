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
                const encrypted = request.encrypted;
                // The subscriber
                const subs = request.subscriber;
                const components = request.channelID.split(":");
                let targetMsgID = components[1];
                if (encrypted) {
                    targetMsgID = components[2];
                }
                let anchorageLink;
                let found = true;
                if (targetMsgID === anchorageID) {
                    anchorageLink = channelHelper_1.ChannelHelper.parseAddress(request.channelID);
                }
                else {
                    // If we are not anchoring to the announce Msg ID we find the proper anchorage
                    // Iteratively retrieve messages until We find the one to anchor to
                    ({ found, anchorageLink } = yield channelHelper_1.ChannelHelper.findAnchorage(subs, anchorageID));
                    if (!found) {
                        throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND, `The anchorage ${anchorageID} has not been found on the channel`);
                    }
                }
                let publicPayload = request.message;
                let maskedPayload = Buffer.from("");
                if (encrypted) {
                    maskedPayload = publicPayload;
                    publicPayload = Buffer.from("");
                }
                const anchoringResp = yield subs.clone().send_signed_packet(anchorageLink, publicPayload, maskedPayload);
                const msgID = anchoringResp.link.copy().msgId.toString();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yTXNnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9hbmNob3JNc2dTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBRUEsMkVBQXdFO0FBQ3hFLHFGQUFrRjtBQUNsRiw0REFBeUQ7QUFJekQ7OztHQUdHO0FBQ0gsTUFBcUIsZ0JBQWdCO0lBQ25DOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBTyxNQUFNLENBQUMsT0FBMEI7O1lBQ25ELElBQUk7Z0JBQ0YsdUNBQXVDO2dCQUN2QyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO2dCQUV4QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUVwQyxpQkFBaUI7Z0JBQ2pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7Z0JBRWhDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLFdBQVcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLElBQUksU0FBUyxFQUFFO29CQUNiLFdBQVcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzdCO2dCQUVELElBQUksYUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUVqQixJQUFJLFdBQVcsS0FBSyxXQUFXLEVBQUU7b0JBQy9CLGFBQWEsR0FBRyw2QkFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQy9EO3FCQUFNO29CQUNMLDhFQUE4RTtvQkFDOUUsbUVBQW1FO29CQUNuRSxDQUFDLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBRWxGLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ1YsTUFBTSxJQUFJLDZDQUFxQixDQUFDLHVEQUEwQixDQUFDLG1CQUFtQixFQUM1RSxpQkFBaUIsV0FBVyxvQ0FBb0MsQ0FBQyxDQUFDO3FCQUNyRTtpQkFDRjtnQkFFRCxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO2dCQUNwQyxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLFNBQVMsRUFBRTtvQkFDYixhQUFhLEdBQUcsYUFBYSxDQUFDO29CQUM5QixhQUFhLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDakM7Z0JBRUQsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUN2RSxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBRWhDLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUV6RCxPQUFPO29CQUNMLFdBQVc7b0JBQ1gsS0FBSztpQkFDTixDQUFDO2FBQ0g7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZCxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssNkNBQXFCLENBQUMsUUFBUSxFQUFFO29CQUNqRCxNQUFNLEtBQUssQ0FBQztpQkFDYjtnQkFDRCxNQUFNLElBQUksNkNBQXFCLENBQUMsdURBQTBCLENBQUMsV0FBVyxFQUNwRSw0QkFBNEIsT0FBTyxDQUFDLFdBQVcsT0FBTyxPQUFPLENBQUMsU0FBUyxPQUFPLEtBQUssRUFBRSxDQUFDLENBQUM7YUFDMUY7UUFDSCxDQUFDO0tBQUE7Q0FDRjtBQWhFRCxtQ0FnRUMifQ==