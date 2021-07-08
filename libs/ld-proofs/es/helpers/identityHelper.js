"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityHelper = void 0;
const node_1 = require("@iota/identity-wasm/node");
class IdentityHelper {
    /**
     * Returns a new Identity Client for the network specified as parameter
     *
     * @param node Concerned node
     * @returns the identity client
     */
    static getClient(node) {
        const identityConfig = new node_1.Config();
        identityConfig.setNetwork(node_1.Network.mainnet());
        if (node) {
            identityConfig.setNode(node);
        }
        else {
            identityConfig.setNode(node_1.Network.mainnet().defaultNodeURL);
        }
        identityConfig.setPermanode(this.PERMANODE_URL);
        const identityClient = node_1.Client.fromConfig(identityConfig);
        return identityClient;
    }
}
exports.IdentityHelper = IdentityHelper;
IdentityHelper.PERMANODE_URL = "https://chrysalis-chronicle.iota.org/api/mainnet/";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpdHlIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9pZGVudGl0eUhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtREFBdUc7QUFFdkcsTUFBYSxjQUFjO0lBR3ZCOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFZO1FBQ2hDLE1BQU0sY0FBYyxHQUFHLElBQUksYUFBYyxFQUFFLENBQUM7UUFFNUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxjQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUU3QyxJQUFJLElBQUksRUFBRTtZQUNOLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDaEM7YUFDSTtZQUNELGNBQWMsQ0FBQyxPQUFPLENBQUMsY0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQzVEO1FBRUQsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDaEQsTUFBTSxjQUFjLEdBQUcsYUFBYyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUVqRSxPQUFPLGNBQWMsQ0FBQztJQUMxQixDQUFDOztBQXpCTCx3Q0EwQkM7QUF6QjJCLDRCQUFhLEdBQUcsbURBQW1ELENBQUMifQ==