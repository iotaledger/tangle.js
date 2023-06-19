import { get } from "../utilHttp";

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { PLUGIN_ENDPOINT, TOKEN } = process.env;

// const trailID = "urn:trail:iota:tst:0x4f2efd3e41ba0f7e25b559f3a0ee6063ded47fa87ec496b6d4bc5cdefe3b6ffb";
const trailID = "urn:trail:iota:ebsi:0xcbb075774332807e96ff19eff63e343a7afa2abc1c247a3edf054b9735ca78c4";

async function run() {
    const trail = await get(`${PLUGIN_ENDPOINT}/trails/${encodeURIComponent(trailID)}`, TOKEN);

    console.log(trail);
}

run().then(() => console.log("Done")).catch(err => console.error(err));

export { };
