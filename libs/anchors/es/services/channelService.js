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
            try {
                const auth = new iota_streams_wasm_1.Author(seed, options.clone(), iota_streams_wasm_1.ChannelType.SingleBranch);
                const response = yield auth.clone().send_announce();
                const announceLink = response.get_link().copy();
                return {
                    announceMsgID: announceLink.msg_id,
                    channelAddress: auth.channel_address(),
                    authorPk: auth.get_public_key()
                };
            }
            catch (error) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.OTHER_ERROR, error.message);
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvY2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxvRUFBcUc7QUFDckcsMkVBQXdFO0FBQ3hFLHFGQUFrRjtBQUlsRjs7O0dBR0c7QUFDSCxNQUFxQixjQUFjO0lBQy9COzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQU8sYUFBYSxDQUFDLElBQVksRUFBRSxJQUFZOztZQUV4RCxNQUFNLE9BQU8sR0FBRyxJQUFJLCtCQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVDLElBQUk7Z0JBQ0EsTUFBTSxJQUFJLEdBQUcsSUFBSSwwQkFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsK0JBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFekUsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3BELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFaEQsT0FBTztvQkFDSCxhQUFhLEVBQUUsWUFBWSxDQUFDLE1BQU07b0JBQ2xDLGNBQWMsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFO29CQUN0QyxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTtpQkFDbEMsQ0FBQzthQUNMO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ1osTUFBTSxJQUFJLDZDQUFxQixDQUFDLHVEQUEwQixDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDMUY7UUFDTCxDQUFDO0tBQUE7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksTUFBTSxDQUFPLGFBQWEsQ0FBQyxPQUE0Qjs7WUFJMUQsSUFBSTtnQkFDQSxNQUFNLE9BQU8sR0FBRyxJQUFJLCtCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxVQUFVLEdBQUcsSUFBSSw4QkFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBRWpFLGtFQUFrRTtnQkFDbEUsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFDbEMsTUFBTSxZQUFZLEdBQUcsMkJBQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRXpELDBCQUEwQixDQUFDLE1BQU0sVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUV2RixPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSx3Q0FBd0MsQ0FBQyxFQUFFLEVBQUUsQ0FBQzthQUNoRjtZQUFDLFdBQU07Z0JBQ0osTUFBTSxJQUFJLDZDQUFxQixDQUFDLHVEQUEwQixDQUFDLHFCQUFxQixFQUM1RSwwQkFBMEIsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7YUFDdEQ7UUFDTCxDQUFDO0tBQUE7Q0FDSjtBQXhERCxpQ0F3REMifQ==