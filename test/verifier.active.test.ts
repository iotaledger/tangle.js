// import AnchoringChannelErrorNames from "../src/errors/anchoringChannelErrorNames";
import AnchoringChannelErrorNames from "../src/errors/anchoringChannelErrorNames";
import IotaSigner from "../src/iotaSigner";
import IotaVerifier from "../src/iotaVerifier";
import { IVerificationRequest } from "../src/models/IVerificationRequest";


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

  const did = "did:iota:2pu42SstXrg7uMEGHS5qkBDEJ1hrbrYtWQReMUvkCrDP";
  const method = "key";
  const privateKey = "CcpYJYpyYi2uaGNZnuJpfN75RL1Y9HDqfDtvfufW7XME";

  const verificationMethod = `${did}#${method}`;
  let signatureValue: string;
  let signatureValueSha512: string;

  beforeAll(async () => {
    const signer = await IotaSigner.create(node, did);

    signatureValue = (await signer.sign(message, method, privateKey)).signatureValue;
    signatureValueSha512 = (await signer.sign(message, method, privateKey, "sha512")).signatureValue;
  });

  test("should verify a message - sha256", async () => {
    const request: IVerificationRequest = {
      message,
      signatureValue,
      verificationMethod,
      hashAlgorithm: "sha256",
      node
    };

    const result = await IotaVerifier.verify(request);

    expect(result).toBe(true);
  });


  test("should verify a message - sha512", async () => {
    const request: IVerificationRequest = {
      message,
      signatureValue: signatureValueSha512,
      verificationMethod,
      hashAlgorithm: "sha512",
      node
    };

    const result = await IotaVerifier.verify(request);

    expect(result).toBe(true);
  });

  test("should fail verification. signature does not correspond to the hash algorithm", async () => {
    const request: IVerificationRequest = {
      message,
      signatureValue: signatureValueSha512,
      verificationMethod,
      hashAlgorithm: "sha256",
      node
    };

    const result = await IotaVerifier.verify(request);

    expect(result).toBe(false);
  });

  test("should fail verification. signature is corrupted", async () => {
    const request: IVerificationRequest = {
      message,
      signatureValue: `x${signatureValue.slice(1)}`,
      verificationMethod,
      hashAlgorithm: "sha256",
      node
    };

    const result = await IotaVerifier.verify(request);

    expect(result).toBe(false);
  });

  test("should fail verification. Identity is not the correct one", async () => {
    const request: IVerificationRequest = {
      message,
      signatureValue,
      verificationMethod: "did:iota:B8y9H4tagyLhzGRP5EyHd3basposcCYCHvhVS5H9ScW1#key",
      hashAlgorithm: "sha256",
      node
    };

    const result = await IotaVerifier.verify(request);

    expect(result).toBe(false);
  });

  // Skipped until we generate a DID with multiple verification methods
  test.skip("should fail verification. Method is not the correct one", async () => {
    const request: IVerificationRequest = {
      message,
      signatureValue,
      verificationMethod: `${did}#key2`,
      hashAlgorithm: "sha256",
      node
    };

    const result = await IotaVerifier.verify(request);

    expect(result).toBe(false);
  });

  test("should throw exception if node address is wrong", async () => {
    const request: IVerificationRequest = {
      message,
      signatureValue,
      verificationMethod,
      hashAlgorithm: "sha256",
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
      message,
      signatureValue,
      verificationMethod: "did:9999",
      hashAlgorithm: "sha256",
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
      message,
      signatureValue,
      verificationMethod: `${did}a#key`,
      hashAlgorithm: "sha256",
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
      message,
      signatureValue,
      verificationMethod: `${did}#key6789`,
      hashAlgorithm: "sha256",
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
