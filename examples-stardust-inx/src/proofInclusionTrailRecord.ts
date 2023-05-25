import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import { generateAddresses } from "./utilAddress";
import { addTrailRecord, createTrail } from "./trailOperations";
import { Converter } from "@iota/util.js";
import { get, post, sleep } from "./utilHttp";

const theEnv = dotenv.config();
dotenvExpand.expand(theEnv);

const { NODE_ENDPOINT, PLUGIN_ENDPOINT, TOKEN } = process.env;

const trailRecord0 = {
    record: {
        proof: "1234"
    },
    immutable: {
        "sub": "A45678"
    }
}

async function run() {
    const endpointDetails = { url: PLUGIN_ENDPOINT, token: TOKEN };

    // first addresses are generated
    const { bech32Addresses, privateKeys, publicKeys } = await generateAddresses(NODE_ENDPOINT, TOKEN, 1);

    // then a trail created

    const result = await createTrail(endpointDetails, trailRecord0, bech32Addresses[0]);

    const trailID = result.trail["id"];

    const trailRecord1 = {
        record: {
            proof: "6789"
        }
    };

    console.log("Waiting for confirmation. Trail Creation ...");
    await sleep(10000);

    const publicKey = Converter.bytesToHex(publicKeys[0], true);
    const privateKey = Converter.bytesToHex(privateKeys[0], true);

    // then another record added
    await addTrailRecord(endpointDetails, trailID, trailRecord1, { publicKey, privateKey });

    const trailRecord2 = {
        record: {
            proof: "00000"
        }
    };

    console.log("Waiting for confirmation. Trail Record addition ...");
    await sleep(10000);

    // then another record added
    await addTrailRecord(endpointDetails, trailID, trailRecord2, { publicKey, privateKey });

    console.log("Waiting for confirmation. Trail Record addition ...");
    await sleep(10000);

    // then Proof of Inclusion of Record #1
    const resource = `${PLUGIN_ENDPOINT}/trails/${trailID}/inclusion`;
    const pluginRequest = {
        type: "TrailRecordInclusion",
        action: "Prove",
        query: {
            stateIndex: 1,
            record: trailRecord1
        }
    };

    const inclusionResult = await post(resource, TOKEN, pluginRequest);
    const inclResultObj = inclusionResult as {inclusionProofed: boolean; proof: { href: "string"}};

    console.log("Inclusion Result: \n", inclusionResult);

    if (!inclResultObj.inclusionProofed) {
        console.error("Error inclusion not proofed!!!");
        return;
    }

    const poiURL = PLUGIN_ENDPOINT + inclResultObj.proof.href;
    console.log("Retrieving POI from: ", poiURL);
    // Now retrieving the POI
    const poi = await get(poiURL, TOKEN);

    console.log("Proof of Inclusion retrieved ... Validating against standard PoI plugin");

    const verificationEndpoint = NODE_ENDPOINT + "/api/poi/v1/validate";

    const verResult = await post(verificationEndpoint, TOKEN, poi);

    console.log("Validation result: ", verResult);
}

run().then(() => console.log("Done")).catch(err => console.error(err));

export { };
