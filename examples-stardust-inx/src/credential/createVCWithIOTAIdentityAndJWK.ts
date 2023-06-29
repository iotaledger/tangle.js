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
import { JWK, type JWKObject } from "ts-jose";
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

    const issuerDid = "did:iota:tst:0x1857d5fc9394dc7b3495c1872f35e1ace8a52ee545c4898a1302cbbee05e4566";
    const privateKey = {
        "use": "sig",
        "alg": "EdDSA",
        "crv": "Ed25519",
        "d": "jtthhj-ln6wpD3NyzvpoW44i8ONqil7YzPgCDaX2UMo",
        "x": "OlXv4KUmDPuHC-doMbFc0LdrvMOdh8SHSnBwXQ55rOs",
        "kty": "OKP",
        "kid": "did:iota:tst:0x1857d5fc9394dc7b3495c1872f35e1ace8a52ee545c4898a1302cbbee05e4566#Bq_HhGeQUCqe82fL120PWcyZtZeJDKZ6WJ7rs8DTAjM"
    };

    const key = await JWK.fromObject(privateKey as unknown as JWKObject);
    console.log(key.alg);

    const elements = issuerDid.split(":");
    const did = IotaDID.fromAliasId(elements[elements.length - 1], elements[elements.length - 2]);
    const issuerDocument: IotaDocument = await didClient.resolveDid(did);
    console.log("Resolved DID document:", JSON.stringify(issuerDocument, null, 2));

    // Create a credential subject indicating the degree earned by Alice, linked to their DID.
    const subject = {
        id: "did:iota:tst:0x986fe72c5e1e8f0a628daa02fe92e7e6c8d3482f73dc6052d8e932025081021b",
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
        validFrom: "2023-06-13T16:08:00Z"
    });

    const privateKeyBytes = Converter.hexToBytes("1234");

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
