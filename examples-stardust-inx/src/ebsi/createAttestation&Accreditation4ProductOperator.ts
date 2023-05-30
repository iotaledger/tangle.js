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
import { dids } from "./dids";
import { /* accreditationSchema,*/ legalEntitySchema } from "./schemas";
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

    const issuerDid = dids.revenueAgencyTAO.did;
    const verMethod = "#sign-1";
    const privateKey = dids.revenueAgencyTAO.privateKeySign;

    const elements = issuerDid.split(":");
    const did = IotaDID.fromAliasId(elements[elements.length - 1], elements[elements.length - 2]);
    const issuerDocument: IotaDocument = await didClient.resolveDid(did);
    console.log("Resolved DID document:", JSON.stringify(issuerDocument, null, 2));

    // Create a credential subject for the Legal Entity for which the attestation is being created
    const subject = {
        id: dids.manufacturerLegalEntity.did,
        legalName: "Company Manufacturer AG",
        domainName: "manufacturer.example.org",
        limitJurisdiction: "https://publications.europa.eu/resource/authority/atu/ESP",
        accreditedFor: [
            {
                schemaId: "https://raw.githubusercontent.com/iotaledger/ebsi-stardust-components/master/docs/public/schemas/dpp-schema.json",
                types: [
                    "VerifiableCredential",
                    "VerifiableAttestation",
                    "DPPClaimSet"
                ],
                limitJurisdiction: "https://publications.europa.eu/resource/authority/atu/ESP"
            }
        ],
        economicActivity: "http://data.europa.eu/ux2/nace2.1/26"
    };

    const unsignedVc = {
        "@context": [
            "https://europa.eu/schemas/v-id/2020/v1",
            "https://www.w3.org/2018/credentials/v1"
        ],
        id: "https://example.edu/credentials/3732",
        type: [
            "VerifiableCredential",
            "VerifiableAttestation",
            "VerifiableAccreditationToAttest"
        ],
        issuer: issuerDid,
        credentialSubject: subject,
        credentialSchema: /*[ Commented due to misalignment of EBSI Legal Entity Schema with latest Attestation Schema */
        {
            type: "FullJsonSchemaValidator2021",
            id: legalEntitySchema
        }/*, 
            {
                type: "FullJsonSchemaValidator2021",
                id: accreditationSchema
            }
        ]*/,
        issuanceDate: Timestamp.nowUTC(),
        issued: Timestamp.nowUTC(),
        validFrom: Timestamp.nowUTC(),
        evidence: [
            {
                id: "https://europa.eu/tsr-vid/evidence/f2aeec97-fc0d-42bf-8ca7-0548192d4231",
                type: ["DocumentVerification"],
                verifier: "did:ebsi:2e81454f76775c687694ee6772a17796436768a30e289555",
                evidenceDocument: ["Passport"],
                subjectPresence: "Physical",
                documentPresence: ["Physical"]
            }
        ],
        credentialStatus: {
            id: "https://api-test.ebsi.eu/trusted-issuers-registry/v4/issuers/did:ebsi:zZeKyEJfUTGwajhNyNX928z/attributes/60ae46e4fe9adffe0bc83c5e5be825aafe6b5246676398cd1ac36b8999e088a8",
            type: "EbsiAccreditationEntry"
        },
        termsOfUse: {
            id: "https://api-test.ebsi.eu/trusted-issuers-registry/terms/of/use",
            type: "IssuanceCertificate"
        }
    };

    const privateKeyBytes = Converter.hexToBytes(privateKey);


    // Sign Credential.
    let signedVc;

    try {
        const options = new ProofOptions({
            purpose: ProofPurpose.assertionMethod(),
            created: Timestamp.nowUTC()
        });

        const iotaUrl = IotaDIDUrl.parse(`${issuerDid}${verMethod}`);

        const finalCred = Credential.fromJSON(unsignedVc);
        signedVc = issuerDocument.signCredential(finalCred, privateKeyBytes.slice(0, 32), iotaUrl, options);
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
