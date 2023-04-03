import { Bip39, Bip32Path } from "@iota/crypto.js";
import {
    Bech32Helper,
    Ed25519Address,
    Ed25519Seed,
    ED25519_ADDRESS_TYPE,
    generateBip44Address,
    SingleNodeClient,
} from "@iota/iota.js";
import { Converter } from "@iota/util.js";


export async function generateAddresses(endpoint: string):
    Promise<{ publicKeys: Uint8Array[], privateKeys: Uint8Array[], bech32Addresses: string[] }> {

    const publicKeys: Uint8Array[] = [];
    const privateKeys: Uint8Array[] = [];

    const bech32Addresses: string[] = [];

    const client = new SingleNodeClient(endpoint);
    const clientInfo = await client.info();
    const bech32Hrp = clientInfo.protocol.bech32Hrp;

    const randomMnemonic = Bip39.randomMnemonic();
    console.log("\tMnemonic:", randomMnemonic);
    const baseSeed = Ed25519Seed.fromMnemonic(randomMnemonic);

    console.log();
    console.log("Generated Addresses using Bip44 Format");
    const addressGeneratorAccountState = {
        accountIndex: 0,
        addressIndex: 0,
        isInternal: false
    };

    for (let i = 0; i < 2; i++) {
        const path = generateBip44Address(addressGeneratorAccountState);

        console.log(`Address Index ${path}`);

        const addressSeed = baseSeed.generateSeedFromPath(new Bip32Path(path));
        const addressKeyPair = addressSeed.keyPair();

        publicKeys[i] = addressKeyPair.publicKey;
        privateKeys[i] = addressKeyPair.privateKey;

        console.log("\tPrivate Key", Converter.bytesToHex(addressKeyPair.privateKey, true));
        console.log("\tPublic Key", Converter.bytesToHex(addressKeyPair.publicKey, true));

        const indexEd25519Address = new Ed25519Address(addressKeyPair.publicKey);
        // Converting into bytes
        const indexPublicKeyAddress = indexEd25519Address.toAddress();
        console.log("\tAddress Ed25519", Converter.bytesToHex(indexPublicKeyAddress, true));
        bech32Addresses[i] = Bech32Helper.toBech32(ED25519_ADDRESS_TYPE, indexPublicKeyAddress, bech32Hrp);

        console.log("\tAddress Bech32", bech32Addresses[i]);
        console.log();
    }

    return { privateKeys, publicKeys, bech32Addresses };
}
