import { resolve as iotaDidResolve } from "@iota/identity-wasm/node";
import { Arguments } from "yargs";

export default class ResolveDidCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const did = args.did as string;

    try {
      const document = await iotaDidResolve(did, {
        network: "mainnet"
      });

      console.log(document);
    } catch (error) {
      console.error("Error:", error);
      return false;
    }

    return true;
  }
}
