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
    "issuer": "did:iota:ebsi:0xb7c5d504cc1e8c6f2531c9e80e444f86319e5695568e9bd96d7c0e1b41eaa005",
    "issuanceDate": "2023-04-04T07:39:43Z",
    "proof": {
      "type": "JcsEd25519Signature2020",
      "verificationMethod": "did:iota:ebsi:0xb7c5d504cc1e8c6f2531c9e80e444f86319e5695568e9bd96d7c0e1b41eaa005#sign-1",
      "signatureValue": "5cFrmrdmekoKn23Sb2vLZkq3cNBxH1xRggeCuZNTTjFv9RhdSZnn6xgGPcB8uvkvxies8d7T9GVPQEgTLwMg7Abx"
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
