/* eslint-disable no-duplicate-imports */
import { Address, Subscriber, SendOptions } from "wasm-node/iota_streams_wasm";
import { ChannelHelper } from "./channelHelper";
import { IFetchRequest } from "./IFetchRequest";
import { IFetchResult } from "./IFetchResult";

export default class FetchMsgService {
  public static async fetch(request: IFetchRequest): Promise<IFetchResult> {
    const node = request.node;

    const seed = request.seed;

    const options = new SendOptions(node, true);
    const subs = new Subscriber(seed, options.clone());

    // Channel contains the channel address + the announce messageID
    const channel = request.channelID;
    const announceLink = Address.from_string(channel);

    await subs.clone().receive_announcement(announceLink);

    const anchorageID = request.anchorageID;

    const { found } = await ChannelHelper.findAnchorage(subs, anchorageID);

    if (!found) {
      throw new Error(`The anchorage point ${anchorageID} has not been found on the Channel`);
    }

    const msgID = request.msgID;

    const msgLink = Address.from_string(`${request.channelAddress}:${msgID}`);
    const message = await subs.clone().receive_signed_packet(msgLink);
    if (!message) {
      throw new Error(`The message ${msgID} has not been found on the Channel`);
    }

    const messageContent = Buffer.from(message.get_message().get_public_payload()).toString();
    const receivedMsgID = message.get_link().copy().msg_id;

    if (receivedMsgID !== msgID) {
      throw new Error("Requested message ID and fethed message ID are not equal");
    }
    const pk = message.get_message().get_pk();

    return {
      message: messageContent,
      msgID,
      pk
    };
  }
}
