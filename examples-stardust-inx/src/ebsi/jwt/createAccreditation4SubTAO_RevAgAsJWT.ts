// Copyright 2020-2022 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import {
    Credential,
    Timestamp
} from "@iota/identity-wasm/node/index.js";


import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import { ebsiDidsJwk as ebsiDids } from "../dids";
import { accreditationSchema, dppSchema, legalEntitySchema } from "../schemas";
import { JWK, JWT, type JWKObject, type JWTPayload, type JWTSignOptions } from "ts-jose";
import { get, toUnixSeconds } from "../../utilHttp";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { PLUGIN_ENDPOINT, TOKEN } = process.env;

async function run() {

    const issuer =  ebsiDids.rootTrust;
    const subject = ebsiDids.esGovernmentTAO;

    // The root of trust accredits to accredit to the ES Government
    const issuerDid = issuer.did;

    // Issuer's private key used to sign
    const privateKey = await JWK.fromObject(issuer.privateKeySign as unknown as JWKObject);
    const kid = privateKey.kid;
    // We overwrite it in order the sign process does not fail
    privateKey.metadata.kid = `${issuerDid}#${kid}`;

    const issuerDocument = await get(`${PLUGIN_ENDPOINT}/identities/${encodeURIComponent(issuerDid)}`, TOKEN);
    console.error("Resolved DID document:", JSON.stringify(issuerDocument, null, 2));

    const subjectData = {
        id: subject.did,
        reservedAttributeId: "88888",
        accreditedFor: [
            {
                schemaId: legalEntitySchema,
                types: [
                    "VerifiableCredential",
                    "VerifiableAttestation"
                ],
                limitJurisdiction: "https://publications.europa.eu/resource/authority/atu/ESP"
            },
            // The revenue agency can give this accreditation to those legal entities, i.e. economic operators
            // that are in economicActivity eligible for issuing DPP Data
            // That's why this is made explicit here, albeit it could have been implicit
            {
                schemaId: dppSchema,
                types: [
                    "VerifiableCredential",
                    "VerifiableAccreditation",
                    "VerifiableAccreditationToAttest",
                ],
                limitJurisdiction: "https://publications.europa.eu/resource/authority/atu/ESP"
            }
        ]
    };

    const credAsJson = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        id: "https://id.example.org/id999999",
        type: [
            "VerifiableCredential",
            "VerifiableAccreditation",
            "VerifiableAccreditationToAttest",
            // The Rev Ag can accredit product operators to issue DPP Data
            "VerifiableAccreditationToAccredit"
        ],
        issuer: issuerDid,
        issuanceDate: Timestamp.nowUTC(),
        validFrom: Timestamp.nowUTC(),
        expirationDate: "2024-06-22T14:11:44Z",
        issued: Timestamp.nowUTC(),
        credentialSchema: {
            "id": accreditationSchema,
            "type": "FullJsonSchemaValidator2021"
        },
        credentialSubject: subjectData,
        credentialStatus: {
            id: "https://api-test.ebsi.eu/trusted-issuers-registry/v4/issuers/did:ebsi:zZeKyEJfUTGwajhNyNX928z/attributes/60ae46e4fe9adffe0bc83c5e5be825aafe6b5246676398cd1ac36b8999e088a8",
            type: "EbsiAccreditationEntry"
        },
        termsOfUse:
        {
            id: "https://api-test.ebsi.eu/trusted-issuers-registry/terms/of/use",
            type: "IssuanceCertificate"
        }
    };

    const cred = Credential.fromJSON(credAsJson);
    const finalCred = cred.toJSON();

    const payload: JWTPayload = {
        vc: finalCred,
    };

    const options: JWTSignOptions = {
        issuer: issuerDid,
        subject: subject.did,
        jti: finalCred["id"],
        kid: `${issuerDid}#${kid}`,
        notBefore: toUnixSeconds(finalCred["validFrom"]),
        iat: toUnixSeconds(finalCred["issued"]),
        exp: toUnixSeconds(finalCred["expirationDate"])
    };

    let token = "";
    try {
        // Now the JWT Claims are defined
        token = await JWT.sign(payload, privateKey, options)
    }
    catch (error) {
        console.error(error);
        return;
    }

    console.log(token);
}

export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
