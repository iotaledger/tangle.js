import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import { JWK } from "ts-jose";
const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

import { Converter } from "@iota/util.js";

async function run() {
    // Now the JWK is generated and its public key just copied to the DID and the Private Key printed to stdout
    const key: JWK = await JWK.generate("ES256", {
        // At this point in time we don't know the full Kid as we don't know the DID
        // This could be done in two steps, one generating an empty DID and then adding the Ver Method through
        // an update operation
        use: "sig",
        // crv: string, some algorithms need to add curve - EdDSA
        // modulusLength: number, some algorithms need to add length - RSA
    });

    const keyThumbprint = await key.getThumbprint();

    const publicKey = key.toObject(false);
    publicKey.kid = keyThumbprint;

    console.log("Public Key: ");
    console.log(JSON.stringify(publicKey, undefined, 2));
    console.log();

    const privateKey = key.toObject(true);
    privateKey.kid = keyThumbprint;
   
    console.log("Private Key: ");
    console.log(JSON.stringify(privateKey, undefined, 2));
    console.log();

    const privateKeyRaw = Buffer.from(privateKey.d, "base64");
    console.log("Raw signing key: ", Converter.bytesToHex(privateKeyRaw, true));
}
   
export { };

run().then(() => console.log("Done")).catch(err => console.error(err));
