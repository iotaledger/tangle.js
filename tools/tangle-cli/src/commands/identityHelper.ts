import { Client as IdentityClient, Config as IdentityConfig, Network } from "@iota/identity-wasm/node";
import { INetworkParams } from "../INetworkParams";

export class IdentityHelper {
    /**
     * Returns a new Identity Client for the network specified as parameter
     *
     * @param network IOTA network connection parameters
     * @returns the identity client
     */
    public static getClient(network: INetworkParams): IdentityClient {
        const identityConfig = new IdentityConfig();

        identityConfig.setNode(network.node);

        if (network.networkId) {
            identityConfig.setNetwork(Network.try_from_name(network.networkId));
        }

        if (network.permanode) {
            identityConfig.setPermanode(network.permanode);
        }

        return IdentityClient.fromConfig(identityConfig);
    }
}
