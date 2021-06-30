const { IotaSigner, IotaVerifier } = require("@tangle.js/ld-proofs");

/**
 
   DID used

{
  did: 'did:iota:HeNzaWXCT6jTsshy9gyXCz9242NgZtMrbW1EC66iXZNP',
  keys: {
    public: '6vRR8c2ceLbThT4acvNZj7rS9mL6g6dwu3SWFmV15KSJ',
    private: '8XghdzhFGWrferW8v1PwpV86gtHKALKzxhGKSi4vGs3R'
  },
  transactionUrl: 'https://explorer.iota.org/mainnet/message/ed5cf851662d052b6a8fdfbaa11bb058df738faf066b72eee723631f345f419f'
}

 */

// Example on how to use the anchors library
async function main() {
    const myDID = "did:iota:HeNzaWXCT6jTsshy9gyXCz9242NgZtMrbW1EC66iXZNP";

    const signer = await IotaSigner.create(myDID);

    const document = {
        "@context": "https://schema.org",
        "id": "http://example.org/car-tracker/bd91402c-d9b9-11eb-b8bc-0242ac130003",
        "type": "Vehicle",
        "speed": {
            "type": "QuantitativeValue",
            "value": 50.2,
            "unitCode": "KMH"
        },
        "dateUpdated": new Date().toISOString()
    };

    console.log("Signing ...");
    console.log(document);

    const ldSignature = await signer.signJsonLd(document, {
      verificationMethod: "key",
      secret: "8XghdzhFGWrferW8v1PwpV86gtHKALKzxhGKSi4vGs3R",
      signatureType: "Ed25519Signature2018"
    });
    console.log("Linked Data Signature: ");
    console.log(ldSignature);

    console.log("Verifying ...");
    const signedDoc = {
      ...document,
      proof: ldSignature
    };
    const result = await IotaVerifier.verifyJsonLd(signedDoc, {});
    
    console.log("Verified: ", result);
}

main()
  .then(() => {})
  .catch((err) => console.log(err));
