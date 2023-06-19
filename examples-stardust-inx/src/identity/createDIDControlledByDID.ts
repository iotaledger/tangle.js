import { Base58 } from "@iota/util.js";
import { generateAddresses } from "../utilAddress";

import { post, type FullDoc, sleep, get } from "../utilHttp";

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { NODE_ENDPOINT, PLUGIN_ENDPOINT, TOKEN } = process.env;

async function run() {
    // This DID Document can also be created with the help of the IOTA Identity Library
    const did = {
        id: "did:0:0",
        verificationMethod: [{
            id: "did:0:0#sign-1",
            type: "Ed25519VerificationKey2018",
            controller: "did:0:0",
            publicKeyMultibase: ""
        }]
    };

    // From the menemonic a key pair
    // The account #0 will be controlling the DID
    // The account #1 will be the verification method of the controller DID
    // The account #2 will be the verification method of the final DID (controlled by the first one)
    // Write the key pairs to the std output
    const { publicKeys, bech32Addresses } = await generateAddresses(NODE_ENDPOINT, TOKEN, 3);

    // Now converting the second private key into Base58 and multibase format and adding to the verification method
    did.verificationMethod[0].publicKeyMultibase = `z${Base58.encode(publicKeys[1])}`;

    // Posting data to the plugin
    const result = await postToPlugin(did, bech32Addresses[0]);

    console.log("DID: ", result.doc["id"]);
    console.log("Metadata:\n", result.meta);

    // Waiting for DID to be confirmed
    console.error("Waiting for confirmation of controller DID ...");
    await sleep(10000);

    // Now the original DID is resolved
    const resolveResponse = await get(`${PLUGIN_ENDPOINT}/identities/${encodeURIComponent(result.doc["id"] as string)}`, TOKEN);
    const didControllerDetails = resolveResponse as FullDoc;

    // Here the controller of the DID and the controller of the verification method
    // Are the controller just created before
    // The controller property of the verification method needs to be set explicitly 
    const finalDid = {
        id: "did:0:0",
        verificationMethod: [{
            id: "did:0:0#sign-1",
            type: "Ed25519VerificationKey2018",
            controller:  didControllerDetails.doc["id"],
            publicKeyMultibase: `z${Base58.encode(publicKeys[2])}`
        }]
    };

     // Posting data to the plugin
     const result2 = await postToPlugin(finalDid, didControllerDetails.meta["aliasAddress"] as string);
     console.log("Final DID: ", result2.doc["id"]);
     console.log("Metadata:\n", result2.meta);
}


async function postToPlugin(did: { [id: string]: unknown }, controller: string): Promise<FullDoc> {
    const pluginRequest = {
        type: "DIDCreation",
        action: "Issue",
        doc: did,
        meta: {
            stateControllerAddress: controller
        }
    };

    const result = await post(`${PLUGIN_ENDPOINT}/identities`, TOKEN, pluginRequest);

    return result as FullDoc;
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
