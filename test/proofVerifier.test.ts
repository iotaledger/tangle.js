// import AnchoringChannelErrorNames from "../src/errors/anchoringChannelErrorNames";
import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";
import { IotaProofGenerator } from "../src/iotaProofGenerator";
import { IotaProofVerifier } from "../src/iotaProofVerifier";
import { IotaSigner } from "../src/iotaSigner";
import { IIotaLinkedDataProof } from "../src/models/IIotaLinkedDataProof";
import { IJsonAnchoredDocument } from "../src/models/IJsonAnchoredDocument";

/*

{
  did: 'did:iota:EmsBSiBR7kjuYPLMHmZnyzmZY7t985t5BBsvK3Dbiw3d',
  keys: {
    public: 'DbKSCHm16ekaGpGEeaNToNUMX9WvwL4SH3ngziuYRqrz',
    private: 'TEBVMPPX91ZhtBZ8R8zBP6WZpVeAnrWMnknkSHThmYk'
  },
  transactionUrl:
  'https://explorer.iota.org/mainnet/message/470d3f43af2467169f4ff199f04e3d6ff84c1107fa9d1f340988b6e02a4a6b85'
}

*/

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
    age: 22,
    dateCreated: "2020-06-27T12:00:00Z"
  };

  const jsonLdDocument2 = {
    "@context": "https://schema.org",
    type: "Person",
    age: 23,
    dateCreated: "2021-06-27T12:00:00Z"
  };

  const documentChain = [
    jsonLdDocument1,
    jsonLdDocument2
  ];

  const did = "did:iota:EmsBSiBR7kjuYPLMHmZnyzmZY7t985t5BBsvK3Dbiw3d";
  const method = "key";

  let singleIotaLdProof: IIotaLinkedDataProof;
  let chainIotaLdProofJsonLd: IIotaLinkedDataProof[];

  beforeAll(async () => {
    // Needed to generate the LD Proofs over the documents that later will be verified
    const privateKey = "TEBVMPPX91ZhtBZ8R8zBP6WZpVeAnrWMnknkSHThmYk";

    const signer = await IotaSigner.create(node, did);
    const channel = await IotaAnchoringChannel.create(node).bind();
    const ldProofGenerator = new IotaProofGenerator(channel, signer);

    singleIotaLdProof = await ldProofGenerator.generate(jsonDocument, method,
      privateKey, channel.firstAnchorageID);

    const channel2 = await IotaAnchoringChannel.create(node).bind();
    const ldProofGenerator2 = new IotaProofGenerator(channel2, signer);

    chainIotaLdProofJsonLd = await ldProofGenerator2.generateChainLd(documentChain, method,
      privateKey, channel2.firstAnchorageID);
  });

  test("should verify a single Linked Data Proof. JSON", async () => {
    const documentToVerify: IJsonAnchoredDocument = {
      ...jsonDocument,
      proof: singleIotaLdProof
    };

    const result = await IotaProofVerifier.verifyJson(documentToVerify, node);
    expect(result).toBe(true);
  });

  test("should verify a chain of Linked Data Proofs. JSON-LD", async () => {
    const documentsToVerify: IJsonAnchoredDocument[] = [
      {
        ...jsonLdDocument1,
        proof: chainIotaLdProofJsonLd[0]
      },
      {
        ...jsonLdDocument2,
        proof: chainIotaLdProofJsonLd[1]
      }
    ];
    const result = await IotaProofVerifier.verifyJsonLdChain(documentsToVerify, node);
    expect(result).toBe(true);
  });
});
