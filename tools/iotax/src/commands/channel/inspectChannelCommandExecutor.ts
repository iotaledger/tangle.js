/* eslint-disable no-duplicate-imports */
import { IotaAnchoringChannel } from "@tangle.js/anchors";
import { Arguments } from "yargs";
import { getNetworkParams } from "../commonParams";

export default class InspectChannelCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const node = getNetworkParams(args).network;

    const seed = args.seed as string;

    try {
      // Channel contains the channel address + the announce messageID
      const channelID = args.channelID as string;

      const channel = await IotaAnchoringChannel.create(seed, node).bind(channelID);

      let messageDetails = await channel.fetchNext();
      while (messageDetails !== undefined) {
        const output = {
          message: messageDetails.message.toString(),
          publicKey: messageDetails.pk,
          msgID: messageDetails.msgID
        };
        console.log(output);

        messageDetails = await channel.fetchNext();
      }
    } catch (error) {
      console.error("Error:", error);
      return false;
    }

    return true;
  }
}
