import { Converter } from "@iota/util.js";
import { generateAddresses, requestFunds } from "../utilAddress";
import { Ed25519 } from "@iota/crypto.js";

import { post, type Meta, sleep, type Signature, type Trail } from "../utilHttp";

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { FAUCET, FAUCET_PASS, FAUCET_USER, NODE_ENDPOINT, PLUGIN_ENDPOINT, TOKEN } = process.env;

async function run() {
    const trail = {
        record: {
            proof: "1234"
        },
        immutable: {
            "sub": "A45678"
        }
    }

    const { publicKeys, privateKeys, bech32Addresses } = await generateAddresses(NODE_ENDPOINT, TOKEN, 1);

    // Funding the address that will control #0
    const fundingResult = await requestFunds(FAUCET, { user: FAUCET_USER, pass: FAUCET_PASS }, bech32Addresses[0]);
    console.log(fundingResult);
    console.log("Waiting for funding address ...");
    await sleep(6000);

    // Posting data to the plugin
    const result = await postToPlugin(trail, { bech32Addresses, privateKeys, publicKeys });

    console.log("Trail ID: ", result.trail["id"]);
    console.log("Metadata:\n", result.meta);
}


async function postToPlugin(trail: { [id: string]: unknown },
    params: { bech32Addresses: string[], privateKeys: Uint8Array[], publicKeys: Uint8Array[] }): Promise<Trail> {

    const pluginRequest = {
        type: "TrailCreation",
        action: "TransactionRequest",
        trail,
        meta: {
            stateControllerAddress: params.bech32Addresses[0],
            // In this case the funding an state controller addresses are the same but they can be different
            fundingAddress: params.bech32Addresses[0]
        }
    };

    const result1 = await post(`${PLUGIN_ENDPOINT}/trails`, TOKEN, pluginRequest);
    const nextPayload = result1 as { trail: Trail; meta: Meta }
        & { type: string; action: string; txEssenceHash: string; signature?: Signature[] };

    // The result will contain a txEssence that has to be signed
    // Once it is signed it has to be submitted to the plugin again
    const essence = Converter.hexToBytes(nextPayload.txEssenceHash);
    const essenceSigned = Ed25519.sign(params.privateKeys[0], essence);

    // Now the essence is signed then the same payload is sent including a signature
    nextPayload.type = "TrailCreation";
    nextPayload.action = "TransactionSignature";
    nextPayload.signature = [{
        publicKey: Converter.bytesToHex(params.publicKeys[0], true),
        signature: Converter.bytesToHex(essenceSigned, true)
    }];

    const finalResult = await post(`${PLUGIN_ENDPOINT}/trails`, TOKEN, nextPayload);

    return finalResult as Trail;
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
