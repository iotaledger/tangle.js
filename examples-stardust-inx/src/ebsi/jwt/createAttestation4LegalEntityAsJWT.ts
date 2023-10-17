// Copyright 2020-2022 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import {
    Credential,
    Timestamp
} from "@iota/identity-wasm/node/index.js";

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";

import { ebsiDidsJwk as ebsiDids } from "../dids";

import { get, toUnixSeconds } from "../../utilHttp";
import { JWK, JWT, type JWKObject, type JWTPayload, type JWTSignOptions } from "ts-jose";

import { legalEntitySchema } from "../schemas";


const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { TOKEN, PLUGIN_ENDPOINT } = process.env;

async function run() {

    // The root of trust accredits to accredit to the ES Government
    const issuerDid = ebsiDids.esGovernmentTAO.did;
    
    const privateKey = await JWK.fromObject(ebsiDids.esGovernmentTAO.privateKeySign as unknown as JWKObject);
    const kid = privateKey.kid;
    // We overwrite it in order the sign process does not fail
    privateKey.metadata.kid = `${issuerDid}#${kid}`;

    const issuerDocument = await get(`${PLUGIN_ENDPOINT}/identities/${encodeURIComponent(issuerDid)}`, TOKEN);
    console.error("Resolved DID document:", JSON.stringify(issuerDocument, null, 2));

    const subject = {
        id: ebsiDids.recyclerTI.did,
        legalName: "Company Recycler AG",
        domainName: "recycler.example.org",
        economicActivity: "http://data.europa.eu/ux2/nace2.1/38",
        legalEmailAddress: "info@recycler.example.org",
        account: "0x8324905441AA4cb6a9C7da0B5a9d644aea825360"
    };

    const expiresAt =  "2024-06-22T14:11:44Z";
    const credAsJson = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        id: "https://id.example.org/id999999",
        type: [
            "VerifiableCredential",
            "VerifiableAttestation"
        ],
        issuer: issuerDid,
        issuanceDate: Timestamp.nowUTC(),
        validFrom: Timestamp.nowUTC(),
        expirationDate: expiresAt,
        validUntil: expiresAt,
        issued: Timestamp.nowUTC(),
        credentialSchema: {
            "id": legalEntitySchema,
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
    };

    const cred = Credential.fromJSON(credAsJson);
    const finalCred = cred.toJSON();

    console.log(JSON.stringify(finalCred));

    const payload: JWTPayload = {
        vc: finalCred,
    };

    const options: JWTSignOptions = {
       issuer: issuerDid,
       subject: subject.id,
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

run().then(() => console.error("Done")).catch(err => console.error(err));
