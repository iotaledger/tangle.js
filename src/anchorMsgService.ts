/* eslint-disable no-duplicate-imports */
import { Address, Subscriber, SendOptions } from "wasm-node/iota_streams_wasm";
import { ChannelHelper } from "./channelHelper";
import { IAnchoringRequest } from "./IAnchoringRequest";
import { IAnchoringResult } from "./IAnchoringResult";

export default class AnchorMsgService {
  public static async anchor(request: IAnchoringRequest): Promise<IAnchoringResult> {
    const options = new SendOptions(request.node, true);
    const subs = new Subscriber(request.seed, options.clone());

    // Channel contains the channel address and the announce messageID
    const channel = request.channelID;
    const announceLink = Address.from_string(channel);

    await subs.clone().receive_announcement(announceLink);

    // The address of the anchorage message
    const anchorageID = request.anchorageID;

    // Iteratively retrieve messages until We find the one to anchor to
    const { found, anchorageLink } = await ChannelHelper.findAnchorage(subs, anchorageID);

    if (!found) {
      throw new Error(`The anchorage point ${anchorageID} has not been found on the Channel`);
    }

    const publicPayload = Buffer.from(request.message);
    const maskedPayload = Buffer.from("");

    const anchoringResp = await subs.clone().send_signed_packet(anchorageLink,
      publicPayload, maskedPayload);

    const msgID = anchoringResp.get_link().msg_id;

    return {
      seed: request.seed,
      channel,
      anchorageID,
      msgID
    };
  }
}
