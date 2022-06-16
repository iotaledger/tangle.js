// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Client as IdentityClient, Network } from "@iota/identity-wasm/node";
import { INetworkParams } from "../INetworkParams";

export class IdentityHelper {
    /**
     * Returns a new Identity Client for the network specified as parameter.
     *
     * @param network IOTA network connection parameters.
     * @returns The identity client.
     */
    public static async getClient(network: INetworkParams): Promise<IdentityClient> {
        const identityConfig = {
            nodes: [network.node],
            network: network.networkId && Network.tryFromName(network.networkId),
            permanodes: [{ url: network.permanode }]
        };

        return IdentityClient.fromConfig(identityConfig);
    }
}
