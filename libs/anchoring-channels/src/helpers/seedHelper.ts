import * as crypto from "crypto";

export class SeedHelper {
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
}
