# iota-anchoring-channels

Powered by [IOTA Streams](https://github.com/iotaledger/streams), `iota-anchoring-channels` is an easy to be used library that allows to anchor messages to the Tangle and later verify their anchoring if needed. 

## How it works

The main purpose is to be able to anchor messages to the IOTA Tangle so that their integrity, authenticity and immutability is preserved. Different applications can benefit from this feature. One of the applications (implemented by the library itself) is the generation of Linked Data Proofs for JSON-LD documents.  

The library allows you create "Anchoring Channels". An Anchoring Channel is just an IOTA Streams Channel which can contain as many anchorages as needed. The first anchorage point is the announce message of such an IOTA Streams Channel. Anchorage points are identified by an ID (the ID of the message that is actually the anchorage). 

After anchoring a message to an anchorage, such new message can become itself another anchorage point (on top of the previous message). 

You can imagine an Anchoring Channel as a port's dock where different ships can be anchored and where multiple anchorages  are available. The library allows you to anchor the ships and once the ship is anchored that ship itself becomes another anchorage point. When you anchor other ships you anchor them both to the dock and to that ship acting as an anchorage.

The entities anchoring the messages (i.e. the ship owners) are authenticated by means of EdDSA (Ed25519). 

## API

### Anchoring messages

```
const anchoringChannel = IotaAnchoringChannel.create(node, seed).bind(channelID);

anchoringChannel.seed
anchoringChannel.channelID
anchoringChannel.channelAddr
anchoringChannel.announceMsgID

const result = anchoringChannel.anchor(message, anchorageID)

const result = anchoringChannel.fetch(anchorageID, msgID)
``` 

### Signing messages

```
const signer = new IotaSigner(node, did);
const signature = signer.sign(message, privateKey);
```

### Linked Data Proofs generation

```
const anchorChannel = /* Instantiate an anchor channel */
const signer = /* Instantiate a signer */
const ldProofGenerator = new IotaLdProofGenerator(anchoringChannel, signer)
ldProofGenerator.generate(jsonLdDocument, anchorageID)
```

### Linked Data Proofs verification

```
const verifier = new IotaAnchorVerifier(node, seed);
verifier.verify(jsonDocument);

verifier.verify(jsonDocument[]);
```
