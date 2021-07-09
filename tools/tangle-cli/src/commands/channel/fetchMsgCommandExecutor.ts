/* eslint-disable no-duplicate-imports */
import { IotaAnchoringChannel } from "@tangle-js/anchors";
import { Arguments } from "yargs";
import { getNetworkParams } from "../commonParams";

export default class FetchMsgCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const node = getNetworkParams(args).network;

    const seed = args.seed as string;

    try {
      // Channel contains the channel address + the announce messageID
      const channelID = args.channelID as string;
      const channel = await IotaAnchoringChannel.fromID(channelID, { node }).bind(seed);

      const anchorageID = args.anchorageID as string;
      const msgID = args.msgID as string;
      const result = await channel.fetch(anchorageID, msgID);

      const output = {
        message: result.message.toString(),
        publicKey: result.pk,
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
