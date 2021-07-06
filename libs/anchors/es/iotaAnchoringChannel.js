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
    // authorPubKey param will disappear in the future
    constructor(channelAddr, announceMsgID, node, authorPubKey) {
        this._node = node;
        this._channelID = `${channelAddr}:${announceMsgID}`;
        this._channelAddress = channelAddr;
        this._announceMsgID = announceMsgID;
        this._authorPubKey = authorPubKey;
    }
    /**
     * Creates a new Anchoring Channel
     *
     * @param seed Author's seed
     * @param options  The options
     * @param options.node The node used to create the channel
     *
     * @returns The anchoring channel details
     */
    static create(seed, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((options === null || options === void 0 ? void 0 : options.node) && !validationHelper_1.default.url(options === null || options === void 0 ? void 0 : options.node)) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.INVALID_NODE, "The node has to be a URL");
            }
            let node = options === null || options === void 0 ? void 0 : options.node;
            if (!node) {
                node = this.DEFAULT_NODE;
            }
            const { channelAddress, announceMsgID, authorPk } = yield channelService_1.default.createChannel(node, seed);
            const details = {
                channelAddr: channelAddress,
                channelID: `${channelAddress}:${announceMsgID}`,
                firstAnchorageID: announceMsgID,
                authorPubKey: authorPk,
                authorSeed: seed,
                node
            };
            return details;
        });
    }
    /**
     * Instantiates an existing Anchoring Channel from a Channel ID
     *
     * @param channelID in the form of 'channel_address:announce_msg_id'
     * @param options Channel options
     *
     * @returns reference to the channel
     *
     */
    static fromID(channelID, options) {
        const components = channelID.split(":");
        if (Array.isArray(components) && components.length === 2) {
            let node = options === null || options === void 0 ? void 0 : options.node;
            if (!node) {
                node = this.DEFAULT_NODE;
            }
            const authorPubKey = options === null || options === void 0 ? void 0 : options.authorPubKey;
            return new IotaAnchoringChannel(components[0], components[1], node, authorPubKey);
        }
        throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR, `Invalid channel identifier: ${channelID}`);
    }
    /**
     *  Creates a new IotaAnchoringChannel and subscribes to it using the Author's seed
     *
     *  i.e. Author === Subscriber
     *  A new Seed is automatically generated
     *
     * @param options The channel creation options
     * @returns The Anchoring Channel
     */
    static bindNew(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const details = yield IotaAnchoringChannel.create(seedHelper_1.SeedHelper.generateSeed(), options);
            // Temporarily until Streams exposed it on the Subscriber
            let opts = options;
            if (!opts) {
                opts = {};
            }
            opts.authorPubKey = details.authorPubKey;
            return IotaAnchoringChannel.fromID(details.channelID, opts).bind(details.authorSeed);
        });
    }
    /**
     * Binds the channel so that the subscriber is instantiated using the seed passed as parameter
     *
     * @param seed The Subscriber (publisher) seed
     * @returns a Reference to the channel
     *
     */
    bind(seed) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._subscriber) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_ALREADY_BOUND, `Channel already bound to ${this._channelID}`);
            }
            this._seed = seed;
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
            this._subscriberPubKey = subscriber.get_public_key();
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
     *  Returns the channel's publisher seed
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
    get authorPubKey() {
        return this._authorPubKey;
    }
    /**
     *  Returns the channel's publisher Public Key
     *
     *  @returns the publisher's Public key
     *
     */
    get subscriberPubKey() {
        return this._subscriberPubKey;
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
            if (!this._subscriber) {
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
            if (!this._subscriber) {
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
     * Fetches the next message anchored to the channel
     *
     * @returns The fetch result or undefined if no more messages can be fetched
     */
    fetchNext() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._subscriber) {
                throw new anchoringChannelError_1.AnchoringChannelError(anchoringChannelErrorNames_1.AnchoringChannelErrorNames.CHANNEL_NOT_BOUND, "Unbound anchoring channel. Please call bind first");
            }
            return fetchMsgService_1.default.fetchNext(this._subscriber);
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
            if (!this._subscriber) {
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
IotaAnchoringChannel.DEFAULT_NODE = "https://chrysalis-nodes.iota.org";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUFuY2hvcmluZ0NoYW5uZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YUFuY2hvcmluZ0NoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMEVBQXVFO0FBQ3ZFLG9GQUFpRjtBQUNqRiwwRkFBd0Q7QUFDeEQscURBQWtEO0FBQ2xELGtGQUEwRDtBQVExRCxtRkFBMkQ7QUFDM0QsK0VBQXVEO0FBQ3ZELGlGQUF5RDtBQUd6RCx1Q0FBdUM7QUFDdkMsOEJBQVUsRUFBRSxDQUFDO0FBRWIsTUFBYSxvQkFBb0I7SUFtQjdCLGtEQUFrRDtJQUNsRCxZQUFvQixXQUFtQixFQUFFLGFBQXFCLEVBQUUsSUFBWSxFQUFFLFlBQW9CO1FBQzlGLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBRWxCLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxXQUFXLElBQUksYUFBYSxFQUFFLENBQUM7UUFDcEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxXQUFXLENBQUM7UUFDbkMsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7UUFFcEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7SUFDdEMsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0ksTUFBTSxDQUFPLE1BQU0sQ0FBQyxJQUFZLEVBQUUsT0FBeUI7O1lBQzlELElBQUksQ0FBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsSUFBSSxLQUFJLENBQUMsMEJBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxJQUFJLENBQUMsRUFBRTtnQkFDdkQsTUFBTSxJQUFJLDZDQUFxQixDQUFDLHVEQUEwQixDQUFDLFlBQVksRUFDbkUsMEJBQTBCLENBQUMsQ0FBQzthQUNuQztZQUVELElBQUksSUFBSSxHQUFHLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxJQUFJLENBQUM7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