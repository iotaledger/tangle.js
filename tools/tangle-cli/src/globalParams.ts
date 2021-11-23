// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Arguments } from "yargs";
import ICommandParam from "./ICommandParam";
import { INetworkParams } from "./INetworkParams";

// default parameters when using special options (--mainnet, --devnet)
const defaultNetParams: { [option: string]: INetworkParams } = {
    mainnet: {
        node: "https://chrysalis-nodes.iota.org",
        networkId: "main",
        explorer: "https://explorer.iota.org/mainnet",
        permanode: "https://chrysalis-chronicle.iota.org/api/mainnet/"
    },
    devnet: {
        node: "https://api.lb-0.h.chrysalis-devnet.iota.cafe",
        networkId: "dev",
        explorer: "https://explorer.iota.org/devnet"
        // permanode does not exist yet
    }
};

export const globalParams: ICommandParam[] = [
    {
        name: "devnet",
        options: {
            type: "boolean",
            description: [
                "Default settings for IOTA Chrysalis Devnet",
                `Network ID:   ${defaultNetParams.devnet.networkId}`,
                `Node:      ${defaultNetParams.devnet.node}`,
                `Explorer:  ${defaultNetParams.devnet.explorer ?? "-"}`,
                `Permanode: ${defaultNetParams.devnet.permanode ?? "-"}`
            ].join("\n"),
            global: true
        }
    },
    {
        name: "mainnet",
        options: {
            type: "boolean",
            description: [
                "Default settings for IOTA Chrysalis Mainnet",
                `NetworkID:   ${defaultNetParams.mainnet.networkId}`,
                `Node:      ${defaultNetParams.mainnet.node}`,
                `Explorer:  ${defaultNetParams.mainnet.explorer ?? "-"}`,
                `Permanode: ${defaultNetParams.mainnet.permanode ?? "-"}`
            ].join("\n"),
            global: true
        }
    },
    {
        name: "net",
        options: {
            alias: "i",
            type: "string",
            description: "Tangle network identifier",
            global: true
        }
    },
    {
        name: "node",
        options: {
            alias: "n",
            type: "string",
            description: "Node endpoint",
            global: true
        }
    },
    {
        name: "explorer",
        options: {
            alias: "e",
            type: "string",
            description: "Tangle explorer endpoint",
            global: true
        }
    },
    {
        name: "permanode",
        options: {
            alias: "p",
            type: "string",
            description: "Permanode endpoint",
            global: true
        }
    }
];

export const globalConflicts = {
    mainnet: "devnet",
    net: ["devnet", "mainnet"]
};

/**
 * Checks whether and argument is defined.
 *
 * @param argv The Arguments.
 * @param field The fields.
 * @returns Whether the argument is defined or not.
 */
export function isDefined(argv: Arguments, field: string): boolean {
    const value = argv[field];

    if (typeof value === "undefined") {
        return false;
    }

    if (value === false) {
        return false;
    }

    if (typeof value === "string" && value.trim().length === 0) {
        return false;
    }

    return true;
}

export const globalCheckFunction = (argv: Arguments) => {
    if (
        !(isDefined(argv, "net") && isDefined(argv, "node")) &&
        !isDefined(argv, "devnet") &&
        !isDefined(argv, "mainnet")
    ) {
        throw new Error(
            "Use --mainnet, --devnet or provide a custom config using --net, --node, --explorer and --permanode"
        );
    } else {
        return true;
    }
};

/**
 * Obtains the network params from command arguments.
 *
 * @param args The arguments passed.
 * @returns The network params used for the command.
 */
export function getNetworkParams(args: Arguments): INetworkParams {
    let params: INetworkParams | undefined;

    if (isDefined(args, "mainnet")) {
        params = defaultNetParams.mainnet;
    } else if (isDefined(args, "devnet")) {
        params = defaultNetParams.devnet;
    } else {
        params = {
            node: args.node as string,
            networkId: args.net as string
        };
    }

    // --node, --permanode and --explorer will override default params (if any)
    if (isDefined(args, "node")) {
        params.node = args.node as string;
    }

    if (isDefined(args, "permanode")) {
        params.permanode = args.permanode as string;
    }

    if (isDefined(args, "explorer")) {
        params.explorer = args.explorer as string;
    }

    if (!params.permanode) {
        console.warn("Warning: no permanode specified. Identities will get pruned.");
    }

    if (!params.explorer) {
        console.warn("Warning: no explorer specified. Explorer links cannot be logged.");
    }

    return params;
}
