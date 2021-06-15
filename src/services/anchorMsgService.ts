/* eslint-disable no-duplicate-imports */
import { Address } from "wasm-node/iota_streams_wasm";
import AnchorageError from "../errors/anchorError";
import AnchorErrorNames from "../errors/anchorErrorNames";
import { ChannelHelper } from "../helpers/channelHelper";
import { IAnchoringRequest } from "../models/IAnchoringRequest";
import { IAnchoringResult } from "../models/IAnchoringResult";

/**
 * Service to deal with message anchors
 * 
 */
export default class AnchorMsgService {
  /**
   * Anchors a message to an anchorage
   * 
   * @param request The anchoring details
   * 
   * @returns The result or error
   */
  public static async anchor(request: IAnchoringRequest): Promise<IAnchoringResult | Error> {
    try {
      // The address of the anchorage message
      const anchorageID = request.anchorageID;

      // The subscriber
      const subs = request.subscriber;

      const announceMsgID = request.channelID.split(":")[1];

      let anchorageLink: Address;
      let found = true;

      if (announceMsgID === anchorageID) {
        anchorageLink = Address.from_string(request.channelID).copy();
      } else {
         // If we are not anchoring to the announce Msg ID we find the proper anchorage
        // Iteratively retrieve messages until We find the one to anchor to
        ({ found, anchorageLink } = await ChannelHelper.findAnchorage(subs, anchorageID));

        if (!found) {
          return new AnchorageError(AnchorErrorNames.ANCHORAGE_NOT_FOUND,
            `The anchorage ${anchorageID} has not been found on the channel`);
        }
      }

      const publicPayload = Buffer.from(request.message);
      const maskedPayload = Buffer.from("");

      const anchoringResp = await subs.clone().send_signed_packet(anchorageLink,
        publicPayload, maskedPayload);

      const msgID = anchoringResp.get_link().msg_id;

      return {
        anchorageID,
        msgID
      };
    } catch (error) {
      console.log(error);
      return new Error(error);
    }
  }
}
