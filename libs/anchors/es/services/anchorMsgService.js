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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yTXNnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9hbmNob3JNc2dTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEseUNBQXlDO0FBQ3pDLDJFQUF3RTtBQUN4RSxxRkFBa0Y7QUFDbEYsNERBQXlEO0FBT3pEOzs7R0FHRztBQUNILE1BQXFCLGdCQUFnQjtJQUNuQzs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQU8sTUFBTSxDQUFDLE9BQTBCOztZQUNuRCxJQUFJO2dCQUNGLHVDQUF1QztnQkFDdkMsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztnQkFFeEMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFDcEMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFFcEMsaUJBQWlCO2dCQUNqQixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO2dCQUVoQyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLFNBQVMsRUFBRTtvQkFDYixXQUFXLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUM3QjtnQkFFRCxJQUFJLGFBQXNCLENBQUM7Z0JBQzNCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztnQkFFakIsSUFBSSxXQUFXLEtBQUssV0FBVyxFQUFFO29CQUMvQixhQUFhLEdBQUcsNkJBQWEsQ0FBQyxZQUFZLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQztpQkFDL0U7cUJBQU07b0JBQ0wsOEVBQThFO29CQUM5RSxtRUFBbUU7b0JBQ25FLENBQUMsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFFbEYsSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDVixNQUFNLElBQUksNkNBQXFCLENBQUMsdURBQTBCLENBQUMsbUJBQW1CLEVBQzVFLGlCQUFpQixXQUFXLG9DQUFvQyxDQUFDLENBQUM7cUJBQ3JFO2lCQUNGO2dCQUVELElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7Z0JBQ3BDLElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3BDLElBQUksU0FBUyxFQUFFO29CQUNiLGFBQWEsR0FBRyxhQUFhLENBQUM7b0JBQzlCLGFBQWEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNqQztnQkFFRCxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQ3ZFLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFFaEMsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBRXpELE9BQU87b0JBQ0wsV0FBVztvQkFDWCxLQUFLO2lCQUNOLENBQUM7YUFDSDtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNkLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyw2Q0FBcUIsQ0FBQyxRQUFRLEVBQUU7b0JBQ2pELE1BQU0sS0FBSyxDQUFDO2lCQUNiO2dCQUNELE1BQU0sSUFBSSw2Q0FBcUIsQ0FBQyx1REFBMEIsQ0FBQyxXQUFXLEVBQ3BFLDRCQUE0QixPQUFPLENBQUMsV0FBVyxPQUFPLE9BQU8sQ0FBQyxTQUFTLE9BQU8sS0FBSyxFQUFFLENBQUMsQ0FBQzthQUMxRjtRQUNILENBQUM7S0FBQTtDQUNGO0FBakVELG1DQWlFQyJ9