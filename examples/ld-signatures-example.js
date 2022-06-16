import { IotaSigner, IotaVerifier, SignatureTypes } from "@tangle-js/ld-proofs";

/**
 
   DID used

{
  did: 'did:iota:4sQE2rDL578awq4mzhVU47cLSax2pGDdtHvCP8fXBRgf',
  keys: {
    'sign-0': {
      public: '25Y6Kykfytd3wqdKAucZ7JSMKqtU3VPm2HQHSU8r1d8X',
      private: 'Bg7qw6PXEAyw9dQKCaPMUVC6cbKm1nAkYqXwK7LnnVgp'
    },
    'dv-0': {
      public: 'BQsz1sYqQDXMN2WdpFJpxMbPSDmriabDhJ8PSyPF2Xi6',
      private: 'EnGTu7jYTapWn84Z9iiVjnzJaF3fc1x5JptPb3bcVhx1'
    }
  },
  transactionUrl: 'https://explorer.iota.org/mainnet/message/f58d2fb23165f836f5ef9f5bcd86e41002db7a96c87ebab63584b15d50c6b302'
}

 */

// Example on how to use the anchors library
export default async function main() {
    const myDID = "did:iota:4sQE2rDL578awq4mzhVU47cLSax2pGDdtHvCP8fXBRgf";

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
      verificationMethod: "dv-0",
      secret: "EnGTu7jYTapWn84Z9iiVjnzJaF3fc1x5JptPb3bcVhx1",
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
