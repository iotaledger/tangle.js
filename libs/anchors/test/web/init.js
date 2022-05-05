import * as anchors from "anchors-web.js";

console.log("here");

window.onload = async () => {
    console.log("On load");

    //handle create identity on click event
    document
        .querySelector("#create-channel")
        .addEventListener("click", () => createChannel());    
};

async function createChannel() {
    console.log("Create channel2", anchors);

    const seed = SeedHelper.generateSeed();
    console.log("Seed!!!", seed);

    const channelDetails = await IotaAnchoringChannel.create(seed);

    console.log(channelDetails);
}
