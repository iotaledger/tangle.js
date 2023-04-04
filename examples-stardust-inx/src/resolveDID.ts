import { get } from "./utilHttp";

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { PLUGIN_ENDPOINT, TOKEN } = process.env;

const did = "did:iota:ebsi:0x815b68865befb6a53b591bf7ad8f77d56c822b654205e1cbcd63d6fd5ce36040";
//const did = "did:iota:tst:0x1b2079ab4fb571a5ea759055d608d5bcd7256816ccba75b656a7d15046e56b99";

async function run() {
    const didContent = await get(`${PLUGIN_ENDPOINT}/identities/${encodeURIComponent(did)}`, TOKEN);

    console.log(didContent);
}

run().then(() => console.log("Done")).catch(err => console.error(err));

export { };
