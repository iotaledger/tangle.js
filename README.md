# iota-anchoring-channels

Powered by [IOTA Streams](https://github.com/iotaledger/streams), `iota-anchoring-channels` is an easy to be used library that allows to anchor messages to the Tangle and later verify their anchoring if needed. 

## How it works

The main purpose is to be able to anchor messages to the IOTA Tangle so that their integrity, authenticity and immutability is preserved. Different applications can benefit from this feature. One of the applications (implemented by the library itself) is the generation of Linked Data Proofs for JSON-LD documents.  

The library allows you create "Anchoring Channels". An Anchoring Channel is just an IOTA Streams Channel which can contain as many anchorages as needed. The first anchorage is the announce message of such an IOTA Streams Channel. Anchorages are identified by an ID (the ID of the message that is actually the anchorage). 

After anchoring a message to an anchorage, such anchored message can turn itself into another anchorage (like if it were "on top" of the previous message). 

You can imagine an Anchoring Channel as a port's dock where different ships can be anchored and where multiple anchorages are available. The library allows anchoring the ships and once a ship is anchored that ship itself becomes another anchorage . When you anchor new ships you anchor them both to the dock and to another ship acting as an anchorage.

The entities anchoring the messages (the ship owners metaphorically speaking) are authenticated by means of EdDSA (Ed25519). 

## API

### Anchoring messages

```ts
const anchoringChannel = await IotaAnchoringChannel.create(node, seed).bind(channelID?);

anchoringChannel.seed
anchoringChannel.channelID
anchoringChannel.channelAddr
anchoringChannel.firstAnchorageID

const message = "my message";
// Obtain your anchorageID (it could be the first anchorageID of the channel)
const result = await anchoringChannel.anchor(anchorageID, message);
console.log("msg ID", result.msgID);
```

### Fetching messages

```ts
const result = await anchoringChannel.fetch(anchorageID, msgID);
``` 

### Signing messages (EdDSA)

```ts
const node = "https://chrysalis-nodes.iota.org";
const did = "did:iota:2pu42SstXrg7uMEGHS5qkBDEJ1hrbrYtWQReMUvkCrDP";
const signer = await IotaSigner.create(node, did);

const message = "hello";
// Method declared on the DID document
const method = "key";
const privateKey = "privateKeybase58";
const hashAlgorithm = /* "sha256" or "sha512" */
const signature = (await signer.sign(message, method, privateKey, hashAlgorithm?)).signatureValue;
```

### Verifying messages

```ts
const request: IVerificationRequest = {
      message: "Hello",
      signatureValue,
      verificationMethod: "did:iota:2pu42SstXrg7uMEGHS5qkBDEJ1hrbrYtWQReMUvkCrDP#key",
      hashAlgorithm: "sha256",
      "https://chrysalis-nodes.iota.org"
    };

    const result = await IotaVerifier.verify(request);
```

### Linked Data Proofs generation (To be implemented)

```ts
const anchorChannel = /* Instantiate an anchor channel */
const signer = /* Instantiate a signer */
const ldProofGenerator = new IotaLdProofGenerator(anchoringChannel, signer)
await ldProofGenerator.generate(jsonLdDocument, anchorageID)
```

### Linked Data Proofs verification (To be implemented)

```ts
const verifier = new IotaAnchorVerifier(node, seed);
await verifier.verify(jsonDocument);

await verifier.verify(jsonDocument[]);
```
