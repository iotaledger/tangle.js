// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Options } from "yargs";

export default interface ICommandParam {
    name: string;
    options: Options;
}
