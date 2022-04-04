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
exports.ClientHelper = void 0;
const iotaStreams_1 = require("../iotaStreams");
class ClientHelper {
    /**
     * Returns a client for Streams using the node and permanode
     *
     * @param node Node endpoint URL
     * @param permanode endpoint URL
     *
     * @returns StreamsClient
     */
    static getClient(node, permanode) {
        return __awaiter(this, void 0, void 0, function* () {
            // iota.rs client
            let builder = new iotaStreams_1.ClientBuilder().node(node);
            if (permanode) {
                builder = builder.permanode(permanode);
            }
            const client = yield builder.build();
            return iotaStreams_1.StreamsClient.fromClient(client);
        });
    }
    /**
     *  Returns a client for the mainnet setting node and permanode
     *
     * @returns StreamsClient
     */
    static getMainnetClient() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getClient(this.DEFAULT_NODE, this.DEFAULT_PERMANODE);
        });
    }
}
exports.ClientHelper = ClientHelper;
ClientHelper.DEFAULT_NODE = "https://chrysalis-nodes.iota.org";
ClientHelper.DEFAULT_PERMANODE = "https://chrysalis-chronicle.iota.org/api/mainnet/";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50SGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvY2xpZW50SGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGdEQUFvRjtBQUlwRixNQUFhLFlBQVk7SUFLckI7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBTyxTQUFTLENBQUMsSUFBWSxFQUFFLFNBQWtCOztZQUMxRCxpQkFBaUI7WUFDakIsSUFBSSxPQUFPLEdBQUcsSUFBSSwyQkFBYSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdDLElBQUksU0FBUyxFQUFFO2dCQUNYLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzFDO1lBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDckMsT0FBTywyQkFBa0IsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBTyxnQkFBZ0I7O1lBQ2hDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7S0FBQTs7QUE5Qkwsb0NBK0JDO0FBOUIwQix5QkFBWSxHQUFHLGtDQUFrQyxDQUFDO0FBRWxELDhCQUFpQixHQUFHLG1EQUFtRCxDQUFDIn0=