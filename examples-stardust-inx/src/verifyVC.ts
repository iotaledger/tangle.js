import { PLUGIN_ENDPOINT, TOKEN } from "./endpoint";
import { post } from "./utilHttp";

const credential = {
    "@context": "https://www.w3.org/2018/credentials/v1",
    "id": "https://example.edu/credentials/3732",
    "type": [
        "VerifiableCredential",
        "UniversityDegreeCredential"
    ],
    "credentialSubject": {
        "id": "did:iota:tst:0x6abe6ef35e4dfd4242f932d6fbe1b1ae01b87a1b42a49329141602a9222980de",
        "GPA": "4.0",
        "degreeName": "Bachelor of Science and Arts",
        "degreeType": "BachelorDegree",
        "name": "Alice"
    },
    "issuer": "did:iota:ebsi:0x9244145be500bcc71c1d4d29c895ef06cff5eb6c055eebe23208206b223cdb72",
    "issuanceDate": "2023-04-04T08:25:59Z",
    "proof": {
        "type": "JcsEd25519Signature2020",
        "verificationMethod": "did:iota:ebsi:0x9244145be500bcc71c1d4d29c895ef06cff5eb6c055eebe23208206b223cdb72#sign-1",
        "signatureValue": "4KuuzAEB2EVPDU3H9LfL2awNgxE74XHaxdqs4AwdUz6ashXxe1KQQNuBXwiuxPWSkhyEnrapF9eKGgyVkn7CV8RG"
    }
};

async function run() {
    const verificationResult = await post(`${PLUGIN_ENDPOINT}/credentials`, TOKEN, {
        type: "VerificationRequest",
        credential
    });

    console.log(verificationResult);
}

run().then(() => console.log("Done")).catch(err => console.error(err));

export { };
