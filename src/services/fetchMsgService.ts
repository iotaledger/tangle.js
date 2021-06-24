/* eslint-disable no-duplicate-imports */
import { Address } from "@jmcanterafonseca-iota/iota_streams_wasm";
import AnchoringChannelError from "../errors/anchoringChannelError";
import AnchoringChannelErrorNames from "../errors/anchoringChannelErrorNames";
import { ChannelHelper } from "../helpers/channelHelper";
import { IFetchRequest } from "../models/IFetchRequest";
import { IFetchResult } from "../models/IFetchResult";

export default class FetchMsgService {
  public static async fetch(request: IFetchRequest): Promise<IFetchResult> {
    const subs = request.subscriber;

    const announceMsgID = request.channelID.split(":")[1];

    const anchorageID = request.anchorageID;

    let found = true;

    if (anchorageID !== announceMsgID) {
      ({ found } = await ChannelHelper.findAnchorage(subs, anchorageID));
    }

    if (!found) {
      throw new AnchoringChannelError(AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND,
        `The anchorage point ${anchorageID} has not been found on the channel`);
    }

    const msgID = request.msgID;

    const msgLink = Address.from_string(`${subs.clone().channel_address()}:${msgID}`);
    let response;
    try {
      response = await subs.clone().receive_signed_packet(msgLink);
    } catch {
      throw new AnchoringChannelError(AnchoringChannelErrorNames.MSG_NOT_FOUND,
        `The message ${msgID} has not been found on the Channel`);
    }

    const messageContent = Buffer.from(response.get_message().get_public_payload()).toString();
    const receivedMsgID = response.get_link().copy().msg_id;

    if (receivedMsgID !== msgID) {
      throw new Error("Requested message ID and fetched message ID are not equal");
    }
    const pk = response.get_message().get_pk();

    return {
      message: messageContent,
      msgID,
      pk
    };
  }
}
