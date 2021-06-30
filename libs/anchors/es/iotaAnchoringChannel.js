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
exports.IotaAnchoringChannel = void 0;
const anchoringChannelError_1 = require("./errors/anchoringChannelError");
const anchoringChannelErrorNames_1 = require("./errors/anchoringChannelErrorNames");
const initializationHelper_1 = __importDefault(require("./helpers/initializationHelper"));
const seedHelper_1 = require("./helpers/seedHelper");
const validationHelper_1 = __importDefault(require("./helpers/validationHelper"));
const anchorMsgService_1 = __importDefault(require("./services/anchorMsgService"));
const channelService_1 = __importDefault(require("./services/channelService"));
const fetchMsgService_1 = __importDefault(require("./services/fetchMsgService"));
// Needed for the Streams WASM bindings
initializationHelper_1.default();
class IotaAnchoringChannel {
    constructor(node, seed) {
        this._node = node;
        this._seed = seed;
        if (!seed) {
            this._seed = seedHelper_1.SeedHelper.generateSeed();
        }
    }
    /**
     * Creates a new Anchoring Channel
     *
     * @param node  The node
     * @param seed  The seed
     *
     * @returns The anchoring channel
     */
    static create(node, seed) {
        if (!validationHelper_1.default.url(node)) {
            throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.INVALID_NODE, "The node has to be a URL");
        }
        return new IotaAnchoringChannel(node, seed);
    }
    /**
     * Binds to an existing channel or creates a new binding
     *
     * @param channelID in the form of 'channel_address:announce_msg_id'
     *
     * @returns reference to the channel
     *
     */
    bind(channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._subscriber) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_ALREADY_BOUND, `Channel already bound to ${this._channelID}`);
            }
            if (!channelID) {
                const { channelAddress, announceMsgID, authorPk } = yield channelService_1.default.createChannel(this._node, this._seed);
                this._channelAddress = channelAddress;
                this._announceMsgID = announceMsgID;
                this._channelID = `${channelAddress}:${announceMsgID}`;
                this._authorPk = authorPk;
            }
            else {
                const components = channelID.split(":");
                if (Array.isArray(components) && components.length === 2) {
                    this._channelID = channelID;
                    this._channelAddress = components[0];
                    this._announceMsgID = components[1];
                }
                else {
                    throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR, `Invalid channel identifier: ${channelID}`);
                }
            }
            const bindRequest = {
                node: this._node,
                seed: this._seed,
                channelID: this._channelID
            };
            // The author's PK for the time being is not set because cannot be obtained from the
            // announce message
            const { subscriber } = yield channelService_1.default.bindToChannel(bindRequest);
            this._subscriber = subscriber;
            // this._authorPk = authorPk;
            this._publisherPk = subscriber.get_public_key();
            return this;
        });
    }
    /**
     *  Returns the channelID ('channelAddress:announce_msg_id')
     *
     *  @returns channel ID
     *
     */
    get channelID() {
        return this._channelID;
    }
    /**
     *  Returns the channel's address
     *
     *  @returns channel address
     *
     */
    get channelAddr() {
        return this._channelAddress;
    }
    /**
     *  Returns the channel's first anchorage ID
     *
     *  @returns anchorageID
     *
     */
    get firstAnchorageID() {
        return this._announceMsgID;
    }
    /**
     *  Returns the channel's node
     *
     *  @returns node
     *
     */
    get node() {
        return this._node;
    }
    /**
     *  Returns the channel's seed
     *
     *  @returns seed
     *
     */
    get seed() {
        return this._seed;
    }
    /**
     *  Returns the channel's author Public Key
     *
     *  @returns the Author's Public key
     *
     */
    get authorPk() {
        return this._authorPk;
    }
    /**
     *  Returns the channel's publisher Public Key
     *
     *  @returns the publisher's Public key
     *
     */
    get publisherPk() {
        return this._publisherPk;
    }
    /**
     * Anchors a message to the anchoring channel
     *
     * @param message Message to be anchored
     * @param anchorageID The anchorage to be used
     *
     * @returns The result of the operation
     *
     */
    anchor(message, anchorageID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._channelAddress) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_NOT_BOUND, "Unbound anchoring channel. Please call bind first");
            }
            const request = {
                channelID: this._channelID,
                subscriber: this._subscriber,
                message,
                anchorageID
            };
            const result = yield anchorMsgService_1.default.anchor(request);
            return result;
        });
    }
    /**
     * Fetches a previously anchored message
     *
     * @param anchorageID The anchorage point
     * @param messageID  The expected ID of the anchored message
     *
     * @returns The fetch result
     */
    fetch(anchorageID, messageID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._channelAddress) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_NOT_BOUND, "Unbound anchoring channel. Please call bind first");
            }
            const request = {
                channelID: this._channelID,
                subscriber: this._subscriber,
                msgID: messageID,
                anchorageID
            };
            return fetchMsgService_1.default.fetch(request);
        });
    }
    /**
     * Receives a previously anchored message
     * provided its anchorage has already been seen on the channel
     *
     * @param messageID  The ID of the message
     * @param anchorageID The expected ID of message's anchorage
     *
     * @returns The message received and associated metadata
     */
    receive(messageID, anchorageID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._channelAddress) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_NOT_BOUND, "Unbound anchoring channel. Please call bind first");
            }
            const request = {
                channelID: this._channelID,
                subscriber: this._subscriber,
                msgID: messageID,
                anchorageID
            };
            return fetchMsgService_1.default.receive(request);
        });
    }
}
exports.IotaAnchoringChannel = IotaAnchoringChannel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUFuY2hvcmluZ0NoYW5uZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YUFuY2hvcmluZ0NoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMEVBQXVFO0FBQ3ZFLG9GQUFpRjtBQUNqRiwwRkFBd0Q7QUFDeEQscURBQWtEO0FBQ2xELGtGQUEwRDtBQU0xRCxtRkFBMkQ7QUFDM0QsK0VBQXVEO0FBQ3ZELGlGQUF5RDtBQUV6RCx1Q0FBdUM7QUFDdkMsOEJBQVUsRUFBRSxDQUFDO0FBRWIsTUFBYSxvQkFBb0I7SUFpQjdCLFlBQW9CLElBQVksRUFBRSxJQUFhO1FBQzNDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBRWxCLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxJQUFJLENBQUMsS0FBSyxHQUFHLHVCQUFVLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDMUM7SUFDTCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBWSxFQUFFLElBQWE7UUFDNUMsSUFBSSxDQUFDLDBCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM3QixNQUFNLElBQUksNkNBQXFCLENBQUMsdURBQTBCLENBQUMsWUFBWSxFQUNuRSwwQkFBMEIsQ0FBQyxDQUFDO1NBQ25DO1FBRUQsT0FBTyxJQUFJLG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNVLElBQUksQ0FBQyxTQUFrQjs7WUFDaEMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNsQixNQUFNLElBQUksNkNBQXFCLENBQUMsdURBQTBCLENBQUMscUJBQXFCLEVBQzVFLDRCQUE0QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQzth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