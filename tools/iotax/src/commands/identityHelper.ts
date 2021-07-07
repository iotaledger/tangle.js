import { Client as IdentityClient, Config as IdentityConfig, Network } from "@iota/identity-wasm/node";
import { PERMANODE_URL } from "./commonParams";

export class IdentityHelper {
    /**
     * Returns a new Identity Client for the network specified as parameter
     *
     * @param network Concerned network
     * @returns the identity client
     */
    public static getClient(network: string): IdentityClient {
        const identityConfig = new IdentityConfig();
      identityConfig.setNetwork(Network.mainnet());
      identityConfig.setNode(Network.mainnet().defaultNodeURL);
      identityConfig.setPermanode(PERMANODE_URL);
      const identityClient = IdentityClient.fromConfig(identityConfig);

      return identityClient;
    }
}
