import { generateAddresses } from "./utilAddress";

import { post, type Trail } from "./utilHttp";

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { NODE_ENDPOINT, PLUGIN_ENDPOINT, TOKEN } = process.env;

async function run() {
    const trail = {
        record: {
            proof: "1234"
        },
        immutable: {
            "sub": "A45678"
        }
    }

    // From the menemonic a key pair
    // The account #0 will be controlling the Trail
    // Write the key pairs to the std output
    const { bech32Addresses } = await generateAddresses(NODE_ENDPOINT, TOKEN, 1);

    // Posting data to the plugin
    const result = await postToPlugin(trail, bech32Addresses);

    console.log("Trail ID: ", result.trail["id"]);
    console.log("Metadata:\n", result.meta);
}


async function postToPlugin(trail: { [id: string]: unknown }, bech32Addresses: string[]): Promise<Trail> {
    const pluginRequest = {
        type: "TrailCreation",
        action: "Issue",
        trail,
        meta: {
            // The stateController address could be omitted but in that case the plugin will be controlling as well
            stateControllerAddress: bech32Addresses[0]
        }
    };

    const result = await post(`${PLUGIN_ENDPOINT}/trails`, TOKEN, pluginRequest);

    return result as Trail;
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
