import LdProofErrorNames from "../src/errors/ldProofErrorNames";
import { IotaSigner } from "../src/iotaSigner";
import type { ILinkedDataSignature } from "../src/models/ILinkedDataSignature";
import { SignatureTypes } from "../src/models/signatureTypes";
import { did, privateKey } from "./testCommon";


/**
 * Asserts a signature
 * @param signature Signature
 * @param signatureType The type of signature
 * @param sdid DID
 * @param method Verification method
 */
function assertSignature(signature: ILinkedDataSignature, signatureType: string, sdid: string, method: string) {
  expect(signature.created).toBeDefined();
  expect(signature.verificationMethod).toBe(`${sdid}#${method}`);
  expect(signature.type).toBe(signatureType);
  expect(signature.proofValue.length).toBeGreaterThan(80);
}


describe("Sign messages", () => {
  const node = "https://chrysalis-nodes.iota.org";

  const message = "Hello";

  const method = "dv-0";

  beforeAll(async () => { });

  test("should sign a message", async () => {
    const signer = await IotaSigner.create(did, node);

    const signature = await signer.sign(Buffer.from(message), {
      verificationMethod: method,
      secret: privateKey,
      signatureType: SignatureTypes.PLAIN_ED25519
    });

    expect(signature.created).toBeDefined();
    expect(signature.verificationMethod).toBe(`${did}#${method}`);
    expect(signature.signatureValue).toBeDefined();
  });

  test("should sign a plain JSON document", async () => {
    const signer = await IotaSigner.create(did, node);

    const jsonDocument = {
      "member1": {
        "member11": "value 11"
      },
      "member2": 56789,
      "member3": [false, true]
    };

    const signature = await signer.signJson(jsonDocument, {
      verificationMethod: method,
      secret: privateKey,
      signatureType: SignatureTypes.JCS_ED25519_2020
    });

    assertSignature(signature, SignatureTypes.JCS_ED25519_2020, did, method);
  });

  test("should sign a JSON-LD document. Schema.org @context", async () => {
    const signer = await IotaSigner.create(did, node);

    const jsonLdDocument = {
      "@context": "https://schema.org",
      type: "Organization",
      name: "IOTA Foundation"
    };

    const signature = await signer.signJson(jsonLdDocument, {
      verificationMethod: method,
      secret: privateKey,
      signatureType: SignatureTypes.ED25519_2018
    });

    assertSignature(signature, SignatureTypes.ED25519_2018, did, method);
  });

  test("should sign a JSON-LD document. EPCIS @context", async () => {
    const signer = await IotaSigner.create(did, node);

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

    const signature = await signer.signJson(jsonLdDocument, {
      verificationMethod: method,
      secret: privateKey,
      signatureType: SignatureTypes.ED25519_2018
    });

    assertSignature(signature, SignatureTypes.ED25519_2018, did, method);
  });

  test("should throw exception if trying to sign plain JSON with 'Ed255192018'", async () => {
    const signer = await IotaSigner.create(did, node);

    const jsonDocument = {
      type: "Organization",
      name: "IOTA Foundation"
    };

    try {
      await signer.signJson(jsonDocument, {
        verificationMethod: method,
        secret: privateKey,
        signatureType: SignatureTypes.ED25519_2018
      });
    } catch (error) {
      expect(error.name).toBe(LdProofErrorNames.INVALID_DATA_TYPE);
      return;
    }

    fail("Exception not thrown");
  });

  test("should throw exception if node address is wrong", async () => {
    try {
      await IotaSigner.create(did, "abced");
    } catch (error) {
      expect(error.name).toBe(LdProofErrorNames.INVALID_NODE);
      return;
    }

    fail("Exception not thrown");
  });


  test("should throw exception if DID syntax is wrong", async () => {
    try {
      await IotaSigner.create("did:999", node);
    } catch (error) {
      expect(error.name).toBe(LdProofErrorNames.INVALID_DID);
      return;
    }

    fail("Exception not thrown");
  });


  test("should throw exception if DID does not exist", async () => {
    try {
      await IotaSigner.create(`${did}a`, node);
    } catch (error) {
      expect(error.name).toBe(LdProofErrorNames.DID_NOT_FOUND);
      return;
    }

    fail("Exception not thrown");
  });


  test("should throw exception if private key has not the proper length", async () => {
    try {
      const signer = await IotaSigner.create(did, node);

      await signer.sign(Buffer.from(message), {
        signatureType: SignatureTypes.PLAIN_ED25519,
        verificationMethod: method,
        secret: "389393939"
      });
    } catch (error) {
      expect(error.name).toBe(LdProofErrorNames.INVALID_SIGNING_KEY);
      return;
    }

    fail("Exception not thrown");
  });

  test("should throw exception if private key is not really known", async () => {
    try {
      const signer = await IotaSigner.create(did, node);

      await signer.sign(Buffer.from(message), {
        signatureType: SignatureTypes.PLAIN_ED25519,
        verificationMethod: method,
        secret: "H9TTFqrUVHnZk1nNv1B8zBWyg9bxJCZrCCVEcBLbNSV5"
      });
    } catch (error) {
      expect(error.name).toBe(LdProofErrorNames.INVALID_SIGNING_KEY);
      return;
    }

    fail("Exception not thrown");
  });

  test("should throw exception if method does not exist on the DID", async () => {
    try {
      const signer = await IotaSigner.create(did, node);

      await signer.sign(Buffer.from(message), {
        signatureType: SignatureTypes.PLAIN_ED25519,
        verificationMethod: "notfoundmethod",
        secret: privateKey
      });
    } catch (error) {
      expect(error.name).toBe(LdProofErrorNames.INVALID_DID_METHOD);
      return;
    }

    fail("Exception not thrown");
  });
});
