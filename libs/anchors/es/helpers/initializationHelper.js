import { set_panic_hook as streamsPanicHook } from "@tangle.js/streams-wasm/node";
import * as fetch from "node-fetch";
/**
 *   Initialization function for the Streams WASM bindings
 */
export default function initialize() {
    return;
    // @ts-expect-error Streams WASM bindings need it
    global.fetch = fetch;
    // @ts-expect-error  Streams WASM bindings need it
    global.Headers = fetch.Headers;
    // @ts-expect-error  Streams WASM bindings need it
    global.Request = fetch.Request;
    // @ts-expect-error  Streams WASM bindings need it
    global.Response = fetch.Response;
    streamsPanicHook();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbGl6YXRpb25IZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9pbml0aWFsaXphdGlvbkhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxJQUFJLGdCQUFnQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDbEYsT0FBTyxLQUFLLEtBQUssTUFBTSxZQUFZLENBQUM7QUFFcEM7O0dBRUc7QUFDRixNQUFNLENBQUMsT0FBTyxVQUFVLFVBQVU7SUFDL0IsT0FBTztJQUNQLGlEQUFpRDtJQUNqRCxNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixrREFBa0Q7SUFDbEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0lBQy9CLGtEQUFrRDtJQUNsRCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFDL0Isa0RBQWtEO0lBQ2xELE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztJQUVqQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3ZCLENBQUMifQ==