import { get } from "./utilHttp";

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { PLUGIN_ENDPOINT, TOKEN } = process.env;

const trailID = "urn:trail:iota:tst:0x4f2efd3e41ba0f7e25b559f3a0ee6063ded47fa87ec496b6d4bc5cdefe3b6ffb";

async function run() {
    const didContent = await get(`${PLUGIN_ENDPOINT}/trails/${encodeURIComponent(trailID)}`, TOKEN);

    console.log(didContent);
}

run().then(() => console.log("Done")).catch(err => console.error(err));

export { };
