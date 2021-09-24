import { Arguments } from "yargs";

const DEVNET_URL = "https://api.lb-0.h.chrysalis-devnet.iota.cafe";
const MAINNET_URL = "https://chrysalis-nodes.iota.org";

export const PERMANODE_URL = "https://chrysalis-chronicle.iota.org/api/mainnet/";

const providers: { [key: string]: string } = Object.create(null);

providers[DEVNET_URL] = "devnet";
providers[MAINNET_URL] = "mainnet";

/**
 * Returns the network provider name
 *
 * @param network Network endpoint
 *
 * @returns provider name
 */
export function providerName(network: string): string {
  return providers[network];
}

/**
 * Obtains the network params
 *
 * @param args the arguments passed
 *
 * @returns the params
 */
export function getNetworkParams(args: Arguments): { network: string } {
  let network: string;

  if (args.net) {
    network = args.net as string;
  }

  if (args.devnet) {
    network = DEVNET_URL;
  }

  if (args.mainnet) {
    network = MAINNET_URL;
  }

  return { network };
}
