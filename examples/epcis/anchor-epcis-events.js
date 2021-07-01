const { IotaAnchoringChannel } = require("@tangle.js/anchors");
const { IotaSigner, IotaLdProofGenerator, IotaLdProofVerifier } = require("@tangle.js/ld-proofs");

const { document } = require("./events.js");

/*
{
    did: 'did:iota:yUxEqDGgL2WF4sQq2TEzdmDjDkRsHKL5TcLWrdAjmb4',
    keys: {
      public: 'FsR8WLswahkDbdtvHH9jqUGwPXtZEgxdvn1thVaKhgC5',
      private: 'GxFKbdCAbaLfQcca6jrdfi9LCkngpDNKbBJb9wev1Yvm'
    },
    transactionUrl: 'https://explorer.iota.org/mainnet/message/6911b0f4831efc3e54ee5ddf2e9cb392a2fffbcb653aa5ad3c3baf46fd0bddfb'
  }
*/

async function main() {
  anchorEPCISDocument(document);
}

// Anchor an EPCIS Document to Tangle
async function anchorEPCISDocument(epcisDocument) {
  const events = epcisDocument.getEventList();

  // Prepare the list of events
  const eventList = [];
  for (const event of events) {
    const eventObj = event.toObject();
    console.log("Event: ", eventObj);

    // We need the @context to proceed with JSON-LD-aware signing
    eventObj["@context"] = document.getContext();

    eventList.push(eventObj);
  }

  console.log("Preparing channel, signer and LD Proof generator ...");
  const anchoringChannel = await IotaAnchoringChannel.create().bind();
  const did = "did:iota:yUxEqDGgL2WF4sQq2TEzdmDjDkRsHKL5TcLWrdAjmb4";
  const signer = await IotaSigner.create(did);
  const ldProofGenerator = IotaLdProofGenerator.create(anchoringChannel, signer);
  
  console.log("Generating LD Proofs on the Tangle ...");
  const proofs =  await ldProofGenerator.generateChainLd(eventList, {
    anchorageID: anchoringChannel.firstAnchorageID,
    verificationMethod: "key",
    secret: "GxFKbdCAbaLfQcca6jrdfi9LCkngpDNKbBJb9wev1Yvm"
  });

   console.log("Event Chain Linked Data Proofs: ", proofs);

   // eventList[0]["eventTime"] = new Date().toISOString();

   console.log("Verifying events ...");
   const result = await IotaLdProofVerifier.verifyJsonLdChain([
       {
        ...eventList[0],
        proof: proofs[0]
       },
       {
        ...eventList[1],
        proof: proofs[1]
       }
   ]);

   console.log("Verification Result: ", result);
}

main()
  .then(() => {})
  .catch((err) => {
    console.log(err);
  });
