import { Base58 } from "@iota/util.js";
import { generateAddresses } from "./generateAddresses";

import { post, type FullDoc } from "./util";

const NODE_ENDPOINT = "http://52.213.240.168:14265";
const PLUGIN_ENDPOINT = `${NODE_ENDPOINT}/api/ext/v1/identities`;

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
    const { publicKeys, bech32Addresses } = await generateAddresses(NODE_ENDPOINT);

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
            stateControllerAddress: bech32Addresses[0]
        }
    };

    const result = await post(PLUGIN_ENDPOINT, pluginRequest);

    return result as FullDoc;
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
