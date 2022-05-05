import { SeedHelper, IotaAnchoringChannel } from "anchors-web.js";

window.onload = async () => {
    console.log("On load");

    //handle create identity on click event
    document
        .querySelector("#create-channel")
        .addEventListener("click", () => createChannel());    
};

async function createChannel() {
    const seed = SeedHelper.generateSeed();
    console.log("Seed400!!!", seed);

    const channelDetails = await IotaAnchoringChannel.create(seed);

    console.log(channelDetails);
}
