import {
  Client as IdentityClient,
  Config as IdentityConfig,
  Network
} from "@iota/identity-wasm/node";
import { NetParams } from "./commonParams";

export class IdentityHelper {
  /**
   * Returns a new Identity Client for the network specified as parameter
   *
   * @param network IOTA network connection parameters
   * @returns the identity client
   */
  public static getClient(network: NetParams): IdentityClient {
    const identityConfig = new IdentityConfig();

    identityConfig.setNode(network.node);

    if (network.id) {
      identityConfig.setNetwork(Network.try_from_name(network.id));
    }

    if (network.permanode) {
      identityConfig.setPermanode(network.permanode);
    }

    return IdentityClient.fromConfig(identityConfig);
  }
}
