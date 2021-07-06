import { IotaAnchoringChannel } from "@tangle.js/anchors";
import { IotaLdProofGenerator } from "../src/iotaLdProofGenerator";
import { IotaLdProofVerifier } from "../src/iotaLdProofVerifier";
import { IotaSigner } from "../src/iotaSigner";
import { IIotaLinkedDataProof } from "../src/models/IIotaLinkedDataProof";
import { IJsonAnchoredDocument } from "../src/models/IJsonAnchoredDocument";
import { IJsonDocument } from "../src/models/IJsonDocument";
import { SignatureTypes } from "../src/models/signatureTypes";
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
  let singleIotaLdProofJsonLd: IIotaLinkedDataProof;
  let chainIotaLdProofJsonLd: IIotaLinkedDataProof[];

  beforeAll(async () => {
    const signer = await IotaSigner.create(did, node);
    const channel = await IotaAnchoringChannel.bindNew({ node });
    const ldProofGenerator = IotaLdProofGenerator.create(channel, signer);
    singleIotaLdProof = await ldProofGenerator.generate(jsonDocument, {
      signatureType: SignatureTypes.JCS_ED25519_2020,
      verificationMethod: method,
      secret: privateKey,
      anchorageID: channel.firstAnchorageID
    });

    const channel3 = await IotaAnchoringChannel.bindNew({ node });
    const ldProofGenerator3 = IotaLdProofGenerator.create(channel3, signer);
    singleIotaLdProofJsonLd = await ldProofGenerator3.generate(jsonLdDocument1, {
      signatureType: SignatureTypes.ED25519_2018,
      verificationMethod: method,
      secret: privateKey,
      anchorageID: channel3.firstAnchorageID
    });

    const channel2 = await IotaAnchoringChannel.bindNew({ node });
    const ldProofGenerator2 = IotaLdProofGenerator.create(channel2, signer);
    chainIotaLdProofJsonLd = await ldProofGenerator2.generateChain(documentChain, {
      signatureType: SignatureTypes.ED25519_2018,
      verificationMethod: method,
      secret: privateKey,
      anchorageID: channel2.firstAnchorageID
    });
  });

  test("should verify a Linked Data Proof. JSON", async () => {
    const documentToVerify: IJsonAnchoredDocument = {
      ...jsonDocument,
      proof: singleIotaLdProof
    };

    const result = await IotaLdProofVerifier.verifyJson(documentToVerify, { node });
    expect(result).toBe(true);
  });

  test("should fail verification of a Linked Data Proof. JSON", async () => {
    const documentToVerify: IJsonAnchoredDocument = {
      ...JSON.parse(JSON.stringify(jsonDocument)),
      proof: singleIotaLdProof
    };

    // A change to the document to force verification fail
    documentToVerify.member2 = 1234;

    const result = await IotaLdProofVerifier.verifyJson(documentToVerify, { node });
    expect(result).toBe(false);
  });

  test("should fail verification of a document with not proof", async () => {
    const documentToVerify: IJsonAnchoredDocument = {
      ...JSON.parse(JSON.stringify(jsonDocument))
    };

    const result = await IotaLdProofVerifier.verifyJson(documentToVerify, { node });
    expect(result).toBe(false);
  });

  test("should fail verification of a Linked Data Proof. JSON-LD", async () => {
    const documentToVerify: IJsonAnchoredDocument = {
      ...JSON.parse(JSON.stringify(jsonLdDocument1)),
      proof: singleIotaLdProofJsonLd
    };

    // A change to the document to force verification fail
    documentToVerify.age = 45;

    const result = await IotaLdProofVerifier.verifyJson(documentToVerify, { node });
    expect(result).toBe(false);
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
    const result = await IotaLdProofVerifier.verifyJsonChain(documentsToVerify, { node, strict: true });
    expect(result).toBe(true);
  });

  test("should verify a chain of Linked Data Proofs. JSON-LD. 1 document", async () => {
    const documentsToVerify: IJsonAnchoredDocument[] = [
      {
        ...jsonLdDocument1,
        proof: chainIotaLdProofJsonLd[0]
      }
    ];
    const result = await IotaLdProofVerifier.verifyJsonChain(documentsToVerify, { node });
    expect(result).toBe(true);
  });

  test("should fail verification of a chain of Linked Data Proofs. JSON-LD. Integrity fail", async () => {
    const doc1 = JSON.parse(JSON.stringify(jsonLdDocument1));
    doc1.age = 45;

    const documentsToVerify: IJsonAnchoredDocument[] = [
      {
        ...doc1,
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
    const result = await IotaLdProofVerifier.verifyJsonChain(documentsToVerify);
    expect(result).toBe(false);
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
    const result = await IotaLdProofVerifier.verifyJsonChain(documentsToVerify);
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
    const result = await IotaLdProofVerifier.verifyJsonChain(documentsToVerify, { strict: false });
    expect(result).toBe(true);
  });

  test("should fail verification of a chain of Linked Data Proofs. Wrong Order. Non-Strict", async () => {
    const documentsToVerify: IJsonAnchoredDocument[] = [
      {
        ...jsonLdDocument3,
        proof: chainIotaLdProofJsonLd[2]
      },
      {
        ...jsonLdDocument1,
        proof: chainIotaLdProofJsonLd[0]
      }
    ];
    const result = await IotaLdProofVerifier.verifyJsonChain(documentsToVerify, { strict: false });
    expect(result).toBe(false);
  });

  test("should fail verification of a chain of Linked Data Proofs. Wrong Order. Strict", async () => {
    const documentsToVerify: IJsonAnchoredDocument[] = [
      {
        ...jsonLdDocument3,
        proof: chainIotaLdProofJsonLd[2]
      },
      {
        ...jsonLdDocument1,
        proof: chainIotaLdProofJsonLd[0]
      }
    ];
    const result = await IotaLdProofVerifier.verifyJsonChain(documentsToVerify);
    expect(result).toBe(false);
  });

  test("should fail verification of a chain of Linked Data Proofs. No proof", async () => {
    const documentsToVerify: IJsonAnchoredDocument[] = [
      {
        ...jsonLdDocument1,
        proof: chainIotaLdProofJsonLd[0]
      },
      {
        ...jsonLdDocument2,
        proof: undefined
      }
    ];
    const result = await IotaLdProofVerifier.verifyJsonChain(documentsToVerify);
    expect(result).toBe(false);
  });

  test("should verify a chain of Linked Data Proofs using an starting proof. JSON-LD", async () => {
    const documentsToVerify: IJsonDocument[] = [
      jsonLdDocument1,
      jsonLdDocument2
    ];
    const result = await IotaLdProofVerifier.verifyJsonChainSingleProof(documentsToVerify, chainIotaLdProofJsonLd[0]);
    expect(result).toBe(true);
  });

  test("should verify a chain of Linked Data Proofs using an starting proof. JSON-LD. Non-strict", async () => {
    const documentsToVerify: IJsonDocument[] = [
      jsonLdDocument1,
      jsonLdDocument3
    ];
    const result = await IotaLdProofVerifier.verifyJsonChainSingleProof(
      documentsToVerify,
      chainIotaLdProofJsonLd[0], {
      strict: false
    });
    expect(result).toBe(true);
  });

  test("should verify a chain of Linked Data Proofs using an starting proof. JSON-LD. 1 document", async () => {
    const documentsToVerify: IJsonDocument[] = [jsonLdDocument3];
    const result = await IotaLdProofVerifier.verifyJsonChainSingleProof(
      documentsToVerify,
      chainIotaLdProofJsonLd[2]
    );
    expect(result).toBe(true);
  });

  test("should fail same chain of Linked Data Proofs using an starting proof. JSON-LD. Strict", async () => {
    const documentsToVerify: IJsonDocument[] = [
      jsonLdDocument1,
      jsonLdDocument3
    ];
    const result = await IotaLdProofVerifier.verifyJsonChainSingleProof(
      documentsToVerify,
      chainIotaLdProofJsonLd[0], {
      strict: true
    });
    expect(result).toBe(false);
  });

  test("should fail chain of Linked Data Proofs using a wrong starting proof. JSON-LD. Strict", async () => {
    const documentsToVerify: IJsonDocument[] = [
      jsonLdDocument1,
      jsonLdDocument3
    ];
    const result = await IotaLdProofVerifier.verifyJsonChainSingleProof(
      documentsToVerify,
      chainIotaLdProofJsonLd[1], {
      strict: true
    });
    expect(result).toBe(false);
  });

  test("should fail chain of Linked Data Proofs using a wrong starting proof. JSON-LD. Non-strict", async () => {
    const documentsToVerify: IJsonDocument[] = [
      jsonLdDocument1,
      jsonLdDocument3
    ];
    const result = await IotaLdProofVerifier.verifyJsonChainSingleProof(
      documentsToVerify,
      chainIotaLdProofJsonLd[1], {
      strict: false
    });
    expect(result).toBe(false);
  });

  test("should fail verification on a chain of Linked Data Proofs using a starting proof. JSON-LD", async () => {
    const documentsToVerify: IJsonDocument[] = [
      jsonLdDocument1,
      jsonLdDocument3,
      jsonLdDocument2
    ];
    const result = await IotaLdProofVerifier.verifyJsonChainSingleProof(documentsToVerify, chainIotaLdProofJsonLd[0]);
    expect(result).toBe(false);
  });

  test(
  "should fail verification on a chain of Linked Data Proofs using a starting proof. JSON-LD. Non-strict", async () => {
      const documentsToVerify: IJsonDocument[] = [
        jsonLdDocument1,
        jsonLdDocument3,
        jsonLdDocument2
      ];
      const result = await IotaLdProofVerifier.verifyJsonChainSingleProof(
        documentsToVerify,
        chainIotaLdProofJsonLd[0], {
        strict: false
      });
      expect(result).toBe(false);
    });
});
