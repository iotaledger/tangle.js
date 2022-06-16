/* eslint-disable jsdoc/require-jsdoc */

import { Client as IdentityClient, type IClientConfig, Network } from "@iota/identity-wasm/node/identity_wasm.js";
import initialize from "./initializationHelper";

export class IdentityHelper {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private static readonly PERMANODE_URL = "https://chrysalis-chronicle.iota.org/api/mainnet/";

    /**
     * Returns a new Identity Client for the network specified as parameter.
     *
     * @param node Concerned node.
     * @returns The identity client.
     */
    public static async getClient(node: string): Promise<IdentityClient> {
        await initialize();
        const defNode = Network.mainnet().defaultNodeURL();

        const identityConfig: IClientConfig = {
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
