import { set_panic_hook as streamsPanicHook } from "@iota/streams/node";
import { init } from "@iota/streams/web";
import * as fetch from "node-fetch";
/**
 *   Initialization function for the Streams WASM bindings
 */
export default function initialize() {
    // @ts-expect-error Streams WASM bindings need it
    global.fetch = fetch;
    // @ts-expect-error  Streams WASM bindings need it
    global.Headers = fetch.Headers;
    // @ts-expect-error  Streams WASM bindings need it
    global.Request = fetch.Request;
    // @ts-expect-error  Streams WASM bindings need it
    global.Response = fetch.Response;
    init();
    streamsPanicHook();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbGl6YXRpb25IZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9pbml0aWFsaXphdGlvbkhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxJQUFJLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDeEUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXpDLE9BQU8sS0FBSyxLQUFLLE1BQU0sWUFBWSxDQUFDO0FBRXBDOztHQUVHO0FBQ0YsTUFBTSxDQUFDLE9BQU8sVUFBVSxVQUFVO0lBQy9CLGlEQUFpRDtJQUNqRCxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixrREFBa0Q7SUFDbEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBQy9CLGtEQUFrRDtJQUNsRCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFDL0Isa0RBQWtEO0lBQ2xELE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztJQUVqQyxJQUFJLEVBQUUsQ0FBQztJQUNQLGdCQUFnQixFQUFFLENBQUM7QUFDdkIsQ0FBQyJ9