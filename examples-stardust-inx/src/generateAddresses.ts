import { FAUCET, NODE_ENDPOINT } from "./endpoint";
import { generateAddresses, requestFunds } from "./utilAddress";

async function run() {
    const { bech32Addresses } = await generateAddresses(NODE_ENDPOINT, 6);

    // The first address is funded
    await requestFunds(FAUCET, bech32Addresses[0]);
}

run().then(() => console.log("Done")).catch(err => console.error(err));

export { };
