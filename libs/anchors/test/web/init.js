import { SeedHelper, IotaAnchoringChannel, ProtocolHelper } from "@tangle-js/anchors";

window.onload = async () => {
  console.log("On load");

  // handle create identity on click event
  document
    .querySelector("#create-channel")
    .addEventListener("click", async () => createChannel());
};

async function createChannel() {
  console.log("Anchors Library initialized");

  const seed = SeedHelper.generateSeed();
  console.log("Seed40011!!!", seed);

  const channelDetails = await IotaAnchoringChannel.create(seed);

  console.log(channelDetails);

  const channel = await IotaAnchoringChannel.bindNew();
  var enc = new TextEncoder(); // always utf-8
  const result = await channel.anchor(
    enc.encode("Hello from browser!!!"),
    channel.firstAnchorageID
  );
  console.log(result);

  const msgL1 = await ProtocolHelper.getMsgIdL1(channel, result.msgID);
  console.log("L1 Id", msgL1);

  const channel2 = await IotaAnchoringChannel.fromID(channel.channelID).bind(
    channel.seed
  );

  const response = await channel2.fetch(channel.firstAnchorageID);

  console.log(response.message.toString());
}
