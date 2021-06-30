import LdProofErrorNames from "../src/errors/ldProofErrorNames";
import { IotaSigner } from "../src/iotaSigner";
import { IotaVerifier } from "../src/iotaVerifier";
import { IJsonSignedDocument } from "../src/models/IJsonSignedDocument";
import { ILinkedDataSignature } from "../src/models/ILinkedDataSignature";
import { IVerificationOptions } from "../src/models/IVerificationOptions";
import { SignatureTypes } from "../src/models/signatureTypes";
import { did, privateKey } from "./testCommon";

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

  const method = "key";

  const verificationMethod = `${did}#${method}`;
  let signatureValue: string;

  let jsonProof: ILinkedDataSignature;
  let jsonLdProof: ILinkedDataSignature;

  beforeAll(async () => {
    const signer = await IotaSigner.create(did, node);

    signatureValue = (await signer.sign(Buffer.from(message), {
      verificationMethod: method,
      secret: privateKey
    })).signatureValue;

    jsonProof = await signer.signJson(jsonDocument, {
      verificationMethod: method,
      secret: privateKey,
      signatureType: SignatureTypes.JCS_ED25519_2020
    });

    jsonLdProof = await signer.signJsonLd(jsonLdDocument, {
      verificationMethod: method,
      secret: privateKey,
      signatureType: SignatureTypes.ED25519_2018
    });
  });

  test("should verify a plain message", async () => {
    const options: IVerificationOptions = {
      signatureType: SignatureTypes.PLAIN_ED25519,
      verificationMethod,
      node
    };

    const result = await IotaVerifier.verify(Buffer.from(message), signatureValue, options);

    expect(result).toBe(true);
  });

  test("should fail verification. message integrity not respected", async () => {
    const options: IVerificationOptions = {
      signatureType: SignatureTypes.ED25519_2018,
      verificationMethod,
      node
    };

    const result = await IotaVerifier.verify(Buffer.from(`${message}ab`), signatureValue, options);

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

    const docToVerify: IJsonSignedDocument = {
      ...jsonToVerify,
      proof: jsonProof
    };

    const result = await IotaVerifier.verifyJson(docToVerify, { node });

    expect(result).toBe(true);
  });

  test("should fail verification JSON document. integrity not respected", async () => {
    const jsonToVerify = {
      ...jsonDocument,
      "member4": "abcde"
    };

    const signedDoc = {
      ...jsonToVerify,
      proof: jsonProof
    };

    const result = await IotaVerifier.verifyJson(signedDoc, { node });

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

    const signedDoc = {
      ...jsonLdToVerify,
      proof: jsonLdProof
    };

    const result = await IotaVerifier.verifyJsonLd(signedDoc, { node });

    expect(result).toBe(true);
  });

  test("should fail verification JSON-LD document. integrity not respected", async () => {
    const jsonLdToVerify = {
      ...jsonLdDocument,
      "email": "contact@iota.org"
    };

    const signedDoc = {
      ...jsonLdToVerify,
      proof: jsonLdProof
    };

    const result = await IotaVerifier.verifyJsonLd(signedDoc, { node });

    expect(result).toBe(false);
  });

  test("should fail verification. signature is corrupted", async () => {
    const options: IVerificationOptions = {
      signatureType: SignatureTypes.PLAIN_ED25519,
      verificationMethod,
      node
    };

    const result = await IotaVerifier.verify(Buffer.from(message), `x${signatureValue.slice(1)}`, options);

    expect(result).toBe(false);
  });

  test("should fail verification. Identity is not the correct one", async () => {
    const options: IVerificationOptions = {
      signatureType: SignatureTypes.PLAIN_ED25519,
      verificationMethod: "did:iota:B8y9H4tagyLhzGRP5EyHd3basposcCYCHvhVS5H9ScW1#key",
      node
    };

    const result = await IotaVerifier.verify(Buffer.from(message), signatureValue, options);

    expect(result).toBe(false);
  });

  // Skipped until we generate a DID with multiple verification methods
  test.skip("should fail verification. Method is not the correct one", async () => {
    const options: IVerificationOptions = {
      signatureType: SignatureTypes.PLAIN_ED25519,
      verificationMethod: `${did}#key2`,
      node
    };

    const result = await IotaVerifier.verify(Buffer.from(message), signatureValue, options);

    expect(result).toBe(false);
  });

  test("should throw exception if node address is wrong", async () => {
    const options: IVerificationOptions = {
      signatureType: SignatureTypes.PLAIN_ED25519,
      verificationMethod,
      node: "xyz"
    };

    try {
      await IotaVerifier.verify(Buffer.from(message), signatureValue, options);
    } catch (error) {
      expect(error.name).toBe(LdProofErrorNames.INVALID_NODE);
      return;
    }

    fail("Exception not thrown");
  });


  test("should throw exception if DID syntax is wrong", async () => {
    const options: IVerificationOptions = {
      signatureType: SignatureTypes.PLAIN_ED25519,
      verificationMethod: "did:9999",
      node
    };

    try {
      await IotaVerifier.verify(Buffer.from(message), signatureValue, options);
    } catch (error) {
      expect(error.name).toBe(LdProofErrorNames.INVALID_DID);
      return;
    }

    fail("Exception not thrown");
  });


  test("should throw exception if DID does not exist", async () => {
    const options: IVerificationOptions = {
      signatureType: SignatureTypes.PLAIN_ED25519,
      verificationMethod: `${did}a#key`,
      node
    };

    try {
      await IotaVerifier.verify(Buffer.from(message), signatureValue, options);
    } catch (error) {
      expect(error.name).toBe(LdProofErrorNames.DID_NOT_FOUND);
      return;
    }

    fail("Exception not thrown");
  });

  test("should throw exception if method does not exist on the DID", async () => {
    const options: IVerificationOptions = {
      signatureType: SignatureTypes.PLAIN_ED25519,
      verificationMethod: `${did}#key6789`,
      node
    };

    try {
      await IotaVerifier.verify(Buffer.from(message), signatureValue, options);
    } catch (error) {
      expect(error.name).toBe(LdProofErrorNames.DID_NOT_FOUND);
      return;
    }

    fail("Exception not thrown");
  });
});
