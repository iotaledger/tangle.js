/* eslint-disable jsdoc/require-jsdoc */
import { Client as IdentityClient, Config as IdentityConfig, Network } from "@iota/identity-wasm/node/identity_wasm.js";
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
// eslint-disable-next-line @typescript-eslint/naming-convention
IdentityHelper.PERMANODE_URL = "https://chrysalis-chronicle.iota.org/api/mainnet/";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpdHlIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9pZGVudGl0eUhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx3Q0FBd0M7QUFFeEMsT0FBTyxFQUFFLE1BQU0sSUFBSSxjQUFjLEVBQUUsTUFBTSxJQUFJLGNBQWMsRUFBRSxPQUFPLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUN4SCxPQUFPLFVBQVUsTUFBTSx3QkFBd0IsQ0FBQztBQUUvQyxNQUFNLE9BQU8sY0FBYztJQUl4Qjs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQVk7UUFDdEMsTUFBTSxVQUFVLEVBQUUsQ0FBQztRQUNuQixNQUFNLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBRTVDLGNBQWMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFN0MsSUFBSSxJQUFJLEVBQUU7WUFDTixjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2hDO2FBQU07WUFDSCxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUM1RDtRQUVELGNBQWMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFakUsT0FBTyxjQUFjLENBQUM7SUFDMUIsQ0FBQzs7QUF6QkQsZ0VBQWdFO0FBQ3hDLDRCQUFhLEdBQUcsbURBQW1ELENBQUMifQ==