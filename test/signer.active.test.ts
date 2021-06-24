import AnchoringChannelErrorNames from "../src/errors/anchoringChannelErrorNames";
import { IotaSigner } from "../src/iotaSigner";
import { ILinkedDataSignature } from "../src/models/ILinkedDataSignature";
import { SignatureTypes } from "../src/models/signatureTypes";

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
 * Asserts a signature
 * @param signature Signature
 * @param signatureType The type of signature
 * @param did DID
 * @param method Verification method
 */
function assertSignature(signature: ILinkedDataSignature, signatureType: string, did: string, method: string) {
  expect(signature.created).toBeDefined();
  expect(signature.verificationMethod).toBe(`${did}#${method}`);
  expect(signature.type).toBe(signatureType);
  expect(signature.proofValue.length).toBeGreaterThan(80);
}


describe("Sign messages", () => {
  const node = "https://chrysalis-nodes.iota.org";

  const message = "Hello";

  const did = "did:iota:EmsBSiBR7kjuYPLMHmZnyzmZY7t985t5BBsvK3Dbiw3d";
  const method = "key";

  const privateKey = "TEBVMPPX91ZhtBZ8R8zBP6WZpVeAnrWMnknkSHThmYk";

  test("should sign a message", async () => {
    const signer = await IotaSigner.create(node, did);

    const signature = await signer.sign(Buffer.from(message), method, privateKey);

    expect(signature.created).toBeDefined();
    expect(signature.verificationMethod).toBe(`${did}#${method}`);
    expect(signature.signatureValue).toBeDefined();
  });

  test("should sign a plain JSON document", async () => {
    const signer = await IotaSigner.create(node, did);

    const jsonDocument = {
      "member1": {
        "member11": "value 11"
      },
      "member2": 56789,
      "member3": [false, true]
    };

    const signature = await signer.signJson(jsonDocument, method, privateKey);

    console.log(signature);

    assertSignature(signature, SignatureTypes.JCS_ED25519_2020, did, method);
  });

  test("should sign a JSON-LD document. Schema.org @context", async () => {
    const signer = await IotaSigner.create(node, did);

    const jsonLdDocument = {
      "@context": "https://schema.org",
      type: "Organization",
      name: "IOTA Foundation"
    };

    const signature = await signer.signJsonLd(jsonLdDocument, method, privateKey);

    assertSignature(signature, SignatureTypes.ED25519_2018, did, method);
  });

  test("should sign a JSON-LD document. EPCIS @context", async () => {
    const signer = await IotaSigner.create(node, did);

    const jsonLdDocument = {
      "@context": [
        "https://gs1.github.io/EPCIS/epcis-context.jsonld",
        { "example": "http://ns.example.com/epcis/" }
      ],
      isA: "ObjectEvent",
      eventTime: "2013-06-08T14:58:56.591Z",
      eventTimeZoneOffset: "+02:00",
      action: "OBSERVE",
      bizStep: "receiving",
      disposition: "in_progress",
      readPoint: { id: "urn:epc:id:sgln:0614141.00777.0" },

      "example:myField": "Example of a vendor/user extension"
    };

    const signature = await signer.signJsonLd(jsonLdDocument, method, privateKey);

    assertSignature(signature, SignatureTypes.ED25519_2018, did, method);
  });

  test("should throw exception if node address is wrong", async () => {
    try {
      await IotaSigner.create("abced", did);
    } catch (error) {
      expect(error.name).toBe(AnchoringChannelErrorNames.INVALID_NODE);
      return;
    }

    fail("Exception not thrown");
  });


  test("should throw exception if DID syntax is wrong", async () => {
    try {
      await IotaSigner.create(node, "did:999");
    } catch (error) {
      expect(error.name).toBe(AnchoringChannelErrorNames.INVALID_DID);
      return;
    }

    fail("Exception not thrown");
  });


  test("should throw exception if DID does not exist", async () => {
    try {
      await IotaSigner.create(node, `${did}a`);
    } catch (error) {
      expect(error.name).toBe(AnchoringChannelErrorNames.DID_NOT_FOUND);
      return;
    }

    fail("Exception not thrown");
  });


  test("should throw exception if private key has not the proper length", async () => {
    try {
      const signer = await IotaSigner.create(node, did);

      await signer.sign(Buffer.from(message), method, "389393939");
    } catch (error) {
      expect(error.name).toBe(AnchoringChannelErrorNames.INVALID_SIGNING_KEY);
      return;
    }

    fail("Exception not thrown");
  });

  test("should throw exception if private key is not really known", async () => {
    try {
      const signer = await IotaSigner.create(node, did);

      await signer.sign(Buffer.from(message), method, "H9TTFqrUVHnZk1nNv1B8zBWyg9bxJCZrCCVEcBLbNSV5");
    } catch (error) {
      expect(error.name).toBe(AnchoringChannelErrorNames.INVALID_SIGNING_KEY);
      return;
    }

    fail("Exception not thrown");
  });

  test("should throw exception if method does not exist on the DID", async () => {
    try {
      const signer = await IotaSigner.create(node, did);

      await signer.sign(Buffer.from(message), "notfoundmethod", privateKey);
    } catch (error) {
      expect(error.name).toBe(AnchoringChannelErrorNames.INVALID_DID_METHOD);
      return;
    }

    fail("Exception not thrown");
  });
});

