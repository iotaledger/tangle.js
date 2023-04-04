import { Base58 } from "@iota/util.js";
import { generateAddresses } from "./utilAddress";

import { post, type FullDoc } from "./utilHttp";

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
    }

    // From the menemonic a key pair
    // The account #0 will be controlling the DID
    // The account #1 will be the verification method
    // Write the key pairs to the std output
    const { publicKeys, bech32Addresses } = await generateAddresses(NODE_ENDPOINT, TOKEN, 2);

    // Now converting the second private key into Base58 and multibase format and adding to the verification method
    did.verificationMethod[0].publicKeyMultibase = `z${Base58.encode(publicKeys[1])}`;

    // Posting data to the plugin
    const result = await postToPlugin(did, bech32Addresses);

    console.log("DID: ", result.doc["id"]);
    console.log("Metadata:\n", result.meta);
}


async function postToPlugin(did: { [id: string]: unknown }, bech32Addresses: string[]): Promise<FullDoc> {
    const pluginRequest = {
        type: "DIDCreation",
        action: "Issue",
        doc: did,
        meta: {
            // The stateController address could be omitted but in that case 
            stateControllerAddress: bech32Addresses[0]
        }
    };

    const result = await post(`${PLUGIN_ENDPOINT}/identities`, TOKEN, pluginRequest);

    return result as FullDoc;
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
