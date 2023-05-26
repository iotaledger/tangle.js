// Copyright 2020-2022 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import {
    Credential,
    ProofOptions,
    IotaDocument, IotaIdentityClient
    , IotaDID,
    ProofPurpose
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
    const verMethod =  "#sign-1";
    const privateKey = "0x33a6111c4cdaa142b34367b79d1858daa39d56196a6f1261c612c6be90358111ec8db3bb05a78b537b9bb25a34c066572d635cc5dbfd84c0fa8afea37648a356";

    const elements = issuerDid.split(":");
    const did = IotaDID.fromAliasId(elements[elements.length - 1], elements[elements.length - 2]);
    const issuerDocument: IotaDocument = await didClient.resolveDid(did);
    console.log("Resolved DID document:", JSON.stringify(issuerDocument, null, 2));

    // Create a credential subject indicating the degree earned by Alice, linked to their DID.
    const subject = {
        id: "did:iota:ebsi:0x70194f5e8ec8fdb4fb94b458806c074269b52bd5ce0f14d73feb797244e8f5b9",
        legalName: "Company AG",
        domainName: "company.example.org"
    };

    // Create an unsigned `UniversityDegree` credential for Alice
    const unsignedVc = new Credential({
        context: ["https://europa.eu/schemas/v-id/2020/v1"],
        id: "https://example.edu/credentials/3732",
        type: "VerifiableAttestation",
        issuer: issuerDid,
        credentialSubject: subject
    });

    const credAsJson = unsignedVc.toJSON();
    // Workaround to add Credential Schema
    credAsJson["credentialSchema"] = {
        type: "FullJsonSchemaValidator2021",
        id: "https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/json-schema/raw/schemas/ebsi-vid/legal-entity/2022-11/schema.json"
    }
    credAsJson["issued"] = credAsJson["issuanceDate"];
    credAsJson["validFrom"] = credAsJson["issuanceDate"];

    const privateKeyBytes = Converter.hexToBytes(privateKey);

    // Sign Credential.
    let signedVc;

    try {
        const options = new ProofOptions({
            purpose: ProofPurpose.assertionMethod(),
            created: credAsJson["issued"]
        });

        signedVc = issuerDocument.signData(credAsJson, privateKeyBytes.slice(0, 32), verMethod, options);
    }
    catch (error) {
        console.error(error);
        return;
    }

    // This has to be adapted on the plugin side so that data integrity proof is respected
    signedVc["proof"]["verificationMethod"] = `${issuerDid}${verMethod}`;
    // Workaround to meet the restrictions of EBSI not already implemented in IOTA
    signedVc["proof"]["jws"] = "";

    // The issuer is now sure that the credential they are about to issue satisfies their expectations.
    // The credential is then serialized to JSON and transmitted to the holder in a secure manner.
    // Note that the credential is NOT published to the IOTA Tangle. It is sent and stored off-chain.
    const credentialJSON = signedVc;
    console.log("Issued credential: \n", JSON.stringify(credentialJSON, null, 2));
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
