import { Author, ChannelType, SendOptions } from "@iota/streams/node/streams.js";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZEhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3NlZWRIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDakYsT0FBTyxLQUFLLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDakMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTlDLE1BQU0sT0FBTyxVQUFVO0lBQ25COzs7O09BSUc7SUFDSSxNQUFNLENBQUMsWUFBWSxDQUFDLFNBQWlCLEVBQUU7UUFDMUMsTUFBTSxRQUFRLEdBQUcsNEJBQTRCLENBQUM7UUFFOUMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRWQsT0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sRUFBRTtZQUN6QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNoRDtRQUdELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBWTtRQUM5QyxzREFBc0Q7UUFDdEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUMxQixJQUFJLFdBQVcsQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVoRixPQUFPLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0NBQ0oifQ==