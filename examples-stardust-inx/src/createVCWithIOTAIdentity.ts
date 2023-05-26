// Copyright 2020-2022 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import {
    Credential,
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
            auth: { jwt:  TOKEN }
        },
        localPow: true,
    });
    const didClient = new IotaIdentityClient(client);

    const issuerDid = "did:iota:ebsi:0x9c0939fe864d813f4257374146b725e4e0c8a1424a3e2b54a83ffac1c9d94a39";
    const privateKey = "0x33a6111c4cdaa142b34367b79d1858daa39d56196a6f1261c612c6be90358111ec8db3bb05a78b537b9bb25a34c066572d635cc5dbfd84c0fa8afea37648a356";


    const elements = issuerDid.split(":");
    const did = IotaDID.fromAliasId(elements[elements.length - 1], elements[elements.length - 2]);
    const issuerDocument: IotaDocument = await didClient.resolveDid(did);
    console.log("Resolved DID document:", JSON.stringify(issuerDocument, null, 2));

    // Create a credential subject indicating the degree earned by Alice, linked to their DID.
    const subject = {
        id: "did:iota:tst:0x6abe6ef35e4dfd4242f932d6fbe1b1ae01b87a1b42a49329141602a9222980de",
        name: "Alice",
        degreeName: "Bachelor of Science and Arts",
        degreeType: "BachelorDegree",
        GPA: "4.0",
    };

    // Create an unsigned `UniversityDegree` credential for Alice
    const unsignedVc = new Credential({
        id: "https://example.edu/credentials/3732",
        type: "UniversityDegreeCredential",
        issuer: issuerDid,
        credentialSubject: subject,
    });

    const privateKeyBytes = Converter.hexToBytes(privateKey);

    // Sign Credential.
    let signedVc;

    try {
        signedVc = issuerDocument.signCredential(unsignedVc, privateKeyBytes.slice(0, 32), "#sign-1", ProofOptions.default());
    }
    catch (error) {
        console.error(error);
        return;
    }

    // The issuer is now sure that the credential they are about to issue satisfies their expectations.
    // The credential is then serialized to JSON and transmitted to the holder in a secure manner.
    // Note that the credential is NOT published to the IOTA Tangle. It is sent and stored off-chain.
    const credentialJSON = signedVc.toJSON();
    console.log("Issued credential: \n", JSON.stringify(credentialJSON, null, 2));
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
