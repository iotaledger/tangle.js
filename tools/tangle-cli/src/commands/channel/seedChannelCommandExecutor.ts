/* eslint-disable no-duplicate-imports */
import { SeedHelper } from "@tangle-js/anchors";
import { Arguments } from "yargs";

export default class SeedChannelCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const seed = SeedHelper.generateSeed(args.size as number);
    const publicKey = await SeedHelper.publicKeyFromSeed(seed);

    console.log({ seed, publicKey });

    return true;
  }
}
