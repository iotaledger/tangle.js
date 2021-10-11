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
exports.SeedHelper = void 0;
const node_1 = require("@tangle.js/streams-wasm/node");
const crypto = __importStar(require("crypto"));
const clientHelper_1 = require("./clientHelper");
class SeedHelper {
    /**
     * Generates a new seed
     * @param length Seed length
     *
     * @returns The seed
     */
    static generateSeed(length = 80) {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        let seed = "";
        while (seed.length < length) {
            const bytes = crypto.randomBytes(1);
            seed += alphabet[bytes[0] % alphabet.length];
        }
        return seed;
    }
    /**
     * Given a seed obtains the corresponding Ed25519 public key
     *
     * @param seed The seed
     * @returns the public key
     *
     */
    static publicKeyFromSeed(seed) {
        return __awaiter(this, void 0, void 0, function* () {
            // The node is just a formality to fill all the params
            const author = new node_1.Author(seed, new node_1.SendOptions(clientHelper_1.ClientHelper.DEFAULT_NODE, true), node_1.ChannelType.SingleBranch);
            return author.clone().get_public_key();
        });
    }
}
exports.SeedHelper = SeedHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZEhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3NlZWRIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVEQUFnRjtBQUNoRiwrQ0FBaUM7QUFDakMsaURBQThDO0FBRTlDLE1BQWEsVUFBVTtJQUNuQjs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxZQUFZLENBQUMsU0FBaUIsRUFBRTtRQUMxQyxNQUFNLFFBQVEsR0FBRyw0QkFBNEIsQ0FBQztRQUU5QyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFFZCxPQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxFQUFFO1lBQ3pCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2hEO1FBR0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNLLE1BQU0sQ0FBTyxpQkFBaUIsQ0FBQyxJQUFZOztZQUMvQyxzREFBc0Q7WUFDdEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxhQUFNLENBQUMsSUFBSSxFQUMxQixJQUFJLGtCQUFXLENBQUMsMkJBQVksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEVBQUUsa0JBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVoRixPQUFPLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMzQyxDQUFDO0tBQUE7Q0FDSjtBQW5DRCxnQ0FtQ0MifQ==