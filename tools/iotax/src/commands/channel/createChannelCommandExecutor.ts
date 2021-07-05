import { IotaAnchoringChannel, SeedHelper } from "@tangle.js/anchors";
import { Arguments } from "yargs";
import { isDefined } from "../../globalParams";
import { getNetworkParams } from "../commonParams";

export default class CreateChannelCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const node = getNetworkParams(args).network;

    try {
      let seed = "";

      if (!isDefined(args, "seed")) {
        seed = SeedHelper.generateSeed();
      } else {
        seed = args.seed as string;
      }

      const channel = await IotaAnchoringChannel.create(seed, node).bind();
      console.log({
        channelID: channel.channelID,
        firstAnchorageID: channel.firstAnchorageID,
        authorPubKey: channel.authorPubKey,
        seed
      });
    } catch (error) {
      console.error("Error:", error);
      return false;
    }

    return true;
  }
}
