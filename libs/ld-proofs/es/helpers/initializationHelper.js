// eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
const isBrowser = new Function("try { return this===window; } catch(e) { return false; }");
const WASM_PATH = "/public/wasm/identity_wasm_bg.wasm";
/**
 * Initialization function for the Streams WASM bindings.
 */
export default async function initialize() {
    if (isBrowser()) {
        const identity = await import("@iota/identity-wasm/web/identity_wasm.js");
        await identity.init(WASM_PATH);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbGl6YXRpb25IZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9pbml0aWFsaXphdGlvbkhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwyRUFBMkU7QUFDM0UsTUFBTSxTQUFTLEdBQUcsSUFBSSxRQUFRLENBQUMsMERBQTBELENBQUMsQ0FBQztBQUMzRixNQUFNLFNBQVMsR0FBRyxvQ0FBb0MsQ0FBQztBQUV2RDs7R0FFRztBQUNGLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxVQUFVLFVBQVU7SUFDckMsSUFBSSxTQUFTLEVBQUUsRUFBRTtRQUNiLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFFLDBDQUEwQyxDQUFDLENBQUM7UUFFM0UsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ2xDO0FBQ0wsQ0FBQyJ9