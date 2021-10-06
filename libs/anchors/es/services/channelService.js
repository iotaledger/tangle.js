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
     * @param node The node on which the channel is created
     * @param seed The channel's seed
     * @param isPrivate Whether the channel is private or not
     * @param encrypted Whether the channel is encrypted or not
     *
     * @returns The address of the channel created and the announce message ID
     *
     */
    static createChannel(node, seed, isPrivate, encrypted) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = new node_1.SendOptions(node, true);
            try {
                const auth = new node_1.Author(seed, options.clone(), node_1.ChannelType.SingleBranch);
                const response = yield auth.clone().send_announce();
                const announceLink = response.link.copy();
                let keyLoadMsgID;
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
                if (isPrivate === true) {
                    keyLoadMsgID = yield this.prepareChannelEncryption(announceLink, auth);
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
                const options = new node_1.SendOptions(request.node, true);
                subscriber = new node_1.Subscriber(request.seed, options.clone());
                const channel = request.channelID;
                const [channelAddr, announceMsgID, keyLoadMsgID] = channel.split(":");
                const announceLink = channelHelper_1.ChannelHelper.parseAddress(`${channelAddr}:${announceMsgID}`);
                yield subscriber.clone().receive_announcement(announceLink);
                if (request.isPrivate) {
                    console.log("Receiving a KeyLoad");
                    const keyLoadLinkStr = `${request.channelID.split(":")[0]}:${keyLoadMsgID}`;
                    const keyLoadLink = channelHelper_1.ChannelHelper.parseAddress(keyLoadLinkStr);
                    keyLoadReceived = yield subscriber.clone().receive_keyload(keyLoadLink);
                    console.log("KeyLoad Received!!!");
                }
            }
            catch (_a) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR, `Cannot bind to channel ${request.channelID}`);
            }
            // If the keyload has not been received we cannot continue it is a not allowed subscriber
            if (!keyLoadReceived) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_BINDING_PERMISSION_ERROR, `Not allowed to bind to ${request.channelID}.`);
            }
            return { subscriber, authorPk: subscriber.author_public_key() };
        });
    }
    static prepareChannelEncryption(announceLink, auth) {
        return __awaiter(this, void 0, void 0, function* () {
            const keyLoadResponse = yield auth.clone().send_keyload_for_everyone(announceLink.copy());
            const keyLoadLinkCopy = keyLoadResponse.link.copy();
            return keyLoadLinkCopy.msgId.toString();
        });
    }
}
exports.default = ChannelService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvY2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1REFBcUc7QUFDckcsMkVBQXdFO0FBQ3hFLHFGQUFrRjtBQUNsRiw0REFBeUQ7QUFJekQ7OztHQUdHO0FBQ0gsTUFBcUIsY0FBYztJQUMvQjs7Ozs7Ozs7O09BU0c7SUFDSSxNQUFNLENBQU8sYUFBYSxDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsU0FBa0IsRUFBRSxTQUFrQjs7WUFFaEcsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1QyxJQUFJO2dCQUNBLE1BQU0sSUFBSSxHQUFHLElBQUksYUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsa0JBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFekUsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3BELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRTFDLElBQUksWUFBb0IsQ0FBQztnQkFFekIscUZBQXFGO2dCQUNyRixJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7b0JBQ3BCLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQzFFO2dCQUVELE9BQU87b0JBQ0gsYUFBYSxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO29CQUM1QyxjQUFjLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRTtvQkFDdEMsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7b0JBQy9CLFlBQVk7aUJBQ2YsQ0FBQzthQUNM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