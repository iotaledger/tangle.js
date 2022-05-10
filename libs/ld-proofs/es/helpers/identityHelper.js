import { Client as IdentityClient, Config as IdentityConfig, Network } from "@iota/identity-wasm/node";
export class IdentityHelper {
    /**
     * Returns a new Identity Client for the network specified as parameter
     *
     * @param node Concerned node
     * @returns the identity client
     */
    static getClient(node) {
        const identityConfig = new IdentityConfig();
        identityConfig.setNetwork(Network.mainnet());
        if (node) {
            identityConfig.setNode(node);
        }
        else {
            identityConfig.setNode(Network.mainnet().defaultNodeURL);
        }
        identityConfig.setPermanode(this.PERMANODE_URL);
        const identityClient = IdentityClient.fromConfig(identityConfig);
        return identityClient;
    }
}
IdentityHelper.PERMANODE_URL = "https://chrysalis-chronicle.iota.org/api/mainnet/";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpdHlIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9pZGVudGl0eUhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxJQUFJLGNBQWMsRUFBRSxNQUFNLElBQUksY0FBYyxFQUFFLE9BQU8sRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXZHLE1BQU0sT0FBTyxjQUFjO0lBR3ZCOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFZO1FBQ2hDLE1BQU0sY0FBYyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFFNUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUU3QyxJQUFJLElBQUksRUFBRTtZQUNOLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDaEM7YUFBTTtZQUNILGNBQWMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQzVEO1FBRUQsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDaEQsTUFBTSxjQUFjLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUVqRSxPQUFPLGNBQWMsQ0FBQztJQUMxQixDQUFDOztBQXZCdUIsNEJBQWEsR0FBRyxtREFBbUQsQ0FBQyJ9