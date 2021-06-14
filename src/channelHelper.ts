import * as crypto from "crypto";
import * as fetch from "node-fetch";
import { set_panic_hook as streamsPanickHook, Address, Subscriber } from "wasm-node/iota_streams_wasm";

/**
 *   Initialization function for the Streams WASM bindings
 */
export function initialize() {
    // @ts-expect-error Streams WASM bindings need it
    global.fetch = fetch;
    // @ts-expect-error  Streams WASM bindings need it
    global.Headers = fetch.Headers;
    // @ts-expect-error  Streams WASM bindings need it
    global.Request = fetch.Request;
    // @ts-expect-error  Streams WASM bindings need it
    global.Response = fetch.Response;

    streamsPanickHook();
}

export class ChannelHelper {
    /**
     * Generates a new seed
     * @param length Seed length
     *
     * @returns The seed
     */
    public static generateSeed(length: number = 20) {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";

        let seed = "";

        while (seed.length < length) {
            const bytes = crypto.randomBytes(1);
            seed += alphabet[bytes[0] % alphabet.length];
        }


        return seed;
    }

    /**
     *  Finds an anchorage message on the channel by going through the messages
     *
     * @param subs  Subscriber
     * @param anchorageID The anchorage identifier
     *
     * @returns whether it has been found and the link to the anchorage on the Channel
     */
    public static async findAnchorage(subs: Subscriber, anchorageID: string):
        Promise<{ found: boolean; anchorageLink?: Address }> {
        // Iteratively retrieve messages until We find the one to anchor to
        let found = false;
        let anchorageLink: Address;

        while (!found) {
            const messages = await subs.clone().fetch_next_msgs();
            if (!messages || messages.length === 0) {
                break;
            }

            // In our case only one message is expected
            anchorageLink = messages[0].get_link().copy();

            if (anchorageLink.msg_id === anchorageID) {
                found = true;
            }
        }

        return { found, anchorageLink };
    }
}
