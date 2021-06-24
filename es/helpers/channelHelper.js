"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.ChannelHelper = void 0;
const iota_streams_wasm_1 = require("@jmcanterafonseca-iota/iota_streams_wasm");
const crypto = __importStar(require("crypto"));
class ChannelHelper {
    /**
     * Generates a new seed
     * @param length Seed length
     *
     * @returns The seed
     */
    static generateSeed(length = 20) {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        let seed = "";
        while (seed.length < length) {
            const bytes = crypto.randomBytes(1);
            seed += alphabet[bytes[0] % alphabet.length];
        }
        return seed;
    }
    /**
     *  Finds an anchorage message on the channel by going through the messages
     *
     * @param subs  Subscriber
     * @param anchorageID The anchorage identifier
     *
     * @returns whether it has been found and the link to the anchorage on the Channel
     */
    static findAnchorage(subs, anchorageID) {
        return __awaiter(this, void 0, void 0, function* () {
            let found = false;
            let anchorageLink;
            // First we try to read such message
            const candidateLink = iota_streams_wasm_1.Address.from_string(`${subs.clone().channel_address()}:${anchorageID}`);
            let response;
            try {
                response = yield subs.clone().receive_signed_packet(candidateLink);
            }
            catch (_a) {
                // The message has not been found
            }
            if (response) {
                anchorageLink = response.get_link().copy();
                found = true;
            }
            // Iteratively retrieve messages until We find the one to anchor to
            while (!found) {
                const messages = yield subs.clone().fetch_next_msgs();
                if (!messages || messages.length === 0) {
                    break;
                }
                // In our case only one message is expected
                anchorageLink = messages[0].get_link().copy();
                if (anchorageLink.msg_id === anchorageID) {
                    found = true;
                }
            }
            return { found, anchorageLink };
        });
    }
}
exports.ChannelHelper = ChannelHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbEhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2NoYW5uZWxIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGdGQUErRTtBQUMvRSwrQ0FBaUM7QUFFakMsTUFBYSxhQUFhO0lBQ3RCOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLFlBQVksQ0FBQyxTQUFpQixFQUFFO1FBQzFDLE1BQU0sUUFBUSxHQUFHLDRCQUE0QixDQUFDO1FBRTlDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUVkLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLEVBQUU7WUFDekIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxJQUFJLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDaEQ7UUFHRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBTyxhQUFhLENBQUMsSUFBZ0IsRUFBRSxXQUFtQjs7WUFFbkUsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLElBQUksYUFBc0IsQ0FBQztZQUUzQixvQ0FBb0M7WUFDcEMsTUFBTSxhQUFhLEdBQUcsMkJBQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsZUFBZSxFQUFFLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQztZQUU5RixJQUFJLFFBQVEsQ0FBQztZQUNiLElBQUk7Z0JBQ0EsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ3RFO1lBQUMsV0FBTTtnQkFDTCxpQ0FBaUM7YUFDbkM7WUFFRCxJQUFJLFFBQVEsRUFBRTtnQkFDVixhQUFhLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUMzQyxLQUFLLEdBQUcsSUFBSSxDQUFDO2FBQ2hCO1lBRUQsbUVBQW1FO1lBQ25FLE9BQU8sQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3BDLE1BQU07aUJBQ1Q7Z0JBRUQsMkNBQTJDO2dCQUMzQyxhQUFhLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUU5QyxJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssV0FBVyxFQUFFO29CQUN0QyxLQUFLLEdBQUcsSUFBSSxDQUFDO2lCQUNoQjthQUNKO1lBRUQsT0FBTyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsQ0FBQztRQUNwQyxDQUFDO0tBQUE7Q0FDSjtBQWxFRCxzQ0FrRUMifQ==