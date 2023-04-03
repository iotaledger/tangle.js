const NODE_ENDPOINT = "http://52.213.240.168:14265";
const PLUGIN_ENDPOINT = `${NODE_ENDPOINT}/api/ext/v1/identities`;

import { get } from "./util";

const did = "did:iota:tst:0x95541f9cce48c5c417f5ee62df7734d25231879bf1c789cd70d02c95a502c4c8";

async function run() {
    const didContent = await get(`${PLUGIN_ENDPOINT}/${did}`);

    console.log(didContent);
}

run().then(() => console.log("Done")).catch(err => console.error(err));

export {};
