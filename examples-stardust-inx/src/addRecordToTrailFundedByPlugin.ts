import { Converter } from "@iota/util.js";
import { Ed25519 } from "@iota/crypto.js";

import { post, type Meta, type Signature, type Trail, type TrailRecord } from "./utilHttp";

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { PLUGIN_ENDPOINT, TOKEN } = process.env;

const trailID = "urn:trail:iota:tst:0x838a79bc8ca2204971ff7a03ba1252292c8719be0a2fb517f1103abc23a9f835";
// The private key of whom controls the DID
const stateControllerPrivateKey = "0x769eee8f423c7f76be74e0623931e77a71a20560b61a3ac289f427e2004cad57fb633de0ba653470415e44c0482aeed0ae4b3d29aa6903d7452cbc4109b0ccc9";
// Bech32Addr : tst1qqsjpwktq5xfrhd092u4rj4aye4peymgrg44glgg4g4vmlw2sjavqqtkv7g
const stateControllerPublicKey = "0xfb633de0ba653470415e44c0482aeed0ae4b3d29aa6903d7452cbc4109b0ccc9";

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
