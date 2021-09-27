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
exports.ProtocolHelper = void 0;
const iota_js_1 = require("@iota/iota.js");
const node_1 = require("@tangle.js/streams-wasm/node");
const anchoringChannelError_1 = require("../errors/anchoringChannelError");
const anchoringChannelErrorNames_1 = require("../errors/anchoringChannelErrorNames");
/**
 * Helper class to deal with protocol aspects
 *
 */
class ProtocolHelper {
    /**
     * Given a channel address and a message Id returns the corresponding L1 tangle index that
     * allows to locate the L1 Ledger message
     *
     * @param channelAddress The channel address
     * @param messageId The message identifier
     *
     * @returns the tangle index encoded in hexadecimal chars
     */
    static getIndexL1(channelAddress, messageId) {
        const addr = new node_1.Address(node_1.ChannelAddress.parse(channelAddress), node_1.MsgId.parse(messageId));
        return addr.toMsgIndexHex();
    }
    /**
     * Given an anchoring channel and an anchored message ID returns the
     * corresponding message ID at L1 on the Ledger
     *
     * @param channel   The anchoring channel
     * @param messageId The Streams Message Id
     *
     * @returns the Layer 1 message ID
     */
    static getMsgIdL1(channel, messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const addr = new node_1.Address(node_1.ChannelAddress.parse(channel.channelAddr), node_1.MsgId.parse(messageId));
            const index = addr.toMsgIndex();
            const client = new iota_js_1.SingleNodeClient(channel.node);
            const messagesResponse = yield client.messagesFind(index);
            if (messagesResponse.count === 0) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.L1_MSG_NOT_FOUND, "L1 message has not been found");
            }
            return messagesResponse.messageIds[0];
        });
    }
}
exports.ProtocolHelper = ProtocolHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9jb2xIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9wcm90b2NvbEhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBaUQ7QUFDakQsdURBQThFO0FBQzlFLDJFQUF3RTtBQUN4RSxxRkFBa0Y7QUFHbEY7OztHQUdHO0FBQ0gsTUFBYSxjQUFjO0lBQ3ZCOzs7Ozs7OztPQVFHO0lBQ0ksTUFBTSxDQUFDLFVBQVUsQ0FBQyxjQUFzQixFQUFFLFNBQWlCO1FBQzlELE1BQU0sSUFBSSxHQUFHLElBQUksY0FBTyxDQUFDLHFCQUFjLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLFlBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUV2RixPQUFPLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sVUFBVSxDQUFDLE9BQTZCLEVBQUUsU0FBaUI7O1lBQzNFLE1BQU0sSUFBSSxHQUFHLElBQUksY0FBTyxDQUFDLHFCQUFjLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxZQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDNUYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRWhDLE1BQU0sTUFBTSxHQUFHLElBQUksMEJBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTFELElBQUksZ0JBQWdCLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtnQkFDOUIsTUFBTSxJQUFJLDZDQUFxQixDQUMzQix1REFBMEIsQ0FBQyxnQkFBZ0IsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO2FBQ3JGO1lBRUQsT0FBTyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsQ0FBQztLQUFBO0NBQ0o7QUF4Q0Qsd0NBd0NDIn0=