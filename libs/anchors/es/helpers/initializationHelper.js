import { set_panic_hook as streamsPanicHook } from "@iota/streams/node/streams.js";
import * as fetch from "node-fetch";
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
        const streams = await import("@iota/streams/web/streams.js");
        await streams.default(WASM_PATH);
    }
    streamsPanicHook();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbGl6YXRpb25IZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9pbml0aWFsaXphdGlvbkhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxJQUFJLGdCQUFnQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbkYsT0FBTyxLQUFLLEtBQUssTUFBTSxZQUFZLENBQUM7QUFFcEMsMkVBQTJFO0FBQzNFLE1BQU0sU0FBUyxHQUFHLElBQUksUUFBUSxDQUFDLDBEQUEwRCxDQUFDLENBQUM7QUFFM0YsTUFBTSxTQUFTLEdBQUcsOEJBQThCLENBQUM7QUFFakQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssVUFBVSxVQUFVO0lBQ3BDLGlEQUFpRDtJQUNqRCxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixrREFBa0Q7SUFDbEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBQy9CLGtEQUFrRDtJQUNsRCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFDL0Isa0RBQWtEO0lBQ2xELE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztJQUVqQyxJQUFJLFNBQVMsRUFBRSxFQUFFO1FBQ2IsTUFBTSxPQUFPLEdBQUcsTUFBTSxNQUFNLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUM3RCxNQUFNLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDcEM7SUFDRCxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3ZCLENBQUMifQ==