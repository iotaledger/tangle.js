/* eslint-disable no-duplicate-imports */
import { IotaAnchoringChannel, SeedHelper } from "@tangle-js/anchors";
import { Arguments } from "yargs";
import { getNetworkParams } from "../../globalParams";
import { ChannelHelper } from "./channelHelper";

export default class InspectChannelCommandExecutor {
    public static async execute(args: Arguments): Promise<boolean> {
        const { node, permanode } = getNetworkParams(args);
        const encrypted = ChannelHelper.getEncrypted(args);
        const isPrivate = ChannelHelper.getPrivate(args);

        let seed = args.seed as string;
        const presharedKey = args.psk as string;

        if (!seed) {
            seed = SeedHelper.generateSeed(25);
        }

        try {
            // Channel contains the channel address + the announce messageID
            const channelID = args.channelID as string;

            const channel = await IotaAnchoringChannel.fromID(channelID, {
                node,
                permanode,
                encrypted,
                isPrivate
            }).bind(seed, presharedKey);

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
