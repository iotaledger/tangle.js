import { IotaAnchoringChannel } from "@tangle-js/anchors";
import LdProofErrorNames from "../src/errors/ldProofErrorNames";
import { IotaLdProofGenerator } from "../src/iotaLdProofGenerator";
import { IotaSigner } from "../src/iotaSigner";
import type { IIotaLinkedDataProof } from "../src/models/IIotaLinkedDataProof";
import { LinkedDataProofTypes } from "../src/models/linkedDataProofTypes";
import { SignatureTypes } from "../src/models/signatureTypes";
import { did, privateKey } from "./testCommon";

/**
 * Asserts a linked data proof
 * @param proof The proof
 * @param proofType The expected type of proof
 * @param sdid DID The expected DID
 * @param method Verification method
 *
 */
function assertProof(proof: IIotaLinkedDataProof, proofType: string, sdid: string, method: string) {
    expect(proof.created).toBeDefined();
    expect(proof.verificationMethod).toBe(`${sdid}`);
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
    expect(proof.proofValue.msgID).toBeDefined();
    expect(proof.proofValue.msgIDL1).toBeDefined();
}

describe("Generate IOTA Linked Data Proofs", () => {
    const node = "https://chrysalis-nodes.iota.org";

    const method = "key";

    beforeAll(async () => { });

    test("should generate a Linked Data Proof for a JSON-LD document", async () => {
        const document = {
            "@context": "https://schema.org",
            type: "Organization",
            name: "IOTA Foundation"
        };

        // Channel that will be used
        const channel = await IotaAnchoringChannel.bindNew({ node });
        // Signer that will be used
        const signer = await IotaSigner.create(did, node);

        const generator = IotaLdProofGenerator.create(channel, signer);

        const proof = await generator.generate(document, {
            signatureType: SignatureTypes.ED25519_2018,
            verificationMethod: method,
            secret: privateKey,
            anchorageID: channel.firstAnchorageID
        });

        assertProof(proof, LinkedDataProofTypes.IOTA_LD_PROOF_2021, did, method);
        assertProofValue(proof, channel.channelID, channel.firstAnchorageID);
    });

    test("should generate a Linked Data Proof for a JSON document", async () => {
        const document = {
            property1: "value1",
            property2: false
        };

        // Channel that will be used
        const channel = await IotaAnchoringChannel.bindNew({ node });
        // Signer that will be used
        const signer = await IotaSigner.create(did, node);

        const generator = IotaLdProofGenerator.create(channel, signer);

        // We test passing the document as a string
        const proof = await generator.generate(JSON.stringify(document), {
            signatureType: SignatureTypes.JCS_ED25519_2020,
            verificationMethod: method,
            secret: privateKey,
            anchorageID: channel.firstAnchorageID
        });

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
        const channel = await IotaAnchoringChannel.bindNew({ node });
        // Signer that will be used
        const signer = await IotaSigner.create(did, node);

        const generator = IotaLdProofGenerator.create(channel, signer);

        const proofs = await generator.generateChain([document1, document2], {
            signatureType: SignatureTypes.ED25519_2018,
            verificationMethod: method,
            secret: privateKey,
            anchorageID: channel.firstAnchorageID
        });

        expect(proofs.length).toBe(2);

        for (const proof of proofs) {
            assertProof(proof, LinkedDataProofTypes.IOTA_LD_PROOF_2021, did, method);
        }
        assertProofValue(proofs[0], channel.channelID, channel.firstAnchorageID);

        // Ensure both were anchored to the same channel ID
        expect(proofs[0].proofValue.channelID).toBe(proofs[1].proofValue.channelID);
    });

    test("should fail generation of a Linked Data Proof for a plain JSON document as 'Ed255192018'", async () => {
        const document = {
            type: "Organization",
            name: "IOTA Foundation"
        };

        // Channel that will be used
        const channel = await IotaAnchoringChannel.bindNew({ node });
        // Signer that will be used
        const signer = await IotaSigner.create(did, node);

        const generator = IotaLdProofGenerator.create(channel, signer);

        try {
            await generator.generate(document, {
                signatureType: SignatureTypes.ED25519_2018,
                verificationMethod: method,
                secret: privateKey,
                anchorageID: channel.firstAnchorageID
            });
        } catch (error) {
            expect(error.name).toBe(LdProofErrorNames.INVALID_DATA_TYPE);
            return;
        }

        fail("Exception not thrown");
    });
});
