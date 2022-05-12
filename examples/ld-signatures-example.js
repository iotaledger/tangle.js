import { LdProofs, IotaSigner, IotaVerifier, SignatureTypes } from "@tangle-js/ld-proofs";

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
    await LdProofs.initialize();

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

    const document2 = {
      "@context": [
        "https://gs1.github.io/EPCIS/epcis-context.jsonld"
       ],
      "eventID": "ni:///sha-256;df7bb3c352fef055578554f09f5e2aa41782150ced7bd0b8af24dd3ccb30ba69?ver=CBV2.0",
      "type": "ObjectEvent",
      "action": "OBSERVE",
      "bizStep": "shipping",
      "disposition": "in_transit",
      "epcList": ["urn:epc:id:sgtin:0614141.107346.2017","urn:epc:id:sgtin:0614141.107346.2018"],
      "eventTime": "2005-04-03T20:33:31.116000-06:00",
      "eventTimeZoneOffset": "-06:00",
      "readPoint": {"id": "urn:epc:id:sgln:0614141.07346.1234"},
      "bizTransactionList": [  {"type": "po", "bizTransaction": "http://transaction.acme.com/po/12345678" }  ]
      };

    console.log("Signing ...");
    console.log(document);

    const ldSignature = await signer.signJson(document2, {
      signatureType: SignatureTypes.ED25519_2018,
      verificationMethod: "key",
      secret: "8XghdzhFGWrferW8v1PwpV86gtHKALKzxhGKSi4vGs3R",
      signatureType: "Ed25519Signature2018"
    });
    console.log("Linked Data Signature: ");
    console.log(ldSignature);

    console.log("Verifying ...");
    const signedDoc = {
      ...document2,
      proof: ldSignature
    };
    const result = await IotaVerifier.verifyJson(signedDoc);
    
    console.log("Verified: ", result);
}

main()
  .then(() => {})
  .catch((err) => console.log(err));
