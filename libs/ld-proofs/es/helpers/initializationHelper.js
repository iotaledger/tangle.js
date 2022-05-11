const isBrowser = new Function("try { return this===window; } catch(e) { return false; }");
const WASM_PATH = "/public/wasm/identity_wasm_bg.wasm";
/**
 *   Initialization function for the Streams WASM bindings
 */
export default async function initialize() {
    if (isBrowser()) {
        const identity = await import("@iota/identity-wasm/web/identity_wasm.js");
        await identity.init(WASM_PATH);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbGl6YXRpb25IZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9pbml0aWFsaXphdGlvbkhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFNBQVMsR0FBRyxJQUFJLFFBQVEsQ0FBQywwREFBMEQsQ0FBQyxDQUFDO0FBQzNGLE1BQU0sU0FBUyxHQUFHLG9DQUFvQyxDQUFDO0FBRXZEOztHQUVHO0FBQ0YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLFVBQVUsVUFBVTtJQUNyQyxJQUFJLFNBQVMsRUFBRSxFQUFFO1FBQ2IsTUFBTSxRQUFRLEdBQUcsTUFBTSxNQUFNLENBQUUsMENBQTBDLENBQUMsQ0FBQztRQUUzRSxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDbEM7QUFDTCxDQUFDIn0=