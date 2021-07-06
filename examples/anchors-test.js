const { IotaAnchoringChannel } = require("@tangle.js/anchors");

// Example on how to use the anchors library
async function main() {
  console.log("Creating a channel over the Chrysalis mainnet ...");
  const myChannel = await IotaAnchoringChannel.create().bind();
  console.log("Channel ID: ", myChannel.channelID);
  console.log("Seed: ", myChannel.seed);
  console.log("PubKey: ", myChannel.authorPubKey);

  console.log("Anchoring a message to ", myChannel.firstAnchorageID, "...");
  const anchorResult = await myChannel.anchor(Buffer.from("hello, world 1"), myChannel.firstAnchorageID);
  console.log("Message ID: ", anchorResult.msgID);

  const myChannel2 = await IotaAnchoringChannel.create().bind(myChannel.channelID);
  console.log("Channel2 ID: ", myChannel2.channelID);
  console.log("Seed2: ", myChannel2.seed);
  console.log("PubKey2: ", myChannel2.publisherPubKey);

  console.log("Anchoring a message to ", anchorResult.msgID, "...");
  const anchorResult2 = await myChannel2.anchor(Buffer.from("hello, world 2"), anchorResult.msgID);

  console.log("Anchoring a message to ", anchorResult2.msgID, "...");
  const anchorResult3 = await myChannel2.anchor(Buffer.from("hello, world 3"), anchorResult2.msgID);

  console.log(anchorResult3);
}

main()
  .then(() => {})
  .catch((err) => console.log(err));
