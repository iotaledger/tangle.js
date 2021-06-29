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
const iota_streams_wasm_1 = require("@jmcanterafonseca-iota/iota_streams_wasm");
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
                channelAddress: auth.channel_address()
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
                const subs = new iota_streams_wasm_1.Subscriber(request.seed, options.clone());
                // Channel contains the channel address and the announce messageID
                const channel = request.channelID;
                const announceLink = iota_streams_wasm_1.Address.from_string(channel).copy();
                yield subs.clone().receive_announcement(announceLink);
                return subs;
            }
            catch (_a) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR, `Cannot bind to channel ${request.channelID}`);
            }
        });
    }
}
exports.default = ChannelService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvY2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxnRkFBaUg7QUFDakgsMkVBQXdFO0FBQ3hFLHFGQUFrRjtBQUlsRjs7O0dBR0c7QUFDSCxNQUFxQixjQUFjO0lBQy9COzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQU8sYUFBYSxDQUFDLElBQVksRUFBRSxJQUFZOztZQUV4RCxNQUFNLE9BQU8sR0FBRyxJQUFJLCtCQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVDLE1BQU0sSUFBSSxHQUFHLElBQUksMEJBQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLCtCQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFekUsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDcEQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRWhELE9BQU87Z0JBQ0gsYUFBYSxFQUFFLFlBQVksQ0FBQyxNQUFNO2dCQUNsQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRTthQUN6QyxDQUFDO1FBQ04sQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBTyxhQUFhLENBQUMsT0FBNEI7O1lBQzFELElBQUk7Z0JBQ0EsTUFBTSxPQUFPLEdBQUcsSUFBSSwrQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sSUFBSSxHQUFHLElBQUksOEJBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUUzRCxrRUFBa0U7Z0JBQ2xFLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ2xDLE1BQU0sWUFBWSxHQUFHLDJCQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUV6RCxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFdEQsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUFDLFdBQU07Z0JBQ0osTUFBTSxJQUFJLDZDQUFxQixDQUFDLHVEQUEwQixDQUFDLHFCQUFxQixFQUM1RSwwQkFBMEIsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7YUFDdEQ7UUFDTCxDQUFDO0tBQUE7Q0FDSjtBQWhERCxpQ0FnREMifQ==