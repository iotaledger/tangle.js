/* eslint-disable jsdoc/require-jsdoc */

import { Client as IdentityClient, Config as IdentityConfig, Network } from "@iota/identity-wasm/node/identity_wasm.js";
import { LdProofs } from "../ldProofs";

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
        await LdProofs.initialize();
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
