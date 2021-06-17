import AnchoringChannelErrorNames from "../src/errors/anchoringChannelErrorNames";
import IotaSigner from "../src/iotaSigner";

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

describe("Sign messages", () => {
  const node = "https://chrysalis-nodes.iota.org";

  const message = "Hello";

  const did = "did:iota:2pu42SstXrg7uMEGHS5qkBDEJ1hrbrYtWQReMUvkCrDP";
  const method = "key";

  const privateKey = "CcpYJYpyYi2uaGNZnuJpfN75RL1Y9HDqfDtvfufW7XME";

  test("should sign a message", async () => {
    const signer = await IotaSigner.create(node, did);

    const proof = await signer.sign(message, method, privateKey);

    expect(proof.created).toBeDefined();
    expect(proof.verificationMethod).toBe(`${did}#${method}`);
    expect(proof.signatureValue).toBeDefined();
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


  test("should throw exception if private key is wrong", async () => {
    try {
      const signer = await IotaSigner.create(node, did);
      await signer.sign(message, method, "389393939");
    } catch (error) {
      expect(error.name).toBe(AnchoringChannelErrorNames.INVALID_SIGNING_KEY);
      return;
    }

    fail("Exception not thrown");
  });


  test("should throw exception if method does not exist on the DID", async () => {
    try {
      const signer = await IotaSigner.create(node, did);
      await signer.sign(message, "notfoundmethod", privateKey);
    } catch (error) {
      expect(error.name).toBe(AnchoringChannelErrorNames.DID_NOT_FOUND);
      return;
    }

    fail("Exception not thrown");
  });
});
