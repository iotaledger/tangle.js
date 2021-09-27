/* eslint-disable no-duplicate-imports */
import { IotaAnchoringChannel, ProtocolHelper } from "@tangle-js/anchors";
import { Arguments } from "yargs";
import { getNetworkParams, providerName } from "../commonParams";

export default class AnchorMsgCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const node = getNetworkParams(args).network;

    try {
      const seed = args.seed as string;
      const channelID = args.channelID as string;
      // The address of the anchorage message
      const anchorageID = args.anchorageID as string;

      const channel = await IotaAnchoringChannel.fromID(channelID, { node }).bind(seed);

      const result = await channel.anchor(Buffer.from(args.msg as string), anchorageID);

      const msgIDLayer1 = await ProtocolHelper.getL1MsgId(channel, result.msgID);

      console.log({
        channelID: channel.channelID,
        ...result,
        seed,
        publicKey: channel.authorPubKey,
        explorerURL: `https://explorer.iota.org/${providerName(node)}/message/${msgIDLayer1}`
      });
    } catch (error) {
      console.error("Error:", error);
      return false;
    }

    return true;
  }
}
