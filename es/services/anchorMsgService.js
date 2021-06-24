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
                        throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.ANCHORAGE_NOT_FOUND, `The anchorage ${anchorageID} has not been found on the channel`);
                    }
                }
                const publicPayload = Buffer.from(request.message);
                const maskedPayload = Buffer.from("");
                const anchoringResp = yield subs.clone().send_signed_packet(anchorageLink, publicPayload, maskedPayload);
                const msgID = anchoringResp.get_link().msg_id;
                return {
                    anchorageID,
                    msgID
                };
            }
            catch (error) {
                if (error.type === anchoringChannelError_1.default.ERR_TYPE) {
                    throw error;
                }
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.OTHER_ERROR, `Error while anchoring to ${request.anchorageID} on ${request.channelID} -> ${error}`);
            }
        });
    }
}
exports.default = AnchorMsgService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yTXNnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9hbmNob3JNc2dTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEseUNBQXlDO0FBQ3pDLGdGQUFtRTtBQUNuRSw0RkFBb0U7QUFDcEUsc0dBQThFO0FBQzlFLDREQUF5RDtBQUl6RDs7O0dBR0c7QUFDSCxNQUFxQixnQkFBZ0I7SUFDbkM7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFPLE1BQU0sQ0FBQyxPQUEwQjs7WUFDbkQsSUFBSTtnQkFDRix1Q0FBdUM7Z0JBQ3ZDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7Z0JBRXhDLGlCQUFpQjtnQkFDakIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztnQkFFaEMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRELElBQUksYUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUVqQixJQUFJLGFBQWEsS0FBSyxXQUFXLEVBQUU7b0JBQ2pDLGFBQWEsR0FBRywyQkFBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQy9EO3FCQUFNO29CQUNKLDhFQUE4RTtvQkFDL0UsbUVBQW1FO29CQUNuRSxDQUFDLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBRWxGLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ1YsTUFBTSxJQUFJLCtCQUFxQixDQUFDLG9DQUEwQixDQUFDLG1CQUFtQixFQUM1RSxpQkFBaUIsV0FBVyxvQ0FBb0MsQ0FBQyxDQUFDO3FCQUNyRTtpQkFDRjtnQkFFRCxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFdEMsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUN2RSxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBRWhDLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUM7Z0JBRTlDLE9BQU87b0JBQ0wsV0FBVztvQkFDWCxLQUFLO2lCQUNOLENBQUM7YUFDSDtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNkLElBQUksS0FBSyxDQUFDLElBQUksS0FBSywrQkFBcUIsQ0FBQyxRQUFRLEVBQUU7b0JBQ2pELE1BQU0sS0FBSyxDQUFDO2lCQUNiO2dCQUNELE1BQU0sSUFBSSwrQkFBcUIsQ0FBQyxvQ0FBMEIsQ0FBQyxXQUFXLEVBQ3BFLDRCQUE0QixPQUFPLENBQUMsV0FBVyxPQUFPLE9BQU8sQ0FBQyxTQUFTLE9BQU8sS0FBSyxFQUFFLENBQUMsQ0FBQzthQUMxRjtRQUNILENBQUM7S0FBQTtDQUNGO0FBdERELG1DQXNEQyJ9