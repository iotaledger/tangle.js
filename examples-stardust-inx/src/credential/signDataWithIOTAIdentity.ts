// Copyright 2020-2022 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import {
    ProofOptions,
    IotaDocument, IotaIdentityClient
    , IotaDID
} from "@iota/identity-wasm/node/index.js";

import { Client } from "@iota/client-wasm/node/lib/index.js";

import { Converter } from "@iota/util.js";

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { NODE_ENDPOINT, TOKEN } = process.env;

async function run() {
    const client = new Client({
        primaryNode: {
            url: NODE_ENDPOINT,
            auth: { jwt: TOKEN }
        },
        localPow: true,
    });
    const didClient = new IotaIdentityClient(client);

    // const signerDid = "did:iota:ebsi:0xcd838efcfe53548fbdcd5890e18b22bc2016b91b46bfc28e72dc660f08494d23";
    const signerDid = "did:iota:tst:0xcaa521e19b04f3c75dcc6aa927b666f6947aa56d5a71011aa9e29165d4b41be4";
    const privateKey = "0x52aa743d3d2a3cffa0d29ffaa56197c2ae1723545e9daffeb90de2dab8da9594008edc7881290e8b49c63eb12f75706bbcb3913aa9ec25e16f7e2869bc958234";

    const elements = signerDid.split(":");
    const did = IotaDID.fromAliasId(elements[elements.length - 1], elements[elements.length - 2]);
    const issuerDocument: IotaDocument = await didClient.resolveDid(did);
    console.log("Resolved DID document:", JSON.stringify(issuerDocument, null, 2));

    // Create a credential subject indicating the degree earned by Alice, linked to their DID.
    const data = {
        "type": "Organization",
        "name": "IOTA Foundation"
    };


    const privateKeyBytes = Converter.hexToBytes(privateKey);

    // Sign Credential.
    let signedData;

    try {
        signedData = issuerDocument.signData(data, privateKeyBytes.slice(0, 32), did + "#sign-1", ProofOptions.default());
    }
    catch (error) {
        console.error(error);
        return;
    }

    // The issuer is now sure that the credential they are about to issue satisfies their expectations.
    // The credential is then serialized to JSON and transmitted to the holder in a secure manner.
    // Note that the credential is NOT published to the IOTA Tangle. It is sent and stored off-chain.
    const { verificationMethod } = signedData.proof;
    signedData.proof.verificationMethod = `${did}${verificationMethod}`;
    console.log("Signed Data: \n", JSON.stringify(signedData, null, 2));
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
