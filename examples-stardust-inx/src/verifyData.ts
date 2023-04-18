import { post } from "./utilHttp";

import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { PLUGIN_ENDPOINT, TOKEN } = process.env;


const signedData = {
    "name": "IOTA Foundation",
    "type": "Organization",
    "proof": {
        "type": "JcsEd25519Signature2020",
        "verificationMethod": "did:iota:tst:0xcaa521e19b04f3c75dcc6aa927b666f6947aa56d5a71011aa9e29165d4b41be4#sign-1",
        "signatureValue": "5Qm6DcC1NBfNawpc9PGp6Sb2VV1HukJphZ5BerUz4xujrK9qZqpo9oGFJkSCz6YTpf6X8wP714PHiYk9cnrKzaXn"
    }
};

async function run() {
    const verificationResult = await post(`${PLUGIN_ENDPOINT}/data`, TOKEN, {
        type: "IntegrityVerificationRequest",
        data: signedData
    });

    console.log(verificationResult);
}

run().then(() => console.log("Done")).catch(err => console.error(err));

export { };
