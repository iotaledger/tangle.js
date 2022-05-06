import { set_panic_hook as streamsPanicHook } from "@iota/streams/node";
// import { init } from "@iota/streams/web/streams_wasm.js";

import * as fetch from "node-fetch";

/**
 *   Initialization function for the Streams WASM bindings
 */
 export default function initialize() {
    // @ts-expect-error Streams WASM bindings need it
    global.fetch = fetch;
    // @ts-expect-error  Streams WASM bindings need it
    global.Headers = fetch.Headers;
    // @ts-expect-error  Streams WASM bindings need it
    global.Request = fetch.Request;
    // @ts-expect-error  Streams WASM bindings need it
    global.Response = fetch.Response;

    // init();
    streamsPanicHook();
}
