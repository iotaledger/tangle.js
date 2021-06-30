import { Arguments } from "yargs";
import ICommandParam from "../ICommandParam";

const COMNET_URL = "https://nodes.comnet.thetangle.org";
const TESTNET_URL = "https://api.lb-0.testnet.chrysalis2.com";
const MAINNET_URL = "https://chrysalis-nodes.iota.org";

const providers: { [key: string]: string } = Object.create(null);

providers[TESTNET_URL] = "testnet";
providers[COMNET_URL] = "comnet";
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

export const seedParam: ICommandParam = {
  name: "seed",
  options: {
    alias: "s",
    type: "string",
    description: "IOTA Streams Channel seed",
    global: false
  }
};

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

  if (args.testnet) {
    network = TESTNET_URL;
  }

  if (args.comnet) {
    network = COMNET_URL;
  }

  if (args.mainnet) {
    network = MAINNET_URL;
  }

  return { network };
}
