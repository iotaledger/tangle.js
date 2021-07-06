# Tangle Anchors

 `anchors` allows anchoring messages to the Tangle. Powered by [IOTA Streams](https://github.com/iotaledger/streams).  

## How it works

The main purpose is to be able to anchor messages to the IOTA Tangle so that their sequentiality, integrity, authenticity and immutability is preserved. Different applications can benefit from this feature. One of the applications (implemented by the [ld-proofs](../ld-proofs) library) is the generation of Linked Data Proofs for JSON(-LD) documents. 

You can imagine an Anchoring Channel as a port's dock where different ships can be anchored and where multiple anchorages are available. The library allows anchoring the ships, and once a ship is anchored, such ship itself turns into another anchorage. Actually, when you anchor a new ship, you anchor it both to the dock and to another ship, which is also playing the anchorage role.

An Anchoring Channel is just an IOTA Streams Channel which can contain as many anchorages as needed. The first anchorage is the announce message of such an IOTA Streams Channel. Anchorages are identified by an ID (the ID of a message). 

After anchoring a message, such anchored message can turn itself into another anchorage. 

The entities anchoring the messages (the ship owners, metaphorically speaking) are authenticated by means of EdDSA (Ed25519). 

## API

### Channel creation

```ts
// Seed generated automatically. Channel on the mainnet. Author === Subscriber. 
const anchoringChannel = await IotaAnchoringChannel.bindNew();

// Creation of a new channel by the Author
// Channel details contains all the relevant info about the channel just created
const channelDetails = await IotaAnchoringChannel.create(SeedHelper.generateSeed());

// Properties available on a Channel object

anchoringChannel.seed        // The seed of the Subscriber currently bound to the channel
anchoringChannel.channelID
anchoringChannel.channelAddr
anchoringChannel.firstAnchorageID

anchoringChannel.subscriberPubKey  // The Subscriber's Public Key (can be the same as Author's)
anchoringChannel.authorPubKey      // The Author's Public Key 
```

### Channel instantiation from ID

```ts
// Instantiation and binding as Subscriber using the seed
const anchoringChannel = await IotaAnchoringChannel.fromID(channelID).bind(seed);
```

### Anchoring messages

```ts
const message = "my message";
// Obtain your anchorageID (it could be the first anchorageID of the channel)
const result = await anchoringChannel.anchor(Buffer.from(message), anchorageID);
console.log("msg ID", result.msgID);
```

### Fetching messages

Searches for the anchorageID and fetches the message anchored to it. 


Optionally an expected message ID can be passed that allows to fail 
if there is no matching between the fetched message ID and the expected message ID. 

```ts
const result = await anchoringChannel.fetch(anchorageID, expectedMsgID?);

console.log("Message content: ", result.message.toString());
console.log("Message ID: ", result.msgID);
console.log("Message publisher's PK: ", result.pk);
``` 

### Receiving messages

Receives a message that has already been seen on the channel. 


Optionally an expected anchorage ID can be passed that allows to fail 
if the target message is not actually anchored to the expected anchorage. 

```ts
const result = await anchoringChannel.receive(msgID, expectedAnchorageID?);
``` 

### Traversing messages

```ts
const next = await anchoringChannel.fetchNext();
```
