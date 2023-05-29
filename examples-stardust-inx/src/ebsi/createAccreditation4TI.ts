// Copyright 2020-2022 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import {
    Credential,
    ProofOptions,
    IotaDocument, IotaIdentityClient
    , IotaDID,
    ProofPurpose,
    IotaDIDUrl,
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
            auth: { jwt: TOKEN }
        },
        localPow: true,
    });
    const didClient = new IotaIdentityClient(client);

    /*
    const issuerDid = "did:iota:ebsi:0x9c0939fe864d813f4257374146b725e4e0c8a1424a3e2b54a83ffac1c9d94a39";
    const verMethod =  "#sign-1";
    const privateKey = "0x33a6111c4cdaa142b34367b79d1858daa39d56196a6f1261c612c6be90358111ec8db3bb05a78b537b9bb25a34c066572d635cc5dbfd84c0fa8afea37648a356";
    */

    const issuerDid = "did:iota:tst:0xd9a66e585ecfdf44fdf4aa3b76a46576184bbcb2a2fa09f990593dd460dbac24";
    const verMethod = "#sign-1";
    const privateKey = "0x2391bfcd6a39cf400ea60e1ed4bb681b851603f7a5b21c306599669fb9f975009b8b4f71f845c67beda1e1ae7962c277a59ec9c93e0a269ce7b40d3b8f9adad6";

    const elements = issuerDid.split(":");
    const did = IotaDID.fromAliasId(elements[elements.length - 1], elements[elements.length - 2]);
    const issuerDocument: IotaDocument = await didClient.resolveDid(did);
    console.log("Resolved DID document:", JSON.stringify(issuerDocument, null, 2));

    const subject = {
        id: "did:iota:ebsi:0x70194f5e8ec8fdb4fb94b458806c074269b52bd5ce0f14d73feb797244e8f5b9",
        reservedAttributeId: "60ae46e4fe9adffe0bc83c5e5be825aafe6b5246676398cd1ac36b8999e088a8",
        accreditedFor: [
            {
                "schemaId": "https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/json-schema/raw/schemas/ebsi-vid/legal-entity/2022-11/schema.json",
                "types": [
                    "VerifiableCredential",
                    "VerifiableAttestation"
                ],
                "limitJurisdiction": "https://publications.europa.eu/resource/authority/atu/ESP"
            }
        ]
    };

    const credAsJson = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        id: "https://id.example.org/accreditation/1001",
        type: [
            "VerifiableCredential",
            "VerifiableAttestation",
            "VerifiableAccreditation",
            "VerifiableAccreditationToAttest"
        ],
        issuer: issuerDid,
        issuanceDate: Timestamp.nowUTC(),
        validFrom: Timestamp.nowUTC(),
        expirationDate: "2024-06-22T14:11:44Z",
        issued: Timestamp.nowUTC(),
        credentialSchema: {
            "id": "https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/json-schema/raw/schemas/ebsi-accreditation/2023-04/schema.json",
            "type": "FullJsonSchemaValidator2021"
        },
        credentialSubject: subject,
        credentialStatus: {
            id: "https://api-test.ebsi.eu/trusted-issuers-registry/v4/issuers/did:ebsi:zZeKyEJfUTGwajhNyNX928z/attributes/60ae46e4fe9adffe0bc83c5e5be825aafe6b5246676398cd1ac36b8999e088a8",
            type: "EbsiAccreditationEntry"
        },
        termsOfUse:
        {
            id: "https://api-test.ebsi.eu/trusted-issuers-registry/terms/of/use",
            type: "IssuanceCertificate"
        }

    }

    // Workaround to add Credential Schema

    const privateKeyBytes = Converter.hexToBytes(privateKey);

    // Sign Credential.
    let signedVc;

    try {
        const options = new ProofOptions({
            purpose: ProofPurpose.assertionMethod(),
            created: credAsJson["issued"]
        });

        const iotaUrl = IotaDIDUrl.parse(`${issuerDid}${verMethod}`);

        signedVc = issuerDocument.signCredential(Credential.fromJSON(credAsJson), privateKeyBytes.slice(0, 32), iotaUrl, options);
    }
    catch (error) {
        console.error(error);
        return;
    }

    // The issuer is now sure that the credential they are about to issue satisfies their expectations.
    // The credential is then serialized to JSON and transmitted to the holder in a secure manner.
    // Note that the credential is NOT published to the IOTA Tangle. It is sent and stored off-chain.
    const credentialJSON = signedVc;
    console.log("Issued credential: \n", JSON.stringify(credentialJSON, null, 2));
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
