import { IotaAnchoringChannel } from "@tangle.js/anchors";
import { IotaLdProofGenerator } from "../src/iotaLdProofGenerator";
import { IotaLdProofVerifier } from "../src/iotaLdProofVerifier";
import { IotaSigner } from "../src/iotaSigner";
import { IIotaLinkedDataProof } from "../src/models/IIotaLinkedDataProof";
import { IJsonAnchoredDocument } from "../src/models/IJsonAnchoredDocument";
import { IJsonDocument } from "../src/models/IJsonDocument";
import { did, privateKey } from "./testCommon";

describe("Verify IOTA Linked Data Proofs", () => {
  const node = "https://chrysalis-nodes.iota.org";

  const jsonDocument = {
    "member1": {
      "member11": "value 11"
    },
    "member2": 56789,
    "member3": [false, true]
  };

  const jsonLdDocument1 = {
    "@context": "https://schema.org",
    type: "Person",
    age: 21,
    dateCreated: "2019-06-27T12:00:00Z"
  };

  const jsonLdDocument2 = {
    "@context": "https://schema.org",
    type: "Person",
    age: 23,
    dateCreated: "2020-06-27T12:00:00Z"
  };

  const jsonLdDocument3 = {
    "@context": "https://schema.org",
    type: "Person",
    age: 24,
    dateCreated: "2021-06-27T12:00:00Z"
  };


  const documentChain = [
    jsonLdDocument1,
    jsonLdDocument2,
    jsonLdDocument3
  ];

  const method = "key";

  let singleIotaLdProof: IIotaLinkedDataProof;
  let chainIotaLdProofJsonLd: IIotaLinkedDataProof[];

  beforeAll(async () => {
    const signer = await IotaSigner.create(did, node);
    const channel = await IotaAnchoringChannel.create(undefined, node).bind();
    const ldProofGenerator = new IotaLdProofGenerator(channel, signer);

    singleIotaLdProof = await ldProofGenerator.generate(jsonDocument, {
      verificationMethod: method,
      secret: privateKey,
      anchorageID: channel.firstAnchorageID
    });

    const channel2 = await IotaAnchoringChannel.create(undefined, node).bind();
    const ldProofGenerator2 = new IotaLdProofGenerator(channel2, signer);

    chainIotaLdProofJsonLd = await ldProofGenerator2.generateChainLd(documentChain, {
      verificationMethod: method,
      secret: privateKey,
      anchorageID: channel2.firstAnchorageID
    });
  });

  test("should verify a single Linked Data Proof. JSON", async () => {
    const documentToVerify: IJsonAnchoredDocument = {
      ...jsonDocument,
      proof: singleIotaLdProof
    };

    const result = await IotaLdProofVerifier.verifyJson(documentToVerify, { node });
    expect(result).toBe(true);
  });

  test("should verify a chain of Linked Data Proofs. JSON-LD. Strict", async () => {
    const documentsToVerify: IJsonAnchoredDocument[] = [
      {
        ...jsonLdDocument1,
        proof: chainIotaLdProofJsonLd[0]
      },
      {
        ...jsonLdDocument2,
        proof: chainIotaLdProofJsonLd[1]
      },
      {
        ...jsonLdDocument3,
        proof: chainIotaLdProofJsonLd[2]
      }
    ];
    const result = await IotaLdProofVerifier.verifyJsonLdChain(documentsToVerify, { node, strict: true });
    expect(result).toBe(true);
  });

  test("should fail verification of a chain of Linked Data Proofs. JSON-LD. Strict", async () => {
    const documentsToVerify: IJsonAnchoredDocument[] = [
      {
        ...jsonLdDocument1,
        proof: chainIotaLdProofJsonLd[0]
      },
      {
        ...jsonLdDocument3,
        proof: chainIotaLdProofJsonLd[2]
      }
    ];
    const result = await IotaLdProofVerifier.verifyJsonLdChain(documentsToVerify, { node, strict: true });
    expect(result).toBe(false);
  });

  test("should verify of a chain of Linked Data Proofs. JSON-LD. Non-Strict", async () => {
    const documentsToVerify: IJsonAnchoredDocument[] = [
      {
        ...jsonLdDocument1,
        proof: chainIotaLdProofJsonLd[0]
      },
      {
        ...jsonLdDocument3,
        proof: chainIotaLdProofJsonLd[2]
      }
    ];
    const result = await IotaLdProofVerifier.verifyJsonLdChain(documentsToVerify, { node, strict: false });
    expect(result).toBe(true);
  });

  test("should verify of a chain of Linked Data Proofs using an starting proof. JSON-LD", async () => {
    const documentsToVerify: IJsonDocument[] = [
     jsonLdDocument1,
     jsonLdDocument2
    ];
    const result = await IotaLdProofVerifier.verifyJsonLdChainSingleProof(documentsToVerify, chainIotaLdProofJsonLd[0]);
    expect(result).toBe(true);
  });
});
