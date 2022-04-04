"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityHelper = void 0;
const iotaIdentity_1 = require("../iotaIdentity");
class IdentityHelper {
    /**
     * Returns a new Identity Client for the network specified as parameter
     *
     * @param node Concerned node
     * @returns the identity client
     */
    static getClient(node) {
        const identityConfig = new iotaIdentity_1.Config();
        identityConfig.setNetwork(iotaIdentity_1.Network.mainnet());
        if (node) {
            identityConfig.setNode(node);
        }
        else {
            identityConfig.setNode(iotaIdentity_1.Network.mainnet().defaultNodeURL);
        }
        identityConfig.setPermanode(this.PERMANODE_URL);
        const identityClient = iotaIdentity_1.Client.fromConfig(identityConfig);
        return identityClient;
    }
}
exports.IdentityHelper = IdentityHelper;
IdentityHelper.PERMANODE_URL = "https://chrysalis-chronicle.iota.org/api/mainnet/";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpdHlIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9pZGVudGl0eUhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrREFBNEU7QUFJNUUsTUFBYSxjQUFjO0lBR3ZCOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFZO1FBQ2hDLE1BQU0sY0FBYyxHQUFHLElBQUkscUJBQWMsRUFBRSxDQUFDO1FBRTVDLGNBQWMsQ0FBQyxVQUFVLENBQUMsc0JBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRTdDLElBQUksSUFBSSxFQUFFO1lBQ04sY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNoQzthQUFNO1lBQ0gsY0FBYyxDQUFDLE9BQU8sQ0FBQyxzQkFBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQzVEO1FBRUQsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDaEQsTUFBTSxjQUFjLEdBQUcscUJBQU0sQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFekQsT0FBTyxjQUFjLENBQUM7SUFDMUIsQ0FBQzs7QUF4Qkwsd0NBeUJDO0FBeEIyQiw0QkFBYSxHQUFHLG1EQUFtRCxDQUFDIn0=