import { IotaAnchoringChannel } from "@tangle-js/anchors";

// Example on how to use the anchors library
async function main() {
  console.log("Creating a channel over the Chrysalis mainnet ...");
  const myChannel = await IotaAnchoringChannel.bindNew();
  console.log("Channel ID: ", myChannel.channelID);
  console.log("Seed: ", myChannel.seed);

  console.log("Anchoring a message to ", myChannel.firstAnchorageID, "...");
  const anchorResult = await myChannel.anchor(Buffer.from("hello, world 1"), myChannel.firstAnchorageID);
  console.log("Message ID: ", anchorResult.msgID);

  console.log("Anchoring a message to ", anchorResult.msgID, "...");
  const anchorResult2 = await myChannel.anchor(Buffer.from("hello, world 2"), anchorResult.msgID);

  // First parameter is the anchorage and second one the expected message ID
  // If the anchored message is not the expected one an exception will be thrown
  console.log("Fetching the message 1 ...");
  const fetchResult = await myChannel.fetch(myChannel.firstAnchorageID, anchorResult.msgID);
  console.log(fetchResult.message.toString());

  console.log("Fetching the message 2 ...");
  const fetchResult2 = await myChannel.fetch(anchorResult.msgID, anchorResult2.msgID);
  console.log(fetchResult2.message.toString());
}

main()
  .then(() => {})
  .catch((err) => console.log(err));
