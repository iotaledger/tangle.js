// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Arguments } from "yargs";
import { getNetworkParams } from "../../globalParams";
import { IdentityHelper } from "../identityHelper";

export default class ResolveDidCommandExecutor {
    public static async execute(args: Arguments): Promise<boolean> {
        const did = args.did as string;

        try {
            const identityClient = await IdentityHelper.getClient(getNetworkParams(args));

            const resolution = await identityClient.resolve(did);

            console.log(resolution.intoDocument().toJSON().doc);
        } catch (error) {
            console.error("Error:", error);
            return false;
        }

        return true;
    }
}
