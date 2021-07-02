/* eslint-disable no-duplicate-imports */
import { IotaAnchoringChannel, SeedHelper } from "@tangle.js/anchors";
import { Arguments } from "yargs";
import { isDefined } from "../../globalParams";
import { getNetworkParams } from "../commonParams";

export default class AnchorMsgCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const node = getNetworkParams(args).network;

    try {
      let seed = "";
      if (!isDefined(args, "seed")) {
        seed = SeedHelper.generateSeed();
      } else {
        seed = args.seed as string;
      }

      let channel: IotaAnchoringChannel;
      let anchorageID: string;

      if (!isDefined(args, "channel")) {
        channel = await IotaAnchoringChannel.create(seed, node).bind();
        anchorageID = channel.firstAnchorageID;
      } else {
        const channelID = args.channel as string;
        // The address of the anchorage message
        anchorageID = args.anchorageID as string;
        channel = await IotaAnchoringChannel.create(seed, node).bind(channelID);
      }
      const result = await channel.anchor(Buffer.from(args.msg as string), anchorageID);
      console.log({
        channel: channel.channelID,
        ...result,
        seed
      });
    } catch (error) {
      console.error("Error:", error);
      return false;
    }

    return true;
  }
}
