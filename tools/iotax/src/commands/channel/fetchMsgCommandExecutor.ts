/* eslint-disable no-duplicate-imports */
import { Address, Subscriber, SendOptions } from "wasm-node/iota_streams_wasm";
import { Arguments } from "yargs";
import { isDefined } from "../../globalParams";
import { getNetworkParams } from "../commonParams";
import { ChannelHelper } from "./channelHelper";

export default class FetchMsgCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const node = getNetworkParams(args).network;

    let seed = "";
    if (!isDefined(args, "seed")) {
      seed = ChannelHelper.generateSeed();
    } else {
      seed = args.seed as string;
    }

    try {
      const options = new SendOptions(node, true);
      const subs = new Subscriber(seed, options.clone());

      // Channel contains the channel address + the announce messageID
      const channel = args.channel as string;
      const announceLink = Address.from_string(channel);

      await subs.clone().receive_announcement(announceLink);

      // If there is an anchorageID and no msgID we try to find that message
      // and then fetch from that one on
      // If there is a msgID we could fetch it but that would require SingleDepth channel (not yet available)
      if (isDefined(args, "anchorageID")) {
        const anchorageID = args.anchorageID as string;

        const { found } = await ChannelHelper.findAnchorage(subs, anchorageID);

        if (!found) {
          console.error("Error:", `The anchorage point ${anchorageID} has not been found on the Channel`);
          return false;
        }
      }

      // If there is a messageID now we just receive that message
      // Otherwise we go through the anchoring points and printing the messages found
      if (isDefined(args, "msgID")) {
        const msgID = args.msgID as string;

        const msgLink = Address.from_string(`${channel.split(":")[0]}:${msgID}`);
        const message = await subs.clone().receive_signed_packet(msgLink);
        if (!message) {
          console.error("Error:", `The message ${msgID} has not been found on the Channel`);
          return false;
        }

        this.printMessage(message);
        return true;
      }

      // Iteratively retrieve messages until the end
      let finish = false;
      while (!finish) {
        const messages = await subs.clone().fetch_next_msgs();
        if (!messages || messages.length === 0) {
          finish = true;
          break;
        }
        this.printMessage(messages[0]);
      }
    } catch (error) {
      console.error("Error:", error);
      return false;
    }

    return true;
  }

  /**
   * Prints a message to the standard output
   *
   * @param message The message to be printed
   */
  private static printMessage(message): void {
    // In our case only one message is expected

    const messageContent = Buffer.from(message.get_message().get_public_payload()).toString();
    const msgID = message.get_link().copy().msg_id;
    const pk = message.get_message().get_pk();

    const result = {
      msgID,
      message: messageContent,
      pk
    };
    console.log(result);
  }
}
