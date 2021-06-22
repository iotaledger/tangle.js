// import AnchoringChannelErrorNames from "../src/errors/anchoringChannelErrorNames";
import AnchoringChannelErrorNames from "../src/errors/anchoringChannelErrorNames";
import { IotaSigner } from "../src/iotaSigner";
import { IotaVerifier } from "../src/iotaVerifier";
import { IJsonVerificationRequest } from "../src/models/IJsonVerificationRequest";
import { ILinkedDataSignature } from "../src/models/ILinkedDataSignature";
import { IVerificationRequest } from "../src/models/IVerificationRequest";
import { SignatureTypes } from "../src/models/signatureTypes";


/*

{
  did: 'did:iota:2pu42SstXrg7uMEGHS5qkBDEJ1hrbrYtWQReMUvkCrDP',
  keys: {
    public: 'H9TTFqrUVHnZk1nNv1B8zBWyg9bxJCZrCCVEcBLbNSV5',
    private: 'CcpYJYpyYi2uaGNZnuJpfN75RL1Y9HDqfDtvfufW7XME'
  },
  transactionUrl:
  'https://explorer.iota.org/mainnet/message/d770d6f7e0236167bb6aebf212cac9d641981f7feb419b0caa9e5ef26743b9de'
}

*/

describe("Verify messages", () => {
  const node = "https://chrysalis-nodes.iota.org";

  const message = "Hello";

  const jsonDocument = {
    "member1": {
      "member11": "value 11"
    },
    "member2": 56789,
    "member3": [false, true]
  };

  const jsonLdDocument = {
    "@context": "https://schema.org",
    "type": "Organization",
    "name": "IOTA Foundation"
  };

  const did = "did:iota:2pu42SstXrg7uMEGHS5qkBDEJ1hrbrYtWQReMUvkCrDP";
  const method = "key";
  const privateKey = "CcpYJYpyYi2uaGNZnuJpfN75RL1Y9HDqfDtvfufW7XME";

  const verificationMethod = `${did}#${method}`;
  let signatureValue: string;

  let jsonProof: ILinkedDataSignature;
  let jsonLdProof: ILinkedDataSignature;

  beforeAll(async () => {
    const signer = await IotaSigner.create(node, did);

    signatureValue = (await signer.sign(Buffer.from(message), method, privateKey)).signatureValue;

    jsonProof = await signer.signJson(jsonDocument, method, privateKey);

    jsonLdProof = await signer.signJsonLd(jsonLdDocument, method, privateKey);
  });

  test("should verify a message", async () => {
    const request: IVerificationRequest = {
      type: SignatureTypes.ED25519_2018,
      message: Buffer.from(message),
      signatureValue,
      verificationMethod,
      node
    };

    const result = await IotaVerifier.verify(request);

    expect(result).toBe(true);
  });

  test("should fail verification. message integrity not respected", async () => {
    const request: IVerificationRequest = {
      type: SignatureTypes.ED25519_2018,
      message: Buffer.from(`${message}ab`),
      signatureValue,
      verificationMethod,
      node
    };

    const result = await IotaVerifier.verify(request);

    expect(result).toBe(false);
  });

  test("should verify a JSON document", async () => {
    const jsonToVerify = {
      "member1": {
        "member11": "value 11"
      },
      "member3": [false, true],
      "member2": 56789
    };
    const request: IJsonVerificationRequest = {
      document: {
        ...jsonToVerify,
        proof: jsonProof
      },
      node
    };

    const result = await IotaVerifier.verifyJson(request);

    expect(result).toBe(true);
  });

  test("should fail verification JSON document. integrity not respected", async () => {
    const jsonToVerify = {
      ...jsonDocument,
      "member4": "abcde"
    };
    const request: IJsonVerificationRequest = {
      document: {
        ...jsonToVerify,
        proof: jsonProof
      },
      node
    };

    const result = await IotaVerifier.verifyJson(request);

    expect(result).toBe(false);
  });


  test("should verify a JSON-LD document", async () => {
    const jsonLdToVerify = {
      "@context": {
        "tipo": "@type",
        "Organizacion": "http://schema.org/Organization",
        "nombre": "http://schema.org/name"
      },
      "tipo": "Organizacion",
      "nombre": "IOTA Foundation"
    };

    const request: IJsonVerificationRequest = {
      document: {
        ...jsonLdToVerify,
        proof: jsonLdProof
      },
      node
    };

    const result = await IotaVerifier.verifyJsonLd(request);

    expect(result).toBe(true);
  });

  test("should fail verification JSON-LD document. integrity not respected", async () => {
    const jsonLdToVerify = {
      ...jsonLdDocument,
      "email": "contact@iota.org"
    };
    const request: IJsonVerificationRequest = {
      document: {
        ...jsonLdToVerify,
        proof: jsonLdProof
      },
      node
    };

    const result = await IotaVerifier.verifyJsonLd(request);

    expect(result).toBe(false);
  });

  test("should fail verification. signature is corrupted", async () => {
    const request: IVerificationRequest = {
      type: SignatureTypes.ED25519_2018,
      message: Buffer.from(message),
      signatureValue: `x${signatureValue.slice(1)}`,
      verificationMethod,
      node
    };

    const result = await IotaVerifier.verify(request);

    expect(result).toBe(false);
  });

  test("should fail verification. Identity is not the correct one", async () => {
    const request: IVerificationRequest = {
      type: SignatureTypes.ED25519_2018,
      message: Buffer.from(message),
      signatureValue,
      verificationMethod: "did:iota:B8y9H4tagyLhzGRP5EyHd3basposcCYCHvhVS5H9ScW1#key",
      node
    };

    const result = await IotaVerifier.verify(request);

    expect(result).toBe(false);
  });

  // Skipped until we generate a DID with multiple verification methods
  test.skip("should fail verification. Method is not the correct one", async () => {
    const request: IVerificationRequest = {
      type: SignatureTypes.ED25519_2018,
      message: Buffer.from(message),
      signatureValue,
      verificationMethod: `${did}#key2`,
      node
    };

    const result = await IotaVerifier.verify(request);

    expect(result).toBe(false);
  });

  test("should throw exception if node address is wrong", async () => {
    const request: IVerificationRequest = {
      type: SignatureTypes.ED25519_2018,
      message: Buffer.from(message),
      signatureValue,
      verificationMethod,
      node: "xyz"
    };

    try {
      await IotaVerifier.verify(request);
    } catch (error) {
      expect(error.name).toBe(AnchoringChannelErrorNames.INVALID_NODE);
      return;
    }

    fail("Exception not thrown");
  });


  test("should throw exception if DID syntax is wrong", async () => {
    const request: IVerificationRequest = {
      type: SignatureTypes.ED25519_2018,
      message: Buffer.from(message),
      signatureValue,
      verificationMethod: "did:9999",
      node
    };

    try {
      await IotaVerifier.verify(request);
    } catch (error) {
      expect(error.name).toBe(AnchoringChannelErrorNames.INVALID_DID);
      return;
    }

    fail("Exception not thrown");
  });


  test("should throw exception if DID does not exist", async () => {
    const request: IVerificationRequest = {
      type: SignatureTypes.ED25519_2018,
      message: Buffer.from(message),
      signatureValue,
      verificationMethod: `${did}a#key`,
      node
    };

    try {
      await IotaVerifier.verify(request);
    } catch (error) {
      expect(error.name).toBe(AnchoringChannelErrorNames.DID_NOT_FOUND);
      return;
    }

    fail("Exception not thrown");
  });

  test("should throw exception if method does not exist on the DID", async () => {
    const request: IVerificationRequest = {
      type: SignatureTypes.ED25519_2018,
      message: Buffer.from(message),
      signatureValue,
      verificationMethod: `${did}#key6789`,
      node
    };

    try {
      await IotaVerifier.verify(request);
    } catch (error) {
      expect(error.name).toBe(AnchoringChannelErrorNames.DID_NOT_FOUND);
      return;
    }

    fail("Exception not thrown");
  });
});
