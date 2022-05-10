import * as identity from "@iota/identity-wasm/web/identity_wasm.js";

const isBrowser = new Function("try { return this===window; } catch(e) { return false; }");
const WASM_PATH = "/public/wasm/identity_wasm_bg.wasm";

/**
 *   Initialization function for the Streams WASM bindings
 */
 export default async function initialize() {
    if (isBrowser()) {
        await identity.init(WASM_PATH);
    }
}
