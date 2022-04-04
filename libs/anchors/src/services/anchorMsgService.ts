/* eslint-disable no-duplicate-imports */
import { AnchoringChannelError } from "../errors/anchoringChannelError";
import { AnchoringChannelErrorNames } from "../errors/anchoringChannelErrorNames";
import { ChannelHelper } from "../helpers/channelHelper";
import { Address } from "../iotaStreams";
import { IAnchoringRequest } from "../models/IAnchoringRequest";
import { IAnchoringResult } from "../models/IAnchoringResult";

type Address = InstanceType<typeof Address>;

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
  public static async anchor(request: IAnchoringRequest): Promise<IAnchoringResult> {
    try {
      // The address of the anchorage message
      const anchorageID = request.anchorageID;

      const encrypted = request.encrypted;
      const isPrivate = request.isPrivate;

      // The subscriber
      const subs = request.subscriber;

      const components = request.channelID.split(":");
      let targetMsgID = components[1];
      if (isPrivate) {
        targetMsgID = components[2];
      }

      let anchorageLink: Address;
      let found = true;

      if (targetMsgID === anchorageID) {
        anchorageLink = ChannelHelper.parseAddress(`${components[0]}:${targetMsgID}`);
      } else {
        // If we are not anchoring to the announce Msg ID we find the proper anchorage
        // Iteratively retrieve messages until We find the one to anchor to
        ({ found, anchorageLink } = await ChannelHelper.findAnchorage(subs, anchorageID));

        if (!found) {
          throw new AnchoringChannelError(AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND,
            `The anchorage ${anchorageID} has not been found on the channel`);
        }
      }

      let publicPayload = request.message;
      let maskedPayload = Buffer.from("");
      if (encrypted) {
        maskedPayload = publicPayload;
        publicPayload = Buffer.from("");
      }

      const anchoringResp = await subs.clone().send_signed_packet(anchorageLink,
        publicPayload, maskedPayload);

      const msgID = anchoringResp.link.copy().msgId.toString();

      return {
        anchorageID,
        msgID
      };
    } catch (error) {
      if (error.type === AnchoringChannelError.ERR_TYPE) {
        throw error;
      }
      throw new AnchoringChannelError(AnchoringChannelErrorNames.OTHER_ERROR,
        `Error while anchoring to ${request.anchorageID} on ${request.channelID} -> ${error}`);
    }
  }
}
