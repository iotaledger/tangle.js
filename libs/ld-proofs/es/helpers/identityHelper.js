import { Client as IdentityClient, Config as IdentityConfig, Network } from "@iota/identity-wasm/node/identity_wasm.js";
import initialize from "./initializationHelper";
initialize();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpdHlIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9pZGVudGl0eUhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxJQUFJLGNBQWMsRUFBRSxNQUFNLElBQUksY0FBYyxFQUFFLE9BQU8sRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBRXhILE9BQU8sVUFBVSxNQUFNLHdCQUF3QixDQUFDO0FBRWhELFVBQVUsRUFBRSxDQUFDO0FBRWIsTUFBTSxPQUFPLGNBQWM7SUFHdkI7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQVk7UUFDaEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUU1QyxjQUFjLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRTdDLElBQUksSUFBSSxFQUFFO1lBQ04sY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNoQzthQUFNO1lBQ0gsY0FBYyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDNUQ7UUFFRCxjQUFjLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNoRCxNQUFNLGNBQWMsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRWpFLE9BQU8sY0FBYyxDQUFDO0lBQzFCLENBQUM7O0FBdkJ1Qiw0QkFBYSxHQUFHLG1EQUFtRCxDQUFDIn0=