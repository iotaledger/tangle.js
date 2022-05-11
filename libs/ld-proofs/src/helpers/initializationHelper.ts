const isBrowser = new Function("try { return this===window; } catch(e) { return false; }");
const WASM_PATH = "/public/wasm/identity_wasm_bg.wasm";

/**
 *   Initialization function for the Streams WASM bindings
 */
 export default async function initialize() {
    if (isBrowser()) {
        const identity = await import ("@iota/identity-wasm/web/identity_wasm.js");

        await identity.init(WASM_PATH);
    }
}
