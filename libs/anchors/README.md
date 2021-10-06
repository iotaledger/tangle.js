# Tangle Anchors

 `anchors` allows anchoring messages to the Tangle. Powered by [IOTA Streams](https://github.com/iotaledger/streams). 

 [![Github Test Workflow](https://github.com/iotaledger/tangle.js/workflows/Anchors%20Test/badge.svg)](https://github.com/iotaledger/tangle.js/actions/workflows/anchors-test.yaml)
 [![npm badge](https://img.shields.io/npm/dm/%40tangle-js%2Fanchors.svg)](https://www.npmjs.com/package/@tangle-js/anchors)

## How it works

The main purpose is to be able to anchor messages to the IOTA Tangle so that their sequentiality, 
integrity, authenticity and immutability is preserved. Different applications can benefit from this feature. 
One of the applications (implemented by the [ld-proofs](../ld-proofs) library) is the generation 
of Linked Data Proofs for JSON(-LD) documents. 

You can imagine an Anchoring Channel as a (public or private) port's dock where different ships 
can be anchored and where an anchorage is always available. The library allows anchoring a new 
arriving ship, and once it is anchored, such ship itself turns into an anchorage. 
Actually, when you anchor a new ship, you anchor it both to the dock and to another ship, 
which is also playing the anchorage role.

An Anchoring Channel is just an IOTA Streams (*Single Branch*) Channel configured in **Single Publisher** mode. 
The publisher is usually both the Author and **the only** Subscriber of the Channel. 
The channel can contain as many anchorages as needed but **each anchorage can only anchor one message**. 
In public channels the first anchorage is the announce message of the underlying IOTA Streams Channel. 
In private channels the first anchorage is a keyLoad message anchored to the channel's announce message. 
In both private and public channels messages can be encrypted if needed. 

Anchorages are identified by an ID (the ID of a message). 

After anchoring a message, such anchored message turns itself into the next anchorage available. 

Following the IOTA Streams' signed packet scheme, all the messages anchored are authenticated by means of EdDSA (Ed25519). 

## Installation

```
npm install @tangle-js/anchors
```

## API

### Channel creation

```ts
// Seed generated automatically. Channel on the mainnet. Author === Subscriber. 
// Public channel
const anchoringChannel = await IotaAnchoringChannel.bindNew();

// Public Channel with masked payloads
const anchoringChannel = await IotaAnchoringChannel.bindNew({ encrypted: true });

// Private Channel with masked payloads
const anchoringChannel = await IotaAnchoringChannel.bindNew({ encrypted: true, isPrivate: true });

// Creation of a new public channel by the Author
// Channel details contains all the relevant info about the channel just created
const channelDetails = await IotaAnchoringChannel.create(SeedHelper.generateSeed());
// same but with masked payloads
const channelDetails = await IotaAnchoringChannel.create(SeedHelper.generateSeed(), { encrypted: true });

// Creation of a new private channel by the Author
const channelDetails = await IotaAnchoringChannel.create(SeedHelper.generateSeed(), { isPrivate: true });
// same but with masked payloads
const channelDetails = await IotaAnchoringChannel.create(SeedHelper.generateSeed(), { isPrivate: true, encrypted: true });


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

```ts
// With Masked payloads
const anchoringChannel = await IotaAnchoringChannel.fromID(channelID, { encrypted: true }).bind(seed);
```

```ts
// Private Channel instantiation with Masked payloads, the seed must correspond to an authorized subscriber, 
// for instance the Author itself
const anchoringChannel = await IotaAnchoringChannel.fromID(channelID, { isPrivate: true, encrypted: true }).bind(seed);
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

### L1 Message Mapping

```ts
const layer1MsgID = ProtocolHelper.getMsgIdL1(anchoringChannel,msgID);

const layer1Index = ProtocolHelper.getIndexL1(channelAddr, msgID);
```
