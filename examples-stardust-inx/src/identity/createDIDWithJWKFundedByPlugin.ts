import { generateAddresses } from "../utilAddress";

import { post, type FullDoc } from "../utilHttp";

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import { JWK } from "ts-jose";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { NODE_ENDPOINT, PLUGIN_ENDPOINT, TOKEN } = process.env;

async function run() {
    const verMethod = "sign-1";

    // This DID Document can also be created with the help of the IOTA Identity Library
    const did = {
        id: "did:0:0",
        verificationMethod: [{
            id: `did:0:0#${verMethod}`,
            type: "JsonWebKey2020",
            controller: "did:0:0",
            publicKeyJwk: {}
        }]
    }

    // From the menemonic a key pair
    // The account #0 will be controlling the DID
    // The account #1 will be the verification method
    // Write the key pairs to the std output
    const { bech32Addresses } = await generateAddresses(NODE_ENDPOINT, TOKEN, 1);

    // Now the JWK is generated and its public key just copied to the DID and the Private Key printed to stdout
    const key: JWK = await JWK.generate("ES256", {
        // At this point in time we don't know the full Kid as we don't know the DID
        // This could be done in two steps, one generating an empty DID and then adding the Ver Method through
        // an update operation
        kid: `${verMethod}`,
        use: "sig",
        // crv: string, some algorithms need to add curve - EdDSA
        // modulusLength: number, some algorithms need to add length - RSA
    });

    did.verificationMethod[0].publicKeyJwk = key.toObject(false);

    // Posting data to the plugin
    const result = await postToPlugin(did, bech32Addresses);

    const privateKey = key.toObject(true);
    privateKey.kid = `${result.doc["id"]}#${verMethod}`;
    console.log("Private Key of the Verification Method: ");
    console.log(JSON.stringify(privateKey, undefined, 2));
    console.log();

    console.log("DID: ", result.doc["id"]);
    console.log("Metadata:\n", result.meta);
}


async function postToPlugin(did: { [id: string]: unknown }, bech32Addresses: string[]): Promise<FullDoc> {
    const pluginRequest = {
        type: "DIDCreation",
        action: "Issue",
        doc: did,
        meta: {
            // The stateController address could be omitted but in that case the plugin itself will be controller
            stateControllerAddress: bech32Addresses[0]
        }
    };

    const result = await post(`${PLUGIN_ENDPOINT}/identities`, TOKEN, pluginRequest);

    return result as FullDoc;
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
