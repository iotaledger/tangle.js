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
const node_1 = require("@tangle.js/streams-wasm/node");
const anchoringChannelError_1 = require("../errors/anchoringChannelError");
const anchoringChannelErrorNames_1 = require("../errors/anchoringChannelErrorNames");
const channelHelper_1 = require("../helpers/channelHelper");
/**
 *  Service to interact with IOTA Streams Channels
 *
 */
class ChannelService {
    /**
     * Creates a new Channel
     * @param client The client to use
     * @param seed The channel's seed
     * @param isPrivate Whether the channel is private or not
     * @param psks Preshared keys for the channel
     *
     * @returns The address of the channel created and the announce message ID
     *
     */
    static createChannel(client, seed, isPrivate, psks) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const auth = node_1.Author.fromClient(client, seed, node_1.ChannelType.SingleBranch);
                const response = yield auth.clone().send_announce();
                const announceLink = response.link.copy();
                let keyLoadMsgID;
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
                if (isPrivate === true) {
                    const presharedKeys = psks || [];
                    keyLoadMsgID = yield this.preparePrivateChannel(announceLink, auth, presharedKeys);
                }
                return {
                    announceMsgID: announceLink.msgId.toString(),
                    channelAddress: auth.channel_address(),
                    authorPk: auth.get_public_key(),
                    keyLoadMsgID
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
            let subscriber;
            let keyLoadReceived = true;
            try {
                subscriber = node_1.Subscriber.fromClient(request.client, request.seed);
                const channel = request.channelID;
                const [channelAddr, announceMsgID, keyLoadMsgID] = channel.split(":");
                const announceLink = channelHelper_1.ChannelHelper.parseAddress(`${channelAddr}:${announceMsgID}`);
                yield subscriber.clone().receive_announcement(announceLink);
                if (request.isPrivate) {
                    if (request.presharedKey) {
                        subscriber.clone().store_psk(request.presharedKey);
                    }
                    const keyLoadLinkStr = `${request.channelID.split(":")[0]}:${keyLoadMsgID}`;
                    const keyLoadLink = channelHelper_1.ChannelHelper.parseAddress(keyLoadLinkStr);
                    keyLoadReceived = yield subscriber.clone().receive_keyload(keyLoadLink);
                }
            }
            catch (_a) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR, `Cannot bind to channel ${request.channelID}`);
            }
            // If the "keyload" has not been received we cannot continue it is a not allowed subscriber
            if (!keyLoadReceived) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_BINDING_PERMISSION_ERROR, `Not allowed to bind to ${request.channelID}.`);
            }
            return { subscriber, authorPk: subscriber.author_public_key() };
        });
    }
    static preparePrivateChannel(announceLink, auth, psks) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const psk of psks) {
                auth.store_psk(psk);
            }
            const keyLoadResponse = yield auth.clone().send_keyload_for_everyone(announceLink.copy());
            const keyLoadLinkCopy = keyLoadResponse.link.copy();
            return keyLoadLinkCopy.msgId.toString();
        });
    }
}
exports.default = ChannelService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvY2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1REFBdUc7QUFDdkcsMkVBQXdFO0FBQ3hFLHFGQUFrRjtBQUNsRiw0REFBeUQ7QUFJekQ7OztHQUdHO0FBQ0gsTUFBcUIsY0FBYztJQUMvQjs7Ozs7Ozs7O09BU0c7SUFDSSxNQUFNLENBQU8sYUFBYSxDQUFDLE1BQXFCLEVBQUUsSUFBWSxFQUFFLFNBQWtCLEVBQUUsSUFBZTs7WUFFdEcsSUFBSTtnQkFDQSxNQUFNLElBQUksR0FBRyxhQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsa0JBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFdkUsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3BELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRTFDLElBQUksWUFBb0IsQ0FBQztnQkFFekIscUZBQXFGO2dCQUNyRixJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7b0JBQ3BCLE1BQU0sYUFBYSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7b0JBQ2pDLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2lCQUN0RjtnQkFFRCxPQUFPO29CQUNILGFBQWEsRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtvQkFDNUMsY0FBYyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUU7b0JBQ3RDLFFBQVEsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFO29CQUMvQixZQUFZO2lCQUNmLENBQUM7YUFDTDtZQUFDLE9BQU8sS0FBSyxFQUFF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