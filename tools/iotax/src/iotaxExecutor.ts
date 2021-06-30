import { Arguments } from "yargs";
import commandRegistry from "./commandRegistry";

export default class IotaxExecutor {
  public static execute(args: Arguments): void {
    console.log(args, commandRegistry);
  }
}
