import { JWK, JWT } from "ts-jose";

async function run() {
    const key: JWK = await JWK.generate("ES256", {
        kid: "test-ebsi",
        use: "sig",
        // crv: string, some algorithms need to add curve - EdDSA
        // modulusLength: number, some algorithms need to add length - RSA
    });

    console.log("Private Key: ");
    console.log(JSON.stringify(key.toObject(true)));
    console.log();

    console.log("Public Key: ");
    console.log(JSON.stringify(key.toObject(false)));


    const credential = JSON.parse(process.argv[2]);
    // delete credential["proof"];

    const result = await JWT.sign({
        vc: credential
    }, key, {});

    console.log();
    console.log(result);
    console.log();

    const verified = await JWT.verify(result, key);

    console.log(verified);
}

run()
    .then(() => console.log("Done"))
    .catch(err => console.error(err));
