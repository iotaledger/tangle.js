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
            const messages = await subs.clone().fetch_next_msgs();
            if (!messages || messages.length === 0) {
                throw new AnchoringChannelError(AnchoringChannelErrorNames.MSG_NOT_FOUND, `There is not message anchored to ${anchorageID}`);
            }
            response = messages[0];
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
        const messages = await subscriber.clone().fetch_next_msgs();
        if (!messages || messages.length === 0) {
            return;
        }
        const msg = messages[0];
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