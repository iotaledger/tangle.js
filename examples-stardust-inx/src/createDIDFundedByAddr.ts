import { Converter, Base58 } from "@iota/util.js";
import { generateAddresses } from "./generateAddresses";
import { Ed25519 } from "@iota/crypto.js";

import { post, type FullDoc, type Doc, type Meta, sleep, type Signature } from "./util";

const NODE_ENDPOINT = "http://52.213.240.168:14265";
const PLUGIN_ENDPOINT = `${NODE_ENDPOINT}/api/ext/v1/identities`

const FAUCET = "http://52.213.240.168:8091/api/enqueue"

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

    const { publicKeys, privateKeys, bech32Addresses } = await generateAddresses(NODE_ENDPOINT);

    // Now converting the second private key into Base58 and multibase format and adding to the verification method
    did.verificationMethod[0].publicKeyMultibase = `z${Base58.encode(publicKeys[1])}`;

    // Funding the address that will control #0
    const fundingResult = await requestFunds(FAUCET, bech32Addresses[0]);
    console.log(fundingResult);
    console.log("Waiting for funding address ...");
    await sleep(6000);

    // Posting data to the plugin
    const result = await postToPlugin(did, { bech32Addresses, privateKeys, publicKeys });

    console.log("DID: ", result.doc["id"]);
    console.log("Metadata:\n", result.meta);
}


async function postToPlugin(did: { [id: string]: unknown },
    params: { bech32Addresses: string[], privateKeys: Uint8Array[], publicKeys: Uint8Array[] }): Promise<FullDoc> {

    const pluginRequest = {
        type: "DIDCreation",
        action: "TransactionRequest",
        doc: did,
        meta: {
            stateControllerAddress: params.bech32Addresses[0],
            // In this case the funding an state controller addresses are the same but they can be different
            fundingAddress: params.bech32Addresses[0]
        }
    };

    const result1 = await post(PLUGIN_ENDPOINT, pluginRequest);
    const nextPayload = result1 as { doc: Doc; meta: Meta }
        & { type: string; action: string; txEssenceHash: string; signature: Signature[] };

    console.log(nextPayload);

    // The result will contain a txEssence that has to be signed
    // Once it is signed it has to be submitted to the plugin again
    const essence = Converter.hexToBytes(nextPayload.txEssenceHash);
    const essenceSigned = Ed25519.sign(params.privateKeys[0], essence);

    // Now the essence is signed then the same payload is sent including a signature
    nextPayload.type = "DIDCreation";
    nextPayload.action = "TransactionSignature";
    nextPayload.signature = [{
        publicKey: Converter.bytesToHex(params.publicKeys[0], true),
        signature: Converter.bytesToHex(essenceSigned, true)
    }];

    console.log(nextPayload);

    const finalResult = await post(PLUGIN_ENDPOINT, nextPayload);

    return finalResult as FullDoc;
}

async function requestFunds(url: string, addressBech32: string): Promise<unknown> {
    const requestFounds = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address: addressBech32 })
    });

    return await requestFounds.json();
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
