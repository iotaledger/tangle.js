/* eslint-disable no-duplicate-imports */
import { IotaAnchoringChannel, SeedHelper } from "@tangle.js/anchors";
import { Arguments } from "yargs";
import { isDefined } from "../../globalParams";
import { getNetworkParams } from "../commonParams";

export default class FetchMsgCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const node = getNetworkParams(args).network;

    let seed = "";
    if (!isDefined(args, "seed")) {
      seed = SeedHelper.generateSeed();
    } else {
      seed = args.seed as string;
    }

    try {
      // Channel contains the channel address + the announce messageID
      const channelID = args.channel as string;
      const channel = await IotaAnchoringChannel.create(seed, node).bind(channelID);

      const anchorageID = args.anchorageID as string;
      const msgID = args.msgID as string;
      const result = await channel.fetch(anchorageID, msgID);

      const output = {
        message: result.message.toString(),
        pk: result.pk,
        msgID: result.msgID
      };

      console.log(output);
    } catch (error) {
      console.error("Error:", error);
      return false;
    }

    return true;
  }
}
