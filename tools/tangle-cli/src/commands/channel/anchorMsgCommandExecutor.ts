/* eslint-disable no-duplicate-imports */
import { IotaAnchoringChannel, ProtocolHelper } from "@tangle-js/anchors";
import { Arguments } from "yargs";
import { getNetworkParams } from "../../globalParams";
import { ChannelHelper } from "./channelHelper";

export default class AnchorMsgCommandExecutor {
    public static async execute(args: Arguments): Promise<boolean> {
        const { node, permanode, explorer } = getNetworkParams(args);
        const encrypted = ChannelHelper.getEncrypted(args);
        const isPrivate = ChannelHelper.getPrivate(args);

        try {
            const seed = args.seed as string;
            const channelID = args.channelID as string;
            // The address of the anchorage message
            const anchorageID = args.anchorageID as string;

            const channel = await IotaAnchoringChannel.fromID(channelID, {
                node,
                permanode,
                encrypted,
                isPrivate
            }).bind(seed);

            const result = await channel.anchor(Buffer.from(args.msg as string), anchorageID);

            const msgIDLayer1 = await ProtocolHelper.getMsgIdL1(channel, result.msgID);

            console.log({
                channelID: channel.channelID,
                ...result,
                seed,
                publicKey: channel.authorPubKey,
                explorerURL: `${explorer}/message/${msgIDLayer1}`
            });
        } catch (error) {
            console.error("Error:", error);
            return false;
        }

        return true;
    }
}
