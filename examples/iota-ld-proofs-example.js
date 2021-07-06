const { IotaSigner, IotaLdProofGenerator, IotaLdProofVerifier, SignatureTypes } = require("@tangle.js/ld-proofs");
const { IotaAnchoringChannel } = require("@tangle.js/anchors");

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

// Example on how to create LD Proofs anchored to the Tangle
async function main() {
    const myDID = "did:iota:HeNzaWXCT6jTsshy9gyXCz9242NgZtMrbW1EC66iXZNP";

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
      verificationMethod: "key",
      secret: "8XghdzhFGWrferW8v1PwpV86gtHKALKzxhGKSi4vGs3R",
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

main()
  .then(() => {})
  .catch((err) => console.log(err));
