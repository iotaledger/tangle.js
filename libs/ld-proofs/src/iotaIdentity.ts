/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/naming-convention */

const isBrowser = new Function("try { return this===window; } catch(e) { return false; }");

import { VerificationMethod as Vm, Document as D,
    Client as Cl, Config as Cfg, Network as Net } from "@iota/identity-wasm/node";

let VerificationMethod: typeof Vm = Vm;
let Document: typeof D = D;
let Client: typeof Cl = Cl;
let Config: typeof Cfg = Cfg;
let Network: typeof Net = Net;

const requirePath = "@iota/identity-wasm/web";

if (isBrowser()) {
    console.log("Browser environment. Loading WASM Web bindings");

    VerificationMethod = require(requirePath).VerificationMethod;
    Document = require(requirePath).Document;

    Client = require(requirePath).Client;
    Config = require(requirePath).Config;
    Network = require(requirePath).Network;
}

export { VerificationMethod, Document, Client, Config, Network };
