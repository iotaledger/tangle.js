/* eslint-disable no-duplicate-imports */
import { Address, Author, Subscriber, ChannelType, SendOptions } from "wasm-node/iota_streams_wasm";
import { Arguments } from "yargs";
import { isDefined } from "../../globalParams";
import { getNetworkParams } from "../commonParams";
import { ChannelHelper } from "./channelHelper";

export default class AnchorMsgCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const node = getNetworkParams(args).network;

    let seed = "";
    if (!isDefined(args, "seed")) {
      seed = ChannelHelper.generateSeed();
    } else {
      seed = args.seed as string;
    }

    if (!isDefined(args, "channel")) {
      return this.anchorMsgAsAuthor(node, seed, args);
    }

    return this.anchorMsgAsSubscriber(node, seed, args);
  }


  /**
   *  Anchors the message as Author
   *
   * @param node Node to be used
   * @param seed Seed to be used
   * @param args Command line arguments
   * @returns boolean indicating success or error
   */
  private static async anchorMsgAsAuthor(node: string, seed: string, args: Arguments): Promise<boolean> {
    try {
      const options = new SendOptions(node, true);
      const auth = new Author(seed, options.clone(), ChannelType.SingleBranch);

      const response = await auth.clone().send_announce();
      const announceLink = response.get_link();
      const anchorageID = announceLink.msg_id;

      const publicPayload = Buffer.from(args.msg as string);
      const maskedPayload = Buffer.from("");

      const anchoringResp = await auth.clone().send_signed_packet(announceLink,
        publicPayload, maskedPayload);

      const msgID = anchoringResp.get_link().msg_id;

      const result = {
        seed,
        channel: `${auth.channel_address()}:${anchorageID}`,
        anchorageID,
        msgID
      };

      console.log(result);
    } catch (error) {
      console.error("Error:", error);
      return false;
    }

    return true;
  }

  /**
   *  Anchors the message as subscriber
   *
   * @param node Node to be used
   * @param seed Seed to be used
   * @param args Command line arguments
   * @returns boolean indicating success or error
   */
  private static async anchorMsgAsSubscriber(node: string, seed: string, args: Arguments): Promise<boolean> {
    try {
      const options = new SendOptions(node, true);
      const subs = new Subscriber(seed, options.clone());

      // Channel contains the channel address and the announce messageID
      const channel = args.channel as string;
      const announceLink = Address.from_string(channel);

      await subs.clone().receive_announcement(announceLink);

      // The address of the anchorage message
      const anchorageID = args.anchorageID as string;

      // Iteratively retrieve messages until We find the one to anchor to
      const { found, anchorageLink } = await ChannelHelper.findAnchorage(subs, anchorageID);

      if (!found) {
        console.error("Error:", `The anchorage point ${anchorageID} has not been found on the Channel`);
        return false;
      }

      const publicPayload = Buffer.from(args.msg as string);
      const maskedPayload = Buffer.from("");

      const anchoringResp = await subs.clone().send_signed_packet(anchorageLink,
        publicPayload, maskedPayload);

      const msgID = anchoringResp.get_link().msg_id;

      const result = {
        seed,
        channel,
        anchorageID,
        msgID
      };

      console.log(result);
    } catch (error) {
      console.error("Error:", error);
      return false;
    }

    return true;
  }
}
