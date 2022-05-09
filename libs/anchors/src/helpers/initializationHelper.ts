import { set_panic_hook as streamsPanicHook } from "@iota/streams/node";
import * as fetch from "node-fetch";
import init from "../../streams/web/streams.js";

const isBrowser = new Function("try { return this===window; } catch(e) { return false; }");
const WASM_PATH = "/wasm/streams_bg.wasm";

/**
 *   Initialization function for the Streams WASM bindings
 */
 export default async function initialize() {
    // @ts-expect-error Streams WASM bindings need it
    global.fetch = fetch;
    // @ts-expect-error  Streams WASM bindings need it
    global.Headers = fetch.Headers;
    // @ts-expect-error  Streams WASM bindings need it
    global.Request = fetch.Request;
    // @ts-expect-error  Streams WASM bindings need it
    global.Response = fetch.Response;

    if (isBrowser()) {
        await init(WASM_PATH);
    }
    streamsPanicHook();
}
