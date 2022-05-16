import { AnchoringChannelError } from "../errors/anchoringChannelError";
import { AnchoringChannelErrorNames } from "../errors/anchoringChannelErrorNames";
import { ChannelHelper } from "../helpers/channelHelper";
export default class FetchMsgService {
    static async fetch(request) {
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
            throw new AnchoringChannelError(AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND, `The anchorage point ${anchorageID} has not been found on the channel`);
        }
        const msgID = request.msgID;
        let response;
        // If the messageID is passed we retrieve it
        if (msgID) {
            try {
                const msgLink = ChannelHelper.parseAddress(`${subs.clone().channel_address()}:${msgID}`);
                response = await subs.clone().receive_signed_packet(msgLink);
            }
            catch {
                throw new AnchoringChannelError(AnchoringChannelErrorNames.MSG_NOT_FOUND, `The message ${msgID} has not been found on the Channel`);
            }
        }
        else {
            // Otherwise we just fetch the next message
            response = await subs.clone().fetchNextMsg();
            if (!response) {
                throw new AnchoringChannelError(AnchoringChannelErrorNames.MSG_NOT_FOUND, `There is no message anchored to ${anchorageID}`);
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
    static async receive(request) {
        const subs = request.subscriber;
        const msgID = request.msgID;
        let response;
        const msgLink = ChannelHelper.parseAddress(`${subs.clone().channel_address()}:${msgID}`);
        try {
            response = await subs.clone().receive_signed_packet(msgLink);
        }
        catch {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.MSG_NOT_FOUND, `The message ${msgID} has not been found on the Channel`);
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
    static async fetchNext(subscriber, encrypted) {
        const msg = await subscriber.clone().fetchNextMsg();
        if (!msg) {
            return;
        }
        const result = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2hNc2dTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL2ZldGNoTXNnU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUN4RSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNsRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFJekQsTUFBTSxDQUFDLE9BQU8sT0FBTyxlQUFlO0lBQzNCLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQXNCO1FBQzlDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7UUFFaEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEQsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLHdEQUF3RDtRQUN4RCxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFDckIsV0FBVyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM3QjtRQUVELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7UUFFeEMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBRWpCLElBQUksV0FBVyxLQUFLLFdBQVcsRUFBRTtZQUMvQixDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1NBQ3BFO1FBRUQsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNWLE1BQU0sSUFBSSxxQkFBcUIsQ0FBQywwQkFBMEIsQ0FBQyxtQkFBbUIsRUFDNUUsdUJBQXVCLFdBQVcsb0NBQW9DLENBQUMsQ0FBQztTQUMzRTtRQUVELE1BQU0sS0FB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