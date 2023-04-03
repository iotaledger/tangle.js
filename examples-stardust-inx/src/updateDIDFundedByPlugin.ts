import { Base58, Converter } from "@iota/util.js";
import { generateAddresses } from "./utilAddress";
import { Ed25519 } from "@iota/crypto.js";

import { post, type Doc, type FullDoc, type Meta, type Signature } from "./utilHttp";

import { NODE_ENDPOINT, PLUGIN_ENDPOINT } from "./endpoint";

const didToUpdate = "did:iota:tst:0xc1bc321c72f9baa7c3d68163defd78603611eba9560ce858e251d72422b00578";
// The private key of whom controls the DID
const stateControllerPrivateKey = "0x285ce4fafc76a915243b338c1840c46b9098e2df5f98252bee6eaf889fe392d9fb6409931d569069662b28537de10e0864c0dd13db917acee58d22abd7db13b6";
// Bech32Addr : tst1qp4ewjgq6k3nw9traf8dwwwuwcx9lh8pfxdcputt7jeu9q4ym0njjgp89s3
const stateControllerPublicKey = "0xfb6409931d569069662b28537de10e0864c0dd13db917acee58d22abd7db13b6";

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
    const { publicKeys } = await generateAddresses(NODE_ENDPOINT, 1);

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

    const updateEndpoint = `${PLUGIN_ENDPOINT}/identities/${didToUpdate}`;

    const result1 = await post(updateEndpoint, pluginRequest);
    const nextPayload = result1 as { doc: Doc; meta: Meta }
        & { type: string; action: string; txEssenceHash: string; signature: Signature[] };

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

    const finalResult = await post(updateEndpoint, nextPayload);

    return finalResult as FullDoc;
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
