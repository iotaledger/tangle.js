import { SeedHelper, IotaAnchoringChannel } from "@tangle-js/anchors";

window.onload = async () => {
    console.log("On load");

    //handle create identity on click event
    document
        .querySelector("#create-channel")
        .addEventListener("click", () => createChannel());

    console.log("Panic Hook called");
};

async function createChannel() {
    const seed = SeedHelper.generateSeed();
    console.log("Seed40011!!!", seed);

    const channelDetails = await IotaAnchoringChannel.create(seed);

    console.log(channelDetails);

    const channel = await IotaAnchoringChannel.bindNew();
    var enc = new TextEncoder(); // always utf-8
    const result = await channel.anchor(enc.encode("Hello from browser!!!"),channel.firstAnchorageID);
    console.log(result);

    const channel2 = await IotaAnchoringChannel.fromID(channel.channelID).bind(channel.seed);

    const response = await channel2.fetch(channel.firstAnchorageID);

    console.log(response.message.toString());
}
