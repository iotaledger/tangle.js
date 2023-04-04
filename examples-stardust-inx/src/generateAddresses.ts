import { generateAddresses, requestFunds } from "./utilAddress";

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { FAUCET, FAUCET_PASS, FAUCET_USER, NODE_ENDPOINT, TOKEN } = process.env;

async function run() {
    const { bech32Addresses } = await generateAddresses(NODE_ENDPOINT, TOKEN, 6);

    // The first address is funded
    await requestFunds(FAUCET, {user: FAUCET_USER, pass: FAUCET_PASS}, bech32Addresses[0]);
}

run().then(() => console.log("Done")).catch(err => console.error(err));

export { };
