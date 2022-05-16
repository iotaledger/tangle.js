import { set_panic_hook as streamsPanicHook } from "@tangle.js/streams-wasm/node/streams.js";
import fetch from "node-fetch";

// eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
const isBrowser = new Function("try { return this===window; } catch(e) { return false; }");

const WASM_PATH = "/public/wasm/streams_bg.wasm";

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
        const streams = await import("@tangle.js/streams-wasm/web/streams.js");
        await streams.default(WASM_PATH);
    }
    streamsPanicHook();
}
