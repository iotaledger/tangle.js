import { Arguments } from "yargs";
import ICommandParam from "./ICommandParam";

export const globalParams: ICommandParam[] = [
  {
    name: "testnet",
    options: {
      type: "boolean",
      description: "IOTA Chrysalis Testnet",
      global: true
    }
  },
  {
    name: "mainnet",
    options: {
      type: "boolean",
      description: "IOTA Chrysalis Mainnet",
      global: true
    }
  },
  {
    name: "net",
    options: {
      alias: "n",
      type: "string",
      description: "Node's endpoint or other IOTA network",
      global: true
    }
  }
];

export const globalConflicts = {
  mainnet: ["testnet", "net"],
  testnet: ["mainnet", "net"]
};

/**
 * Checks whether and argument is defined
 *
 * @param argv The Arguments
 * @param field The fields
 *
 * @returns whether the argument is defined or not
 *
 */
export function isDefined(argv: Arguments, field: string): boolean {
  const value = argv[field];

  if (typeof (value) === "undefined") {
    return false;
  }

  if (value === false) {
    return false;
  }

  if (typeof (value) === "string" && value.trim().length === 0) {
    return false;
  }

  return true;
}

export const globalCheckFunction = argv => {
  if (!isDefined(argv, "net") &&
    !isDefined(argv, "testnet") && !isDefined(argv, "comnet") && !isDefined(argv, "mainnet")) {
    throw new Error(
      "Missing network. Use --mainnet, --testnet or provide a custom URL using --net"
    );
  } else {
    return true;
  }
};
