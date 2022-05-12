import { Client as IdentityClient, Config as IdentityConfig, Network } from "@iota/identity-wasm/node/identity_wasm.js";

export class IdentityHelper {
    private static readonly PERMANODE_URL = "https://chrysalis-chronicle.iota.org/api/mainnet/";

    /**
     * Returns a new Identity Client for the network specified as parameter
     *
     * @param node Concerned node
     * @returns the identity client
     */
    public static getClient(node: string): IdentityClient {
        const identityConfig = new IdentityConfig();

        identityConfig.setNetwork(Network.mainnet());

        if (node) {
            identityConfig.setNode(node);
        } else {
            identityConfig.setNode(Network.mainnet().defaultNodeURL);
        }

        identityConfig.setPermanode(this.PERMANODE_URL);
        const identityClient = IdentityClient.fromConfig(identityConfig);

        return identityClient;
    }
}
