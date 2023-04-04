import { Base58, Converter } from "@iota/util.js";
import { generateAddresses } from "./utilAddress";
import { Ed25519 } from "@iota/crypto.js";

import { post, type Doc, type FullDoc, type Meta, type Signature } from "./utilHttp";

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { NODE_ENDPOINT, PLUGIN_ENDPOINT, TOKEN } = process.env;

const didToUpdate = "did:iota:ebsi:0x6e78f05ebab593e1045bcf319d053b4c592dd446679bacfd8b7be631993c22bd";
// The private key of whom controls the DID
const stateControllerPrivateKey = "0xc757af48f988ab2ca14d7b6976b8f12d961ccc60633b8e8c593885329b2dce0a9f6c467187860c7f8221c5922102067fa9847ed8b0b16503e96a84ed1fc685d2";
// Bech32Addr : ebsi1qrelqrvcmmu2k6t0kpnr434jqlrlmg2vp6cqx2tchysf40t9tazw2zgyhu5
const stateControllerPublicKey = "0x9f6c467187860c7f8221c5922102067fa9847ed8b0b16503e96a84ed1fc685d2";

async function run() {
    // The DID is updated
    const did = {
        id: "did:0:0",
        verificationMethod: [{
            id: `${didToUpdate}#sign-11`,
            type: "Ed25519VerificationKey2018",
            controller: `${didToUpdate}`,
            publicKeyMultibase: ""
        }]
    }

    // From the menemonic a key pair
    // The account #0 will be controlling the DID
    // The account #1 will be the verification method
    // Write the key pairs to the std output
    const { publicKeys } = await generateAddresses(NODE_ENDPOINT, TOKEN, 1);

    // Now converting the second private key into Base58 and multibase format and adding to the verification method
    did.verificationMethod[0].publicKeyMultibase = `z${Base58.encode(publicKeys[0])}`;

    // Posting data to the plugin
    const result = await postToPlugin(did);

    console.log("DID: ", result.doc["id"]);
    console.log("Metadata:\n", result.meta);
}


async function postToPlugin(did: { [id: string]: unknown }): Promise<FullDoc> {
    const pluginRequest = {
        type: "DIDUpdate",
        action: "TransactionRequest",
        doc: did
    };

    const updateEndpoint = `${PLUGIN_ENDPOINT}/identities/${encodeURIComponent(didToUpdate)}`;

    const result1 = await post(updateEndpoint, TOKEN, pluginRequest);
    const nextPayload = result1 as { doc: Doc; meta: Meta }
        & { type: string; action: string; txEssenceHash: string; signature?: Signature[] };

    // Now the transaction has to be signed by the state controller

    // The result will contain a txEssence that has to be signed
    // Once it is signed it has to be submitted to the plugin again
    const essence = Converter.hexToBytes(nextPayload.txEssenceHash);
    const essenceSigned = Ed25519.sign(Converter.hexToBytes(stateControllerPrivateKey), essence);

    // Now the essence is signed then the same payload is sent including a signature
    nextPayload.type = "DIDUpdate";
    nextPayload.action = "TransactionSignature";
    nextPayload.signature = [{
        publicKey: stateControllerPublicKey,
        signature: Converter.bytesToHex(essenceSigned, true)
    }];

    const finalResult = await post(updateEndpoint, TOKEN, nextPayload);

    return finalResult as FullDoc;
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
