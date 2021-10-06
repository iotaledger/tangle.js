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
    constructor(channelID, node, isPrivate, encrypted) {
        this._node = node;
        this._channelID = channelID;
        const components = channelID.split(":");
        this._channelAddress = components[0];
        this._announceMsgID = components[1];
        if (encrypted) {
            this._keyLoadMsgID = components[2];
        }
        this._encrypted = encrypted;
        this._isPrivate = isPrivate;
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
            let encrypted = false;
            let isPrivate = false;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
            if ((options === null || options === void 0 ? void 0 : options.encrypted) === true) {
                encrypted = true;
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
            if ((options === null || options === void 0 ? void 0 : options.isPrivate) === true) {
                isPrivate = true;
            }
            const { channelAddress, announceMsgID, keyLoadMsgID, authorPk } = yield channelService_1.default.createChannel(node, seed, isPrivate, encrypted);
            let firstAnchorageID = announceMsgID;
            if (keyLoadMsgID) {
                firstAnchorageID = keyLoadMsgID;
            }
            const details = {
                channelAddr: channelAddress,
                channelID: `${channelAddress}:${announceMsgID}${keyLoadMsgID ? `:${keyLoadMsgID}` : ""}`,
                firstAnchorageID,
                authorPubKey: authorPk,
                authorSeed: seed,
                node,
                encrypted,
                isPrivate
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
        let encrypted = false;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
        if ((options === null || options === void 0 ? void 0 : options.encrypted) === true) {
            encrypted = true;
        }
        let isPrivate = false;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
        if ((options === null || options === void 0 ? void 0 : options.isPrivate) === true) {
            isPrivate = true;
        }
        if (Array.isArray(components) &&
            ((components.length === 2 && !isPrivate) || (components.length === 3 && isPrivate))) {
            let node = options === null || options === void 0 ? void 0 : options.node;
            if (!node) {
                node = this.DEFAULT_NODE;
            }
            return new IotaAnchoringChannel(channelID, node, isPrivate, encrypted);
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
                isPrivate: this._isPrivate,
                encrypted: this._encrypted,
                channelID: this._channelID
            };
            // The author's PK for the time being is not set because cannot be obtained from the
            // announce message
            const { subscriber, authorPk } = yield channelService_1.default.bindToChannel(bindRequest);
            this._authorPubKey = authorPk;
            this._subscriber = subscriber;
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
        let result = this._keyLoadMsgID;
        if (!result) {
            result = this._announceMsgID;
        }
        return result;
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
     *  Returns the channel's subscriber Public Key
     *
     *  @returns the subscriber's Public key
     *
     */
    get subscriberPubKey() {
        return this._subscriberPubKey;
    }
    /**
     *  Returns whether the channel is encrypted or not
     *
     *  @returns boolean
     *
     */
    get encrypted() {
        return this._encrypted;
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
                encrypted: this._encrypted,
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
                encrypted: this._encrypted,
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
            return fetchMsgService_1.default.fetchNext(this._subscriber, this._encrypted);
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
                encrypted: this._encrypted,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUFuY2hvcmluZ0NoYW5uZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YUFuY2hvcmluZ0NoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMEVBQXVFO0FBQ3ZFLG9GQUFpRjtBQUNqRiwwRkFBd0Q7QUFDeEQscURBQWtEO0FBQ2xELGtGQUEwRDtBQVExRCxtRkFBMkQ7QUFDM0QsK0VBQXVEO0FBQ3ZELGlGQUF5RDtBQUd6RCx1Q0FBdUM7QUFDdkMsOEJBQVUsRUFBRSxDQUFDO0FBRWIsTUFBYSxvQkFBb0I7SUF5QjdCLFlBQW9CLFNBQWlCLEVBQUUsSUFBWSxFQUFFLFNBQWtCLEVBQUUsU0FBa0I7UUFDdkYsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFFNUIsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV4QyxJQUFJLENBQUMsZUFBZSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVwQyxJQUFJLFNBQVMsRUFBRTtZQUNYLElBQUksQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RDO1FBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7SUFDaEMsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0ksTUFBTSxDQUFPLE1BQU0sQ0FBQyxJQUFZLEVBQUUsT0FBeUI7O1lBQzlELElBQUksQ0FBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsSUFBSSxLQUFJLENBQUMsMEJBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sYUFBUCxPQUFPLHVC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