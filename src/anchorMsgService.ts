/* eslint-disable no-duplicate-imports */
import { Address, Subscriber, SendOptions } from "wasm-node/iota_streams_wasm";
import AnchorageError from "./anchorError";
import AnchorErrorNames from "./anchorErrorNames";
import { ChannelHelper } from "./channelHelper";
import { IAnchoringRequest } from "./IAnchoringRequest";
import { IAnchoringResult } from "./IAnchoringResult";

export default class AnchorMsgService {
  public static async anchor(request: IAnchoringRequest): Promise<IAnchoringResult | Error> {
    try {
      const options = new SendOptions(request.node, true);
      const subs = new Subscriber(request.seed, options.clone());

      // Channel contains the channel address and the announce messageID
      const channel = request.channelID;
      const announceLink = Address.from_string(channel).copy();

      // Saving the announce link just in case it is the anchorage link
      let anchorageLink = announceLink.copy();

      await subs.clone().receive_announcement(announceLink);

      // The address of the anchorage message
      const anchorageID = request.anchorageID;

      let found = true;

      // If we are not anchoring to the announce Msg ID we find the proper anchorage
      if (anchorageLink.msg_id !== anchorageID) {
        // Iteratively retrieve messages until We find the one to anchor to
        ({ found, anchorageLink } = await ChannelHelper.findAnchorage(subs, anchorageID));

        if (!found) {
          return new AnchorageError(AnchorErrorNames.ANCHORAGE_NOT_FOUND,
            `The anchorage point ${anchorageID} has not been found on the Channel`);
        }
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
    } catch (error) {
      console.log(error);
      return new Error(error);
    }
  }
}
