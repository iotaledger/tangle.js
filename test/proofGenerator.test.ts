import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";
import { IotaProofGenerator } from "../src/iotaProofGenerator";
import { IotaSigner } from "../src/iotaSigner";
import { IIotaLinkedDataProof } from "../src/models/IIotaLinkedDataProof";
import { LinkedDataProofTypes } from "../src/models/linkedDataProofTypes";

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

/**
 * Asserts a linked data proof
 * @param proof The proof
 * @param proofType The expected type of proof
 * @param did DID The expected DID
 * @param method Verification method
 *
 */
function assertProof(proof: IIotaLinkedDataProof, proofType: string, did: string, method: string) {
    expect(proof.created).toBeDefined();
    expect(proof.verificationMethod).toBe(`${did}`);
    expect(proof.type).toBe(proofType);
}

/**
 * Asserts the value of an IOTA Linked Data Proof
 *
 * @param proof The proof
 * @param channelID The expected channelID in the proof value
 * @param anchorageID The expected anchorageID in the proof value
 *
 */
function assertProofValue(proof: IIotaLinkedDataProof, channelID: string, anchorageID: string) {
    expect(proof.proofValue).toBeDefined();
    expect(proof.proofValue.channelID).toBe(channelID);
    expect(proof.proofValue.anchorageID).toBe(anchorageID);
}

describe("Generate IOTA Linked Data Proofs", () => {
    const node = "https://chrysalis-nodes.iota.org";

    const did = "did:iota:EmsBSiBR7kjuYPLMHmZnyzmZY7t985t5BBsvK3Dbiw3d";
    const method = "key";

    const privateKey = "TEBVMPPX91ZhtBZ8R8zBP6WZpVeAnrWMnknkSHThmYk";

    test("should generate a Linked Data Proof for a JSON-LD document", async () => {
        const document = {
            "@context": "https://schema.org",
            type: "Organization",
            name: "IOTA Foundation"
        };

        // Channel that will be used
        const channel = await IotaAnchoringChannel.create(node).bind();
        // Signer that will be used
        const signer = await IotaSigner.create(node, did);

        const generator = new IotaProofGenerator(channel, signer);

        const proof = await generator.generateLd(document, method,
            privateKey,
            channel.firstAnchorageID);

        assertProof(proof, LinkedDataProofTypes.IOTA_LD_PROOF_2021, did, method);
        assertProofValue(proof, channel.channelID, channel.firstAnchorageID);
    });

    test("should generate a Linked Data Proof for a JSON document", async () => {
        const document = {
            property1: "value1",
            property2: false
        };

        // Channel that will be used
        const channel = await IotaAnchoringChannel.create(node).bind();
        // Signer that will be used
        const signer = await IotaSigner.create(node, did);

        const generator = new IotaProofGenerator(channel, signer);

        // We test passing the document as a string
        const proof = await generator.generate(JSON.stringify(document), method,
            privateKey,
            channel.firstAnchorageID);

        assertProof(proof, LinkedDataProofTypes.IOTA_LD_PROOF_2021, did, method);
        assertProofValue(proof, channel.channelID, channel.firstAnchorageID);
    });

    test("should generate a chain of Linked Data Proof for a sequence of JSON-LD Documents", async () => {
        const document1 = {
            "@context": "https://schema.org",
            type: "Person",
            age: 22,
            dateCreated: "2020-06-27T12:00:00Z"
        };

        const document2 = {
            "@context": "https://schema.org",
            type: "Person",
            age: 23,
            dateCreated: "2021-06-27T12:00:00Z"
        };

        // Channel that will be used
        const channel = await IotaAnchoringChannel.create(node).bind();
        // Signer that will be used
        const signer = await IotaSigner.create(node, did);

        const generator = new IotaProofGenerator(channel, signer);

        const proofs = await generator.generateChainLd([document1, document2],
            method,
            privateKey,
            channel.firstAnchorageID);

        expect(proofs.length).toBe(2);

        for (const proof of proofs) {
            assertProof(proof, LinkedDataProofTypes.IOTA_LD_PROOF_2021, did, method);
        }
        assertProofValue(proofs[0], channel.channelID, channel.firstAnchorageID);

        // Ensure both were anchored to the same channel ID
        expect(proofs[0].proofValue.channelID).toBe(proofs[1].proofValue.channelID);
    });
});
