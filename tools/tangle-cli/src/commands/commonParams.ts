import { Arguments } from "yargs";

export interface NetParams {
  node: string;
  permanode?: string;
  id?: string;
  explorer?: string;
}

const DEVNET_URL = "https://api.lb-0.h.chrysalis-devnet.iota.cafe";
const DEVNET_EXPLORER_URL = "https://explorer.iota.org/devnet";
// const DEVNET_PERMANODE_URL = ""; // not yet available

const MAINNET_URL = "https://chrysalis-nodes.iota.org";
const MAINNET_EXPLORER_URL = "https://explorer.iota.org/mainnet";
const MAINNET_PERMANODE_URL =
  "https://chrysalis-chronicle.iota.org/api/mainnet/";

/**
 * Obtains the network params from command arguments
 *
 * @param args the arguments passed
 *
 * @returns the params
 */
export function getNetworkParams(args: Arguments): NetParams {
  let node: string;
  let permanode: string | undefined;
  let id: string | undefined;
  let explorer: string | undefined;

  if (args.net) {
    node = args.net as string;
    id = args["net-id"] as string;
    permanode = args.permanode as string | undefined;
    explorer = args.explorer as string | undefined;
  } else if (args.devnet) {
    node = DEVNET_URL;
    // permanodeUrl = DEVNET_PERMANODE_URL;
    id = "dev";
    explorer = DEVNET_EXPLORER_URL;
  } else if (args.mainnet) {
    node = MAINNET_URL;
    permanode = MAINNET_PERMANODE_URL;
    id = "main";
    explorer = MAINNET_EXPLORER_URL;
  }

  if (!permanode) {
    console.warn("Warning: no permanode specified. Identities will get pruned.");
  }

  if (!explorer) {
    console.warn("Warning: no explorer specified. Explorer links cannot be logged.");
  }

  return { node, permanode, id, explorer };
}
