/* eslint-disable no-duplicate-imports */
import { SeedHelper } from "@tangle-js/anchors";
import { Arguments } from "yargs";

export default class SeedChannelCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const seed = SeedHelper.generateSeed(args.size as number);

    console.log({ seed });

    return true;
  }
}
