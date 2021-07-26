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
                const announceLink = response.get_link().copy();
                let keyLoadMsgID;
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
                if (encrypted === true) {
                    keyLoadMsgID = yield this.prepareChannelEncryption(seed, options, announceLink, auth);
                }
                return {
                    announceMsgID: announceLink.msg_id,
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
                const announceLink = node_1.Address.from_string(channel).copy();
                /* const announcement = */ yield subscriber.clone().receive_announcement(announceLink);
                return { subscriber, authorPk: /* announcement.get_message().get_pk()*/ "" };
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
            const subscribeLink = subscrResponse.get_link().copy();
            yield auth.clone().receive_subscribe(subscribeLink);
            console.log("Subscription finalized");
            announceLinkCopy = announceLink.copy();
            const keyLoadResponse = yield auth.clone().send_keyload_for_everyone(announceLinkCopy);
            const keyLoadLinkCopy = keyLoadResponse.get_link().copy();
            return keyLoadLinkCopy.msg_id;
        });
    }
}
exports.default = ChannelService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvY2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx1REFBcUc7QUFDckcsMkVBQXdFO0FBQ3hFLHFGQUFrRjtBQUlsRjs7O0dBR0c7QUFDSCxNQUFxQixjQUFjO0lBQy9COzs7Ozs7OztPQVFHO0lBQ0ksTUFBTSxDQUFPLGFBQWEsQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLFNBQWtCOztZQUU1RSxNQUFNLE9BQU8sR0FBRyxJQUFJLGtCQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVDLElBQUk7Z0JBQ0EsTUFBTSxJQUFJLEdBQUcsSUFBSSxhQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxrQkFBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUV6RSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDcEQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVoRCxJQUFJLFlBQW9CLENBQUM7Z0JBRXpCLHFGQUFxRjtnQkFDckYsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO29CQUNwQixZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQ3pGO2dCQUVELE9BQU87b0JBQ0gsYUFBYSxFQUFFLFlBQVksQ0FBQyxNQUFNO29CQUNsQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRTtvQkFDdEMsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7b0JBQy9CLFlBQVk7aUJBQ2YsQ0FBQzthQUNMO1lBQUMsT0FBTyxLQUFL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