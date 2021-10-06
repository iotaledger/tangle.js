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
                const isPrivate = request.isPrivate;
                // The subscriber
                const subs = request.subscriber;
                const components = request.channelID.split(":");
                let targetMsgID = components[1];
                if (isPrivate) {
                    targetMsgID = components[2];
                }
                let anchorageLink;
                let found = true;
                if (targetMsgID === anchorageID) {
                    anchorageLink = channelHelper_1.ChannelHelper.parseAddress(`${components[0]}:${targetMsgID}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yTXNnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9hbmNob3JNc2dTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBRUEsMkVBQXdFO0FBQ3hFLHFGQUFrRjtBQUNsRiw0REFBeUQ7QUFJekQ7OztHQUdHO0FBQ0gsTUFBcUIsZ0JBQWdCO0lBQ25DOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBTyxNQUFNLENBQUMsT0FBMEI7O1lBQ25ELElBQUk7Z0JBQ0YsdUNBQXVDO2dCQUN2QyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO2dCQUV4QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUNwQyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUVwQyxpQkFBaUI7Z0JBQ2pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7Z0JBRWhDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLFdBQVcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLElBQUksU0FBUyxFQUFFO29CQUNiLFdBQVcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzdCO2dCQUVELElBQUksYUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUVqQixJQUFJLFdBQVcsS0FBSyxXQUFXLEVBQUU7b0JBQy9CLGFBQWEsR0FBRyw2QkFBYSxDQUFDLFlBQVksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLEVBQUUsQ0FBQyxDQUFDO2lCQUMvRTtxQkFBTTtvQkFDTCw4RUFBOEU7b0JBQzlFLG1FQUFtRTtvQkFDbkUsQ0FBQyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsR0FBRyxNQUFNLDZCQUFhLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO29CQUVsRixJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUNWLE1BQU0sSUFBSSw2Q0FBcUIsQ0FBQyx1REFBMEIsQ0FBQyxtQkFBbUIsRUFDNUUsaUJBQWlCLFdBQVcsb0NBQW9DLENBQUMsQ0FBQztxQkFDckU7aUJBQ0Y7Z0JBRUQsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFDcEMsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDcEMsSUFBSSxTQUFTLEVBQUU7b0JBQ2IsYUFBYSxHQUFHLGFBQWEsQ0FBQztvQkFDOUIsYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ2pDO2dCQUVELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFDdkUsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUVoQyxNQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFFekQsT0FBTztvQkFDTCxXQUFXO29CQUNYLEtBQUs7aUJBQ04sQ0FBQzthQUNIO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2QsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLDZDQUFxQixDQUFDLFFBQVEsRUFBRTtvQkFDakQsTUFBTSxLQUFLLENBQUM7aUJBQ2I7Z0JBQ0QsTUFBTSxJQUFJLDZDQUFxQixDQUFDLHVEQUEwQixDQUFDLFdBQVcsRUFDcEUsNEJBQTRCLE9BQU8sQ0FBQyxXQUFXLE9BQU8sT0FBTyxDQUFDLFNBQVMsT0FBTyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQzFGO1FBQ0gsQ0FBQztLQUFBO0NBQ0Y7QUFqRUQsbUNBaUVDIn0=