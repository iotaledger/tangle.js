import { set_panic_hook as streamsPanicHook } from "@iota/streams/node/streams.cjs";
import * as fetch from "node-fetch";
import init from "@iota/streams/web/streams.mjs";
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
        await init(WASM_PATH);
    }
    streamsPanicHook();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbGl6YXRpb25IZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9pbml0aWFsaXphdGlvbkhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxJQUFJLGdCQUFnQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDcEYsT0FBTyxLQUFLLEtBQUssTUFBTSxZQUFZLENBQUM7QUFDcEMsT0FBTyxJQUFJLE1BQU0sK0JBQStCLENBQUM7QUFFakQsTUFBTSxTQUFTLEdBQUcsSUFBSSxRQUFRLENBQUMsMERBQTBELENBQUMsQ0FBQztBQUMzRixNQUFNLFNBQVMsR0FBRyw4QkFBOEIsQ0FBQztBQUVqRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxVQUFVLFVBQVU7SUFDcEMsaURBQWlEO0lBQ2pELE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLGtEQUFrRDtJQUNsRCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFDL0Isa0RBQWtEO0lBQ2xELE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztJQUMvQixrREFBa0Q7SUFDbEQsTUFBTSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO0lBRWpDLElBQUksU0FBUyxFQUFFLEVBQUU7UUFDYixNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN6QjtJQUNELGdCQUFnQixFQUFFLENBQUM7QUFDdkIsQ0FBQyJ9