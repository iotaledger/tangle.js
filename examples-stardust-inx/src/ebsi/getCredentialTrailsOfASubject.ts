import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import { ebsiDids } from "./dids";
import { get } from "../utilHttp";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { PLUGIN_ENDPOINT, TOKEN } = process.env;

// const trailID = "urn:trail:iota:tst:0x4f2efd3e41ba0f7e25b559f3a0ee6063ded47fa87ec496b6d4bc5cdefe3b6ffb";
const did = ebsiDids.esGovernmentTAO.did;

async function run() {
    const response = await get(`${PLUGIN_ENDPOINT}/credentials/${encodeURIComponent(did)}`, TOKEN);

    console.log(response);
}

run().then(() => console.log("Done")).catch(err => console.error(err));

export { };
