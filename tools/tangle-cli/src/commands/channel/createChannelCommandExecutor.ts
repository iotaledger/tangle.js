import { IotaAnchoringChannel, SeedHelper } from "@tangle-js/anchors";
import { Arguments } from "yargs";
import { isDefined } from "../../globalParams";
import { getNetworkParams } from "../commonParams";
import { ChannelHelper } from "./channelHelper";

export default class CreateChannelCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const { network: node, permanode } = getNetworkParams(args);
    const encrypted = ChannelHelper.getEncrypted(args);
    const isPrivate = ChannelHelper.getPrivate(args);

    const presharedKeys = args.psk as string[];

    console.log(presharedKeys);

    try {
      let seed = "";

      if (!isDefined(args, "seed")) {
        seed = SeedHelper.generateSeed(25);
      } else {
        seed = args.seed as string;
      }

      const channelDetails = await IotaAnchoringChannel.create(seed,
        { node, permanode, encrypted, isPrivate, presharedKeys });
      console.log(channelDetails);
    } catch (error) {
      console.error("Error:", error);
      return false;
    }

    return true;
  }
}
