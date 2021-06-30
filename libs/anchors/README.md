# IOTA Anchors

 `anchors` allows anchoring messages to the Tangle. Powered by [IOTA Streams](https://github.com/iotaledger/streams).  

## How it works

The main purpose is to be able to anchor messages to the IOTA Tangle so that their appearance order, integrity, authenticity and immutability is preserved. Different applications can benefit from this feature. One of the applications (implemented by the [ld-proofs](../ld-proofs) library) is the generation of Linked Data Proofs for JSON-LD documents.  

The library allows creating "Anchoring Channels". An Anchoring Channel is just an IOTA Streams Channel which can contain as many anchorages as needed. The first anchorage is the announce message of such an IOTA Streams Channel. Anchorages are identified by an ID (the ID of a message). 

After anchoring a message, such anchored message can turn itself into another anchorage. 

You can imagine an Anchoring Channel as a port's dock where different ships can be anchored and where multiple anchorages are available. The library allows anchoring the ships, and once a ship is anchored, such ship itself turns into another anchorage. Actually, when you anchor a new ship you anchor them both to the dock and to another ship playing also the role of anchorage.

The entities anchoring the messages (the ship owners metaphorically speaking) are authenticated by means of EdDSA (Ed25519). 

## API

### Anchoring messages

```ts
const anchoringChannel = await IotaAnchoringChannel.create(seed).bind(channelID?);

anchoringChannel.seed
anchoringChannel.channelID
anchoringChannel.channelAddr
anchoringChannel.firstAnchorageID

anchoringChannel.publisherPK
anchoringChannel.authorPK

const message = "my message";
// Obtain your anchorageID (it could be the first anchorageID of the channel)
const result = await anchoringChannel.anchor(Buffer.from(message), anchorageID);
console.log("msg ID", result.msgID);
```

### Fetching messages

```ts
const result = await anchoringChannel.fetch(anchorageID, msgID);
``` 

## Receiving messages

```ts
const result = await anchoringChannel.receive(msgID);
``` 

