import { Author, ChannelType, SendOptions } from "@iota/streams/node/streams.js";
import * as crypto from "crypto";
import { ClientHelper } from "./clientHelper";

export class SeedHelper {
    /**
     * Generates a new seed
     * @param length Seed length
     * @returns The seed
     */
    public static generateSeed(length: number = 80) {
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
    public static async publicKeyFromSeed(seed: string): Promise<string> {
        // The node is just a formality to fill all the params
        const author = new Author(seed,
            new SendOptions(ClientHelper.DEFAULT_NODE, true), ChannelType.SingleBranch);

        return author.clone().get_public_key();
    }
}
