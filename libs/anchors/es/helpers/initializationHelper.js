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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbGl6YXRpb25IZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9pbml0aWFsaXphdGlvbkhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxJQUFJLGdCQUFnQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDN0YsT0FBTyxLQUFLLE1BQU0sWUFBWSxDQUFDO0FBRS9CLDJFQUEyRTtBQUMzRSxNQUFNLFNBQVMsR0FBRyxJQUFJLFFBQVEsQ0FBQywwREFBMEQsQ0FBQyxDQUFDO0FBRTNGLE1BQU0sU0FBUyxHQUFHLDhCQUE4QixDQUFDO0FBRWpEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLFVBQVUsVUFBVTtJQUNwQyxpREFBaUQ7SUFDakQsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsa0RBQWtEO0lBQ2xELE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztJQUMvQixrREFBa0Q7SUFDbEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBQy9CLGtEQUFrRDtJQUNsRCxNQUFNLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7SUFFakMsSUFBSSxTQUFTLEVBQUUsRUFBRTtRQUNiLE1BQU0sT0FBTyxHQUFHLE1BQU0sTUFBTSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7UUFDdkUsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3BDO0lBQ0QsZ0JBQWdCLEVBQUUsQ0FBQztBQUN2QixDQUFDIn0=