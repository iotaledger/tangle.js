import { Anchors } from "@tangle-js/anchors";
// eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
const isBrowser = new Function("try { return this===window; } catch(e) { return false; }");
const WASM_PATH = "/public/wasm/identity_wasm_bg.wasm";
/**
 *   Initialization function for the Streams WASM bindings
 */
export default async function initialize() {
    await Anchors.initialize();
    if (isBrowser()) {
        const identity = await import("@iota/identity-wasm/web/identity_wasm.js");
        await identity.init(WASM_PATH);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbGl6YXRpb25IZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9pbml0aWFsaXphdGlvbkhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFN0MsMkVBQTJFO0FBQzNFLE1BQU0sU0FBUyxHQUFHLElBQUksUUFBUSxDQUFDLDBEQUEwRCxDQUFDLENBQUM7QUFDM0YsTUFBTSxTQUFTLEdBQUcsb0NBQW9DLENBQUM7QUFFdkQ7O0dBRUc7QUFDRixNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssVUFBVSxVQUFVO0lBQ3JDLE1BQU0sT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBRTNCLElBQUksU0FBUyxFQUFFLEVBQUU7UUFDYixNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBRSwwQ0FBMEMsQ0FBQyxDQUFDO1FBRTNFLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNsQztBQUNMLENBQUMifQ==