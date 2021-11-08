import { IIndexationPayload, SingleNodeClient } from "@iota/iota.js";
import { Converter } from "@iota/util.js";
import { Arguments } from "yargs";
import { getNetworkParams } from "../commonParams";

export default class GetMsgCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    try {
      const client = new SingleNodeClient(getNetworkParams(args).node);

      const msgID = args.msgID as string;

      const message = await client.message(msgID);
      const payload = message.payload as IIndexationPayload;

      console.log(Converter.hexToUtf8(payload.data));
    } catch (error) {
      console.error("Error:", error);
      return false;
    }

    return true;
  }
}
