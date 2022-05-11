/* eslint-disable no-duplicate-imports */
import type { Subscriber } from "@iota/streams/node/streams.js";
import { AnchoringChannelError } from "../errors/anchoringChannelError";
import { AnchoringChannelErrorNames } from "../errors/anchoringChannelErrorNames";
import { ChannelHelper } from "../helpers/channelHelper";
import type { IFetchRequest } from "../models/IFetchRequest";
import type { IFetchResult } from "../models/IFetchResult";

export default class FetchMsgService {
  public static async fetch(request: IFetchRequest): Promise<IFetchResult> {
    const subs = request.subscriber;

    const components = request.channelID.split(":");
    let targetMsgID = components[1];
    // If it is encrypted the first anchorage is the keyLoad
    if (request.isPrivate) {
      targetMsgID = components[2];
    }

    const anchorageID = request.anchorageID;

    let found = true;

    if (anchorageID !== targetMsgID) {
      ({ found } = await ChannelHelper.findAnchorage(subs, anchorageID));
    }

    if (!found) {
      throw new AnchoringChannelError(AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND,
        `The anchorage point ${anchorageID} has not been found on the channel`);
    }

    const msgID = request.msgID;
    let response;

    // If the messageID is passed we retrieve it
    if (msgID) {
      try {
        const msgLink = ChannelHelper.parseAddress(`${subs.clone().channel_address()}:${msgID}`);
        response = await subs.clone().receive_signed_packet(msgLink);
      } catch {
        throw new AnchoringChannelError(AnchoringChannelErrorNames.MSG_NOT_FOUND,
          `The message ${msgID} has not been found on the Channel`);
      }
    } else {
      // Otherwise we just fetch the next message
      response = await subs.clone().fetchNextMsg();

      if (!response) {
        throw new AnchoringChannelError(AnchoringChannelErrorNames.MSG_NOT_FOUND,
          `There is no message anchored to ${anchorageID}`);
      }
    }

    let messageContent = Buffer.from(response.message.get_public_payload());

    if (request.encrypted) {
      messageContent = Buffer.from(response.message.get_masked_payload());
    }

    const receivedMsgID = response.link.copy().msgId.toString();

    if (msgID && receivedMsgID !== msgID) {
      throw new Error("Requested message ID and fetched message ID are not equal");
    }
    const pk = response.message.get_identifier();

    return {
      message: messageContent,
      msgID: receivedMsgID,
      pk
    };
  }

  public static async receive(request: IFetchRequest): Promise<IFetchResult> {
    const subs = request.subscriber;

    const msgID = request.msgID;

    let response;

    const msgLink = ChannelHelper.parseAddress(`${subs.clone().channel_address()}:${msgID}`);
    try {
      response = await subs.clone().receive_signed_packet(msgLink);
    } catch {
      throw new AnchoringChannelError(AnchoringChannelErrorNames.MSG_NOT_FOUND,
        `The message ${msgID} has not been found on the Channel`);
    }

    // In the future we would need to check that the anchorageID is the expected one

    let messageContent = Buffer.from(response.message.get_public_payload());
    if (request.encrypted) {
      messageContent = Buffer.from(response.message.get_masked_payload());
    }

    const pk = response.message.get_identifier();

    return {
      message: messageContent,
      msgID,
      pk
    };
  }

  public static async fetchNext(subscriber: Subscriber, encrypted: boolean): Promise<IFetchResult | undefined> {
    const msg = await subscriber.clone().fetchNextMsg();

    if (!msg) {
      return;
    }

    const result: IFetchResult = {
      msgID: msg.link.copy().msgId.toString(),
      pk: msg.message.get_identifier(),
      message: Buffer.from(msg.message.get_public_payload())
    };

    if (encrypted) {
      result.message = Buffer.from(msg.message.get_masked_payload());
    }

    return result;
  }
}
