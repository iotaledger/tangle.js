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
     * @param encrypted Whether the channel is encrypted or not
     *
     * @returns The address of the channel created and the announce message ID
     *
     */
    static createChannel(node, seed, encrypted) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = new node_1.SendOptions(node, true);
            try {
                const auth = new node_1.Author(seed, options.clone(), node_1.ChannelType.SingleBranch);
                const response = yield auth.clone().send_announce();
                const announceLink = response.link.copy();
                let keyLoadMsgID;
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
                if (encrypted === true) {
                    keyLoadMsgID = yield this.prepareChannelEncryption(seed, options, announceLink, auth);
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
            try {
                const options = new node_1.SendOptions(request.node, true);
                const subscriber = new node_1.Subscriber(request.seed, options.clone());
                // Channel contains the channel address and the announce messageID
                const channel = request.channelID;
                const announceLink = channelHelper_1.ChannelHelper.parseAddress(channel);
                yield subscriber.clone().receive_announcement(announceLink);
                if (request.encrypted) {
                    console.log("Receiving a KeyLoad");
                    const keyLoadMsgID = request.channelID.split(":")[2];
                    const keyLoadLinkStr = `${request.channelID.split(":")[0]}:${keyLoadMsgID}`;
                    const keyLoadLink = channelHelper_1.ChannelHelper.parseAddress(keyLoadLinkStr);
                    yield subscriber.clone().receive_keyload(keyLoadLink);
                    console.log("KeyLoad Received!!!");
                }
                return { subscriber, authorPk: subscriber.author_public_key() };
            }
            catch (_a) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR, `Cannot bind to channel ${request.channelID}`);
            }
        });
    }
    static prepareChannelEncryption(seed, options, announceLink, auth) {
        return __awaiter(this, void 0, void 0, function* () {
            const subs = new node_1.Subscriber(seed, options.clone());
            let announceLinkCopy = announceLink.copy();
            yield subs.clone().receive_announcement(announceLinkCopy);
            console.log("Announce received");
            announceLinkCopy = announceLink.copy();
            const subscrResponse = yield subs.clone().send_subscribe(announceLinkCopy);
            console.log("Subscribe sent");
            const subscribeLink = subscrResponse.link.copy();
            yield auth.clone().receive_subscribe(subscribeLink);
            console.log("Subscription finalized");
            announceLinkCopy = announceLink.copy();
            const keyLoadResponse = yield auth.clone().send_keyload_for_everyone(announceLinkCopy);
            const keyLoadLinkCopy = keyLoadResponse.link.copy();
            return keyLoadLinkCopy.msgId.toString();
        });
    }
}
exports.default = ChannelService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvY2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1REFBcUc7QUFDckcsMkVBQXdFO0FBQ3hFLHFGQUFrRjtBQUNsRiw0REFBeUQ7QUFJekQ7OztHQUdHO0FBQ0gsTUFBcUIsY0FBYztJQUMvQjs7Ozs7Ozs7T0FRRztJQUNJLE1BQU0sQ0FBTyxhQUFhLENBQUMsSUFBWSxFQUFFLElBQVksRUFBRSxTQUFrQjs7WUFFNUUsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1QyxJQUFJO2dCQUNBLE1BQU0sSUFBSSxHQUFHLElBQUksYUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsa0JBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFekUsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3BELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRTFDLElBQUksWUFBb0IsQ0FBQztnQkFFekIscUZBQXFGO2dCQUNyRixJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7b0JBQ3BCLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDekY7Z0JBRUQsT0FBTztvQkFDSCxhQUFhLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7b0JBQzVDLGNBQWMsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFO29CQUN0QyxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTtvQkFDL0IsWUFBWTtpQkFDZixD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