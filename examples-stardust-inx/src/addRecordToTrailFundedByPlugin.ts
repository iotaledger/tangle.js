import { Converter } from "@iota/util.js";
import { Ed25519 } from "@iota/crypto.js";

import { post, type Meta, type Signature, type Trail, type TrailRecord } from "./utilHttp";

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
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
            value: "4567"
        }
    };

    // Posting data to the plugin
    const result = await postToPlugin(record);

    console.log("Trail Next State: ", result.trail);
    console.log("Metadata:\n", result.meta);
}


async function postToPlugin(record: TrailRecord): Promise<Trail> {
    const pluginRequest = {
        type: "TrailRecordAdd",
        action: "TransactionRequest",
        record
    };

    const updateEndpoint = `${PLUGIN_ENDPOINT}/trails/${encodeURIComponent(trailID)}`;

    const result1 = await post(updateEndpoint, TOKEN, pluginRequest);
    const nextPayload = result1 as { trail: Trail; meta: Meta }
        & { type: string; action: string; txEssenceHash: string; signature?: Signature[] };

    // Now the transaction has to be signed by the state controller

    // The result will contain a txEssence that has to be signed
    // Once it is signed it has to be submitted to the plugin again
    const essence = Converter.hexToBytes(nextPayload.txEssenceHash);
    const essenceSigned = Ed25519.sign(Converter.hexToBytes(stateControllerPrivateKey), essence);

    // Now the essence is signed then the same payload is sent including a signature
    nextPayload.type = "TrailRecordAdd";
    nextPayload.action = "TransactionSignature";
    nextPayload.signature = [{
        publicKey: stateControllerPublicKey,
        signature: Converter.bytesToHex(essenceSigned, true)
    }];

    const finalResult = await post(updateEndpoint, TOKEN, nextPayload);

    return finalResult as Trail;
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
