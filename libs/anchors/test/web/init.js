import { SeedHelper, IotaAnchoringChannel } from "anchors-web.js";
import { set_panic_hook } from "@iota/streams/web";
// import init from "@iota/streams/web/streams.js";

window.onload = async () => {
    console.log("On load");

    //handle create identity on click event
    document
        .querySelector("#create-channel")
        .addEventListener("click", () => createChannel());

    // await init("wasm/streams_bg.wasm");

    console.log("Panic Hook called");
};

async function createChannel() {
    // set_panic_hook();

    const seed = SeedHelper.generateSeed();
    console.log("Seed40011!!!", seed);

    const channelDetails = await IotaAnchoringChannel.create(seed);

    console.log(channelDetails);

    const channel = await IotaAnchoringChannel.bindNew();
    var enc = new TextEncoder(); // always utf-8
    const result = await channel.anchor(enc.encode("Hello from browser!!!"),channel.firstAnchorageID);
    console.log(result);

    const response = await channel.fetch(channel.firstAnchorageID);

    console.log(response.message.toString());
}
