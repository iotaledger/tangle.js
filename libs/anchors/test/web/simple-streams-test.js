import init from "@iota/streams/web/streams.js";
import { set_panic_hook, ClientBuilder, StreamsClient } from "@iota/streams/node";

window.onload = async () => {
    console.log("On load");

    //handle create identity on click event
    document
        .querySelector("#create-channel")
        .addEventListener("click", () => createChannel());   
    
    await init("wasm/streams_bg.wasm");
};

async function createChannel() {
    set_panic_hook();

    console.log("Panick hook called");

    let builder = new ClientBuilder().node("https://chrysalis-nodes.iota.org");
    console.log("Builder", builder);

    const client = await builder.build();
    let sc = StreamsClient.fromClient(client);
    console.log("Streams client", sc);
}
