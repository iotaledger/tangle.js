import { IotaSigner, IotaLdProofGenerator, IotaLdProofVerifier, SignatureTypes } from "@tangle-js/ld-proofs";
import { IotaAnchoringChannel } from "@tangle-js/anchors";

window.onload = async () => {
  console.log("On load");

  // handle test on click event
  document.querySelector("#test-ld-proofs").addEventListener("click", () => testIt());
};

async function testIt() {
  const myDID = "did:iota:92HAGCCy5NRTzf86Fta6dNC3z8fKDhXcXktKtWHMreXH";

  console.log("Creating a signer with DID", myDID);
  const signer = await IotaSigner.create(myDID);

  console.log("Creating and binding an anchoring channel ...");
  const anchoringChannel = await IotaAnchoringChannel.bindNew();
  console.log(anchoringChannel.channelID);

  const document = {
    "@context": "https://schema.org",
    id: "http://example.org/car-tracker/bd91402c-d9b9-11eb-b8bc-0242ac130003",
    type: "Vehicle",
    speed: {
      type: "QuantitativeValue",
      value: 50.2,
      unitCode: "KMH"
    },
    dateUpdated: new Date().toISOString()
  };

  console.log("Anchoring to the Tangle ...");
  console.log(document);

  const ldProofGenerator = IotaLdProofGenerator.create(
    anchoringChannel,
    signer
  );

  console.log("Ld proof generator created");

  const ldProof = await ldProofGenerator.generate(document, {
    signatureType: SignatureTypes.ED25519_2018,
    verificationMethod: "dv-0",
    secret: "4erRoPQVj6S644FMRMNGtpSixSyXqAxeCz33rGxr3xvL",
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
