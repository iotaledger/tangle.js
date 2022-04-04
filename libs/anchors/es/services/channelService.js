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
const anchoringChannelError_1 = require("../errors/anchoringChannelError");
const anchoringChannelErrorNames_1 = require("../errors/anchoringChannelErrorNames");
const channelHelper_1 = require("../helpers/channelHelper");
const iotaStreams_1 = require("../iotaStreams");
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
                const auth = iotaStreams_1.Author.fromClient(client, seed, iotaStreams_1.ChannelType.SingleBranch);
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
                subscriber = iotaStreams_1.Subscriber.fromClient(request.client, request.seed);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvY2hhbm5lbFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSwyRUFBd0U7QUFDeEUscUZBQWtGO0FBQ2xGLDREQUF5RDtBQUN6RCxnREFHd0I7QUFTeEI7OztHQUdHO0FBQ0gsTUFBcUIsY0FBYztJQUMvQjs7Ozs7Ozs7O09BU0c7SUFDSSxNQUFNLENBQU8sYUFBYSxDQUFDLE1BQXFCLEVBQ25ELElBQVksRUFBRSxTQUFrQixFQUFFLElBQWU7O1lBRWpELElBQUk7Z0JBQ0EsTUFBTSxJQUFJLEdBQUcsb0JBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSx5QkFBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUU1RSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDcEQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFMUMsSUFBSSxZQUFvQixDQUFDO2dCQUV6QixxRkFBcUY7Z0JBQ3JGLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtvQkFDcEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFDakMsWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7aUJBQ3RGO2dCQUVELE9BQU87b0JBQ0gsYUFBYSxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO29CQUM1QyxjQUFjLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRTtvQkFDdEMsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7b0JBQy9CLFlBQVk7aUJBQ2YsQ0FBQzthQUNMO1lBQUMsT0FBTyxLQUFLLEVB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