import { IotaAnchoringChannel } from "@tangle-js/anchors";
import {
  IotaSigner,
  IotaLdProofGenerator,
  IotaLdProofVerifier,
  SignatureTypes,
} from "@tangle-js/ld-proofs";

/** 

  DID used:

  {
  did: 'did:iota:DN4YmCtjMLMQaBsYB98VwsWWGkrjGFKbZej2xSptk7VM',
  keys: {
    'sign-0': {
      public: 'AKv6ZqWUDMHWpe89EDMRwUit2Nf167SJed7ErYBoTwX',
      private: '6NxdH69gdTjK9yfn848i1ygmd6JvoRMiSJL2tq3qzkyf'
    },
    'dv-0': {
      public: '4EXMKRQuFrV8Nc1VAy4NUiPjGfDwC5R1kyYpgL1FnSSE',
      private: '4ZNFBsaLqwGCGampUj2bV5L8LUzEca2zuLzrQAbningY'
    }
  },
  transactionUrl: 'https://explorer.iota.org/mainnet/message/9be512beb50e7a07f3499afd8d785daedbafc80afcaab663e4689d89f23873c8'
}

*/

// Anchor an EPCIS Document to Tangle
export default async function anchorEPCISDocument(epcisDocument) {
  const events = epcisDocument.getEventList();

  // Prepare the list of events
  const eventList = [];
  for (const event of events) {
    const eventObj = event.toObject();
    console.log("Event: ", eventObj);

    // We need the @context to proceed with JSON-LD-aware signing
    eventObj["@context"] = epcisDocument.getContext();

    eventList.push(eventObj);
  }

  console.log("Preparing channel, signer and LD Proof generator ...");
  const anchoringChannel = await IotaAnchoringChannel.bindNew();
  const did = "did:iota:DN4YmCtjMLMQaBsYB98VwsWWGkrjGFKbZej2xSptk7VM";
  const signer = await IotaSigner.create(did);
  const ldProofGenerator = IotaLdProofGenerator.create(
    anchoringChannel,
    signer
  );

  console.log("Generating LD Proofs on the Tangle ...");
  const proofs = await ldProofGenerator.generateChain(eventList, {
    signatureType: SignatureTypes.ED25519_2018,
    anchorageID: anchoringChannel.firstAnchorageID,
    verificationMethod: "dv-0",
    secret: "4ZNFBsaLqwGCGampUj2bV5L8LUzEca2zuLzrQAbningY",
  });

  console.log("Event Chain Linked Data Proofs: ", proofs);

  // eventList[0]["eventTime"] = new Date().toISOString();

  console.log("Verifying events ...");
  const result = await IotaLdProofVerifier.verifyJsonChain([
    {
      ...eventList[0],
      proof: proofs[0],
    },
    {
      ...eventList[1],
      proof: proofs[1],
    },
  ]);

  console.log("Verification Result: ", result);
}
