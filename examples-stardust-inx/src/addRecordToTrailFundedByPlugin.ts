import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import { addTrailRecord } from "./trailOperations";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { PLUGIN_ENDPOINT, TOKEN } = process.env;

const trailID = "urn:trail:iota:ebsi:0x51b68173108c7ce357f09836da611057768c7641f823834aec49232667900ce2";
// The private key of whom controls the DID
const stateControllerPrivateKey = "0xaf6a6c1713c147920b87879d720b40c029883658cbd7df21366265211946337ad08f4711282a234005b19906dcea534e62d7cfc8220badf46a488b618f73a99e";
// Bech32Addr : tst1qqsjpwktq5xfrhd092u4rj4aye4peymgrg44glgg4g4vmlw2sjavqqtkv7g
const stateControllerPublicKey = "0xd08f4711282a234005b19906dcea534e62d7cfc8220badf46a488b618f73a99e";

async function run() {
    // A new record to the trail is added
    const record = {
        proof: {
            value: "4567888888"
        }
    };

    // Posting data to the plugin
    const result = await addTrailRecord({ url: PLUGIN_ENDPOINT, token: TOKEN}, trailID, record, {
        publicKey: stateControllerPublicKey, privateKey: stateControllerPrivateKey });

    console.log("Trail Next State: ", result.trail);
    console.log("Metadata:\n", result.meta);
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
