import { Arguments } from "yargs";

export class ChannelHelper {
    public static getEncrypted(args: Arguments): boolean {
        if (args.encrypted) {
            return true;
        }

        return false;
    }
}
