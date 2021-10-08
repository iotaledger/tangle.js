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
const clientHelper_1 = require("./helpers/clientHelper");
const initializationHelper_1 = __importDefault(require("./helpers/initializationHelper"));
const seedHelper_1 = require("./helpers/seedHelper");
const validationHelper_1 = __importDefault(require("./helpers/validationHelper"));
const anchorMsgService_1 = __importDefault(require("./services/anchorMsgService"));
const channelService_1 = __importDefault(require("./services/channelService"));
const fetchMsgService_1 = __importDefault(require("./services/fetchMsgService"));
// Needed for the Streams WASM bindings
initializationHelper_1.default();
class IotaAnchoringChannel {
    constructor(channelID, nodeInfo, isPrivate, encrypted) {
        this._node = nodeInfo;
        this._channelID = channelID;
        const components = channelID.split(":");
        this._channelAddress = components[0];
        this._announceMsgID = components[1];
        if (isPrivate) {
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
            const node = options === null || options === void 0 ? void 0 : options.node;
            const permanode = options === null || options === void 0 ? void 0 : options.permanode;
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
            const client = yield this.getClient(node, permanode);
            const { channelAddress, announceMsgID, keyLoadMsgID, authorPk } = yield channelService_1.default.createChannel(client, seed, isPrivate);
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
                node: node || this.DEFAULT_NODE,
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
            const permanode = options === null || options === void 0 ? void 0 : options.permanode;
            if (!node) {
                node = clientHelper_1.ClientHelper.DEFAULT_NODE;
            }
            return new IotaAnchoringChannel(channelID, { node, permanode }, isPrivate, encrypted);
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
            let opts = options;
            if (!opts) {
                opts = {};
            }
            return IotaAnchoringChannel.fromID(details.channelID, opts).bind(details.authorSeed);
        });
    }
    static getClient(node, permanode) {
        return __awaiter(this, void 0, void 0, function* () {
            let client;
            if (!node && !permanode) {
                client = yield clientHelper_1.ClientHelper.getMainnetClient();
            }
            else if (!node) {
                client = yield clientHelper_1.ClientHelper.getClient(clientHelper_1.ClientHelper.DEFAULT_NODE, permanode);
            }
            else {
                client = yield clientHelper_1.ClientHelper.getClient(node, permanode);
            }
            return client;
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
            const client = yield IotaAnchoringChannel.getClient(this._node.node, this._node.permanode);
            const bindRequest = {
                client,
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
        return this._node.node;
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
     *  Returns whether the channel is private or not
     *
     *  @returns boolean
     *
     */
    get isPrivate() {
        return this._isPrivate;
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
                isPrivate: this._isPrivate,
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
                isPrivate: this._isPrivate,
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
                isPrivate: this._isPrivate,
                subscriber: this._subscriber,
                msgID: messageID,
                anchorageID
            };
            return fetchMsgService_1.default.receive(request);
        });
    }
}
exports.IotaAnchoringChannel = IotaAnchoringChannel;
IotaAnchoringChannel.DEFAULT_NODE = clientHelper_1.ClientHelper.DEFAULT_NODE;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUFuY2hvcmluZ0NoYW5uZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YUFuY2hvcmluZ0NoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMEVBQXVFO0FBQ3ZFLG9GQUFpRjtBQUNqRix5REFBc0Q7QUFDdEQsMEZBQXdEO0FBQ3hELHFEQUFrRDtBQUNsRCxrRkFBMEQ7QUFTMUQsbUZBQTJEO0FBQzNELCtFQUF1RDtBQUN2RCxpRkFBeUQ7QUFHekQsdUNBQXVDO0FBQ3ZDLDhCQUFVLEVBQUUsQ0FBQztBQUViLE1BQWEsb0JBQW9CO0lBeUI3QixZQUFvQixTQUFpQixFQUFFLFFBQW1CLEVBQUUsU0FBa0IsRUFBRSxTQUFrQjtRQUM5RixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztRQUV0QixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUU1QixNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXhDLElBQUksQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXBDLElBQUksU0FBUyxFQUFFO1lBQ1gsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdEM7UUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUNoQyxDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sTUFBTSxDQUFDLElBQVksRUFBRSxPQUF5Qjs7WUFDOUQsSUFBSSxDQUFBLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxJQUFJLEtBQUksQ0FBQywwQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLElBQUksQ0FBQyxFQUFFO2dCQUN2RCxNQUFNLElBQUksNkNBQXFCLENBQUMsdURBQTBCLENBQUMsWUFBWSxFQUNuRSwwQkFBMEIsQ0FBQyxDQUFDO2FBQ25DO1lBRUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLElBQUksQ0FBQztZQUMzQixNQUFNLFNBQVMsR0FBRyxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsU0FBUyxDQUFDO1lBRXJDLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN0QixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFFdEIscUZBQXFGO1lBQ3JGLElBQUksQ0FBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsU0FBUyxNQUFLLElBQUksRUFBRTtnQkFDN0IsU0FBUyxHQUFHLElBQUksQ0FBQzthQUNwQjtZQUNELHFGQUFxRjtZQUNyRixJQUFJLENBQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFNBQVMsTUFBSyxJQUFJLEVBQUU7Z0JBQzdCLFNBQVMsR0FBRyxJQUFJLENBQUM7YUFDcEI7WUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRXJELE1BQU0sRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsR0FDM0QsTUFBTSx3QkFBYyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRWhFLElBQUksZ0JBQWdCLEdBQUcsYUFBYSxDQUFDO1lBQ3JDLElBQUksWUFBWSxFQUFFO2dCQUNkLGdCQUFnQixHQUFHLFlBQVksQ0FBQzthQUNuQztZQUVELE1BQU0sT0FBTyxHQUFvQjtnQkFDN0IsV0FBVyxFQUFFLGNBQWM7Z0JBQzNCLFNBQVMsRUFBRSxHQUFHLGNBQWMsSUFBSSxhQUFhLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3hGLGdCQUFnQjtnQkFDaEIsWUFBWSxFQUFFLFFBQVE7Z0JBQ3RCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxZQUFZO2dCQUMvQixTQUFTO2dCQUNULFNBQVM7YUFDWixDQUFDO1lBRUYsT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQWlCLEVBQUUsT0FBeUI7UUFDN0QsTUFBTSxVQUFVLEdBQWEsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVsRCxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdEIscUZBQXFGO1FBQ3JGLElBQUksQ0FBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsU0FBUyxNQUFLLElBQUksRUFBRTtZQUM3QixTQUFTLEdBQUcsSUFBSSxDQUFDO1NBQ3BCO1FBRUQsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLHFGQUFxRjtRQUNyRixJQUFJLENBQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFNBQVMsTUFBSyxJQUFJLEVBQUU7WUFDN0IsU0FBUyxHQUFHLElBQUksQ0FBQztTQUNwQjtRQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFDekIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFO1lBQ3JGLElBQUksSUFBSSxHQUFHLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxJQUFJLENBQUM7WUFDekIsTUFBTSxTQUFTLEdBQUcsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFNBQVMsQ0FBQztZQUVyQyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNQLElBQUksR0FBRywyQkFBWSxDQUFDLFlBQVksQ0FBQzthQUNwQztZQUNELE9BQU8sSUFBSSxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3pGO1FBQ0QsTUFBTSxJQUFJLDZDQUFxQixDQUFDLHVEQUEwQixDQUFDLHFCQUFxQixFQUM1RSwrQkFBK0IsU0FBUyxFQUFFLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sT0FBTyxDQUFDLE9BQXlCOztZQUNqRCxNQUFNLE9BQU8sR0FBRyxNQUFNLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyx1QkFBVSxDQUFDLFlBQVksRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRXRGLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQztZQUNuQixJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNQLElBQUksR0FBRyxFQUFFLENBQUM7YUFDYjtZQUNELE9BQU8sb0JBQW9CLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RixDQUFDO0tBQUE7SUFFTyxNQUFNLENBQU8sU0FBUyxDQUFDLElBQVksRUFBRSxTQUFpQjs7WUFDMUQsSUFBSSxNQUFxQixDQUFDO1lBRTFCLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ3JCLE1BQU0sR0FBRyxNQUFNLDJCQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzthQUNsRDtpQkFBTSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNkLE1BQU0sR0FBRyxNQUFNLDJCQUFZLENBQUMsU0FBUyxDQUFDLDJCQUFZLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2FBQy9FO2lCQUFNO2dCQUNILE1BQU0sR0FBRyxNQUFNLDJCQUFZLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQzthQUMxRDtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7S0FBQTtJQUVEOzs7Ozs7T0FNRztJQUNVLElBQUksQ0FBQyxJQUFZOztZQUMxQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2xCLE1BQU0sSUFBSSw2Q0FBcUIsQ0FBQyx1REFBMEIsQ0FBQyxxQkFBcUIsRUFDNUUsNEJBQTRCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2FBQ3REO1lBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFFbEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUUzRixNQUFNLFdBQVcsR0FBd0I7Z0JBQ3JDLE1BQU07Z0JBQ04sSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLO2dCQUNoQixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVU7Z0JBQzFCLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVTtnQkFDMUIsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVO2FBQzdCLENBQUM7WUFFRixvRkFBb0Y7WUFDcEYsbUJBQW1CO1lBQ25CLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSx3QkFBYyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUVqRixJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztZQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztZQUM5QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsVUFBVSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBRXJELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FBQTtJQUVEOzs7OztPQUtHO0lBQ0gsSUFBVyxTQUFTO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxJQUFXLFdBQVc7UUFDbEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILElBQVcsZ0JBQWdCO1FBQ3ZCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFFaEMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNULE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1NBQ2hDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsSUFBVyxJQUFJO1FBQ1gsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztJQUMzQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxJQUFXLElBQUk7UUFDWCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsSUFBVyxZQUFZO1FBQ25CLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM5QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxJQUFXLGdCQUFnQjtRQUN2QixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxJQUFXLFNBQVM7UUFDaEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNELElBQVcsU0FBUztRQUNsQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ1UsTUFBTSxDQUFDLE9BQWUsRUFBRSxXQUFtQjs7WUFDcEQsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ25CLE1BQU0sSUFBSSw2Q0FBcUIsQ0FBQyx1REFBMEIsQ0FBQyxpQkFBaUIsRUFDeEUsbURBQW1ELENBQUMsQ0FBQzthQUM1RDtZQUVELE1BQU0sT0FBTyxHQUFzQjtnQkFDL0IsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUMxQixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVU7Z0JBQzFCLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVTtnQkFDMUIsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXO2dCQUM1QixPQUFPO2dCQUNQLFdBQVc7YUFDZCxDQUFDO1lBRUYsTUFBTSxNQUFNLEdBQUcsTUFBTSwwQkFBZ0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFdEQsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7T0FPRztJQUNVLEtBQUssQ0FBQyxXQUFtQixFQUFFLFNBQWtCOztZQUN0RCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDbkIsTUFBTSxJQUFJLDZDQUFxQixDQUFDLHVEQUEwQixDQUFDLGlCQUFpQixFQUN4RSxtREFBbUQsQ0FBQyxDQUFDO2FBQzVEO1lBRUQsTUFBTSxPQUFPLEdBQWtCO2dCQUMzQixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVU7Z0JBQzFCLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVTtnQkFDMUIsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUMxQixVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVc7Z0JBQzVCLEtBQUssRUFBRSxTQUFTO2dCQUNoQixXQUFXO2FBQ2QsQ0FBQztZQUVGLE9BQU8seUJBQWUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNVLFNBQVM7O1lBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNuQixNQUFNLElBQUksNkNBQXFCLENBQUMsdURBQTBCLENBQUMsaUJBQWlCLEVBQ3hFLG1EQUFtRCxDQUFDLENBQUM7YUFDNUQ7WUFFRCxPQUFPLHlCQUFlLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7S0FBQTtJQUVEOzs7Ozs7OztPQVFHO0lBQ1UsT0FBTyxDQUFDLFNBQWlCLEVBQUUsV0FBb0I7O1lBQ3hELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNuQixNQUFNLElBQUksNkNBQXFCLENBQUMsdURBQTBCLENBQUMsaUJBQWlCLEVBQ3hFLG1EQUFtRCxDQUFDLENBQUM7YUFDNUQ7WUFFRCxNQUFNLE9BQU8sR0FBa0I7Z0JBQzNCLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVTtnQkFDMUIsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVO2dCQUMxQixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVU7Z0JBQzFCLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDNUIsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLFdBQVc7YUFDZCxDQUFDO1lBRUYsT0FBTyx5QkFBZSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxDQUFDO0tBQUE7O0FBellMLG9EQTBZQztBQXpZMEIsaUNBQVksR0FBRywyQkFBWSxDQUFDLFlBQVksQ0FBQyJ9