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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedHelper = void 0;
const crypto = __importStar(require("crypto"));
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
}
exports.SeedHelper = SeedHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZEhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3NlZWRIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUFpQztBQUVqQyxNQUFhLFVBQVU7SUFDbkI7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsWUFBWSxDQUFDLFNBQWlCLEVBQUU7UUFDMUMsTUFBTSxRQUFRLEdBQUcsNEJBQTRCLENBQUM7UUFFOUMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRWQsT0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sRUFBRTtZQUN6QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNoRDtRQUdELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSjtBQXBCRCxnQ0FvQkMifQ==