// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Arguments } from "yargs";
import commandRegistry from "./commandRegistry";

export default class TcliExecutor {
    public static execute(args: Arguments): void {
        console.log(args, commandRegistry);
    }
}
