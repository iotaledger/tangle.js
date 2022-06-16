/* eslint-disable jsdoc/require-jsdoc */
import { Client as IdentityClient, Network } from "@iota/identity-wasm/node/identity_wasm.js";
import initialize from "./initializationHelper";
export class IdentityHelper {
    /**
     * Returns a new Identity Client for the network specified as parameter.
     *
     * @param node Concerned node.
     * @returns The identity client.
     */
    static async getClient(node) {
        await initialize();
        const defNode = Network.mainnet().defaultNodeURL();
        const identityConfig = {
            network: Network.mainnet(),
            nodes: [node ?? defNode],
            permanodes: [
                {
                    url: this.PERMANODE_URL
                }
            ]
        };
        const identityClient = IdentityClient.fromConfig(identityConfig);
        return identityClient;
    }
}
// eslint-disable-next-line @typescript-eslint/naming-convention
IdentityHelper.PERMANODE_URL = "https://chrysalis-chronicle.iota.org/api/mainnet/";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpdHlIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9pZGVudGl0eUhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx3Q0FBd0M7QUFFeEMsT0FBTyxFQUFFLE1BQU0sSUFBSSxjQUFjLEVBQXNCLE9BQU8sRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ2xILE9BQU8sVUFBVSxNQUFNLHdCQUF3QixDQUFDO0FBRWhELE1BQU0sT0FBTyxjQUFjO0lBSXZCOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBWTtRQUN0QyxNQUFNLFVBQVUsRUFBRSxDQUFDO1FBQ25CLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVuRCxNQUFNLGNBQWMsR0FBa0I7WUFDbEMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDMUIsS0FBSyxFQUFFLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQztZQUN4QixVQUFVLEVBQUU7Z0JBQ1I7b0JBQ0ksR0FBRyxFQUFFLElBQUksQ0FBQyxhQUFhO2lCQUMxQjthQUNKO1NBQ0osQ0FBQztRQUVGLE1BQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFakUsT0FBTyxjQUFjLENBQUM7SUFDMUIsQ0FBQzs7QUExQkQsZ0VBQWdFO0FBQ3hDLDRCQUFhLEdBQUcsbURBQW1ELENBQUMifQ==