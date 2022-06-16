import { IotaSigner, IotaLdProofGenerator, IotaLdProofVerifier, SignatureTypes } from "@tangle-js/ld-proofs";
import { IotaAnchoringChannel } from "@tangle-js/anchors";

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

// Example on how to create LD Proofs anchored to the Tangle
export default async function main() {
    const myDID = "did:iota:4sQE2rDL578awq4mzhVU47cLSax2pGDdtHvCP8fXBRgf";

    console.log("Creating a signer with DID", myDID);
    const signer = await IotaSigner.create(myDID);

    console.log("Creating and binding an anchoring channel ...");
    const anchoringChannel = await IotaAnchoringChannel.bindNew();
    console.log(anchoringChannel.channelID);

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

    console.log("Anchoring to the Tangle ...");
    console.log(document);

    const ldProofGenerator = IotaLdProofGenerator.create(anchoringChannel,signer);

    const ldProof = await ldProofGenerator.generate(document, {
      signatureType: SignatureTypes.ED25519_2018,
      verificationMethod: "dv-0",
      secret: "EnGTu7jYTapWn84Z9iiVjnzJaF3fc1x5JptPb3bcVhx1",
      anchorageID: anchoringChannel.firstAnchorageID
    });
    console.log("Linked Data Proof: ");
    console.log(ldProof);

    console.log("Verifying ...");
    const anchoredDoc = {
      ...document,
      proof: ldProof
    };
    const result = await IotaLdProofVerifier.verifyJson(anchoredDoc);
    
    console.log("Verified: ", result); 
}
