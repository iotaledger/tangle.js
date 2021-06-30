import { Converter, SingleNodeClient, IMessage, IIndexationPayload, INDEXATION_PAYLOAD_TYPE } from "@iota/iota.js";
import { NeonPowProvider } from "@iota/pow-neon.js";
import { Arguments } from "yargs";
import { getNetworkParams, providerName } from "../commonParams";

export default class SubmitMsgCommandExecutor {
    public static async execute(args: Arguments): Promise<boolean> {
        const node = getNetworkParams(args).network;

        try {
            const client = new SingleNodeClient(node, { powProvider: new NeonPowProvider() });
            const msgContent = args.msg as string;
            const index = args.index as string;

            const payload: IIndexationPayload = {
                type: INDEXATION_PAYLOAD_TYPE,
                data: Converter.utf8ToHex(msgContent),
                index: Converter.utf8ToHex(index)
            };

            const tips = await client.tips();

            const parentMessageIDs = tips.tipMessageIds.slice(0, 2);

            const message: IMessage = {
                payload,
                parentMessageIds: parentMessageIDs
            };

            // The message ID is returned
            const msgID = await client.messageSubmit(message);

            console.log({
                msgID,
                parentMessageIDs,
                explorerUrl: `https://explorer.iota.org/${providerName(node)}/message/${msgID}`
            });
        } catch (error) {
            console.error("Error:", error);
            return false;
        }

        return true;
    }
}
