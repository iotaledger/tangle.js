/* eslint-disable no-duplicate-imports */
import { IotaAnchoringChannel } from "@tangle-js/anchors";
import { Arguments } from "yargs";
import { getNetworkParams } from "../commonParams";
import { ChannelHelper } from "./channelHelper";

export default class FetchMsgCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const { network: node, permanode } = getNetworkParams(args);
    const encrypted = ChannelHelper.getEncrypted(args);
    const isPrivate = ChannelHelper.getPrivate(args);

    const seed = args.seed as string;
    const presharedKey = args.psk as string;

    try {
      // Channel contains the channel address + the announce messageID
      const channelID = args.channelID as string;
      const channel = await IotaAnchoringChannel.fromID(channelID,
        { node, permanode, encrypted, isPrivate }).bind(seed, presharedKey);

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
