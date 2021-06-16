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
  const message = "Hello";

  test("should sign a message", async () => {
    const signer = await IotaSigner.create("http://network.example.org",
      "did:iota:2pu42SstXrg7uMEGHS5qkBDEJ1hrbrYtWQReMUvkCrDP");

      const response = await signer.sign(message, "key", "CcpYJYpyYi2uaGNZnuJpfN75RL1Y9HDqfDtvfufW7XME");

      console.log(response);
  });
});
