import { IotaAnchoringChannel } from "@tangle-js/anchors";
import {
  IotaSigner,
  IotaLdProofGenerator,
  IotaLdProofVerifier,
  SignatureTypes,
} from "@tangle-js/ld-proofs";

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
  const did = "did:iota:yUxEqDGgL2WF4sQq2TEzdmDjDkRsHKL5TcLWrdAjmb4";
  const signer = await IotaSigner.create(did);
  const ldProofGenerator = IotaLdProofGenerator.create(
    anchoringChannel,
    signer
  );

  console.log("Generating LD Proofs on the Tangle ...");
  const proofs = await ldProofGenerator.generateChain(eventList, {
    signatureType: SignatureTypes.ED25519_2018,
    anchorageID: anchoringChannel.firstAnchorageID,
    verificationMethod: "key",
    secret: "GxFKbdCAbaLfQcca6jrdfi9LCkngpDNKbBJb9wev1Yvm",
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
