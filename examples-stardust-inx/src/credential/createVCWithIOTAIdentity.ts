// Copyright 2020-2022 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import {
    Credential,
    ProofOptions,
    IotaDocument, IotaIdentityClient
    , IotaDID,
    Timestamp
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

    const issuerDid = "did:iota:ebsi:0x294504304088c482f5c56ad011c7233780e33191264ce65cc0617bd46493a137";
    const privateKey = "0x67787a144c107e3541998eb8d2189ab9baf3503cef9378a870d997aef570db6b8ac05ef856571d063c9a728af26f0afd831a10b572950a5cf2bf180ddef4c781";

    const elements = issuerDid.split(":");
    const did = IotaDID.fromAliasId(elements[elements.length - 1], elements[elements.length - 2]);
    const issuerDocument: IotaDocument = await didClient.resolveDid(did);
    console.log("Resolved DID document:", JSON.stringify(issuerDocument, null, 2));

    // Create a credential subject indicating the degree earned by Alice, linked to their DID.
    const subject = {
        id: "did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbrzdmNG8Mo31GpCiGD5E6GjYBiq6Dnz81gRmtWEsRrmcML3V2UNRtfXgZToChY2dfQq9ySg92PhH4vebHp2TJyuSFcLZBmx8FKD2McNDAiTELZNyyzatLWCv841s94DJgWg",
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
        validFrom: Timestamp.nowUTC()
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
