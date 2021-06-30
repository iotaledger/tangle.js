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
const iota_streams_wasm_1 = require("@tangle.js/iota_streams_wasm");
const anchoringChannelError_1 = require("../errors/anchoringChannelError");
const anchoringChannelErrorNames_1 = require("../errors/anchoringChannelErrorNames");
/**
 *  Service to interact with IOTA Streams Channels
 *
 */
class ChannelService {
    /**
     * Creates a new Channel
     * @param node The node on which the channel is created
     * @param seed The channel's seed
     *
     * @returns The address of the channel created and the announce message ID
     *
     */
    static createChannel(node, seed) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = new iota_streams_wasm_1.SendOptions(node, true);
            const auth = new iota_streams_wasm_1.Author(seed, options.clone(), iota_streams_wasm_1.ChannelType.SingleBranch);
            const response = yield auth.clone().send_announce();
            const announceLink = response.get_link().copy();
            return {
                announceMsgID: announceLink.msg_id,
                channelAddress: auth.channel_address(),
                authorPk: auth.get_public_key()
            };
        });
    }
    /**
     *  Binds to a channel by creating the corresponding IOTA Streams Subscriber and reading
     *  the announce message
     *
     * @param request The channel details
     *
     * @returns IOTA Streams Subscriber object
     */
    static bindToChannel(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const options = new iota_streams_wasm_1.SendOptions(request.node, true);
                const subscriber = new iota_streams_wasm_1.Subscriber(request.seed, options.clone());
                // Channel contains the channel address and the announce messageID
                const channel = request.channelID;
                const announceLink = iota_streams_wasm_1.Address.from_string(channel).copy();
                /* const announcement = */ yield subscriber.clone().receive_announcement(announceLink);
                return { subscriber, authorPk: /* announcement.get_message().get_pk()*/ "" };
            }
            catch (_a) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR, `Cannot bind to channel ${request.channelID}`);
            }
        });
    }
}
exports.default = ChannelService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvY2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxvRUFBcUc7QUFDckcsMkVBQXdFO0FBQ3hFLHFGQUFrRjtBQUlsRjs7O0dBR0c7QUFDSCxNQUFxQixjQUFjO0lBQy9COzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQU8sYUFBYSxDQUFDLElBQVksRUFBRSxJQUFZOztZQUV4RCxNQUFNLE9BQU8sR0FBRyxJQUFJLCtCQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVDLE1BQU0sSUFBSSxHQUFHLElBQUksMEJBQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLCtCQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFekUsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDcEQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRWhELE9BQU87Z0JBQ0gsYUFBYSxFQUFFLFlBQVksQ0FBQyxNQUFNO2dCQUNsQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDdEMsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7YUFDbEMsQ0FBQztRQUNOLENBQUM7S0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQU8sYUFBYSxDQUFDLE9BQTRCOztZQUkxRCxJQUFJO2dCQUNBLE1BQU0sT0FBTyxHQUFHLElBQUksK0JBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLFVBQVUsR0FBRyxJQUFJLDhCQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFFakUsa0VBQWtFO2dCQUNsRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUNsQyxNQUFNLFlBQVksR0FBRywyQkFBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFekQsMEJBQTBCLENBQUMsTUFBTSxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRXZGLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLHdDQUF3QyxDQUFDLEVBQUUsRUFBRSxDQUFDO2FBQ2hGO1lBQUMsV0FBTTtnQkFDSixNQUFNLElBQUksNkNBQXFCLENBQUMsdURBQTBCLENBQUMscUJBQXFCLEVBQzVFLDBCQUEwQixPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQzthQUN0RDtRQUNMLENBQUM7S0FBQTtDQUNKO0FBcERELGlDQW9EQyJ9