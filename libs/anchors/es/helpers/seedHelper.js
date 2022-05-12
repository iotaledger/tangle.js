import { Author, ChannelType, SendOptions } from "@tangle.js/streams-wasm/node/streams.js";
// eslint-disable-next-line unicorn/prefer-node-protocol
import * as crypto from "crypto";
import { ClientHelper } from "./clientHelper";
export class SeedHelper {
    /**
     * Generates a new seed
     * @param length Seed length
     * @returns The seed
     */
    static generateSeed(length = 80) {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        let seed = "";
        while (seed.length < length) {
            const bytes = crypto.randomBytes(1);
            seed += alphabet[bytes[0] % alphabet.length];
        }
        return seed;
    }
    /**
     * Given a seed obtains the corresponding Ed25519 public key
     *
     * @param seed The seed
     * @returns the public key
     */
    static async publicKeyFromSeed(seed) {
        // The node is just a formality to fill all the params
        const author = new Author(seed, new SendOptions(ClientHelper.DEFAULT_NODE, true), ChannelType.SingleBranch);
        return author.clone().get_public_key();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZEhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3NlZWRIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDM0Ysd0RBQXdEO0FBQ3hELE9BQU8sS0FBSyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQ2pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU5QyxNQUFNLE9BQU8sVUFBVTtJQUNuQjs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLFlBQVksQ0FBQyxTQUFpQixFQUFFO1FBQzFDLE1BQU0sUUFBUSxHQUFHLDRCQUE0QixDQUFDO1FBRTlDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUVkLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLEVBQUU7WUFDekIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxJQUFJLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDaEQ7UUFHRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQVk7UUFDOUMsc0RBQXNEO1FBQ3RELE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksRUFDMUIsSUFBSSxXQUFXLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFaEYsT0FBTyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDM0MsQ0FBQztDQUNKIn0=