import { AnchoringChannelError } from "../errors/anchoringChannelError";
import { AnchoringChannelErrorNames } from "../errors/anchoringChannelErrorNames";
import { ChannelHelper } from "../helpers/channelHelper";
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
    static async anchor(request) {
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
            let anchorageLink;
            let found = true;
            if (targetMsgID === anchorageID) {
                anchorageLink = ChannelHelper.parseAddress(`${components[0]}:${targetMsgID}`);
            }
            else {
                // If we are not anchoring to the announce Msg ID we find the proper anchorage
                // Iteratively retrieve messages until We find the one to anchor to
                ({ found, anchorageLink } = await ChannelHelper.findAnchorage(subs, anchorageID));
                if (!found) {
                    throw new AnchoringChannelError(AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND, `The anchorage ${anchorageID} has not been found on the channel`);
                }
            }
            let publicPayload = request.message;
            let maskedPayload = Buffer.from("");
            if (encrypted) {
                maskedPayload = publicPayload;
                publicPayload = Buffer.from("");
            }
            const anchoringResp = await subs.clone().send_signed_packet(anchorageLink, publicPayload, maskedPayload);
            const msgID = anchoringResp.link.copy().msgId.toString();
            return {
                anchorageID,
                msgID
            };
        }
        catch (error) {
            if (error.type === AnchoringChannelError.ERR_TYPE) {
                throw error;
            }
            throw new AnchoringChannelError(AnchoringChannelErrorNames.OTHER_ERROR, `Error while anchoring to ${request.anchorageID} on ${request.channelID} -> ${error}`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yTXNnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9hbmNob3JNc2dTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUl6RDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsT0FBTyxPQUFPLGdCQUFnQjtJQUNuQzs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUEwQjtRQUNuRCxJQUFJO1lBQ0YsdUNBQXVDO1lBQ3ZDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7WUFFeEMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztZQUNwQyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO1lBRXBDLGlCQUFpQjtZQUNqQixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBRWhDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hELElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLFNBQVMsRUFBRTtnQkFDYixXQUFXLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzdCO1lBRUQsSUFBSSxhQUFzQixDQUFDO1lBQzNCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztZQUVqQixJQUFJLFdBQVcsS0FBSyxXQUFXLEVBQUU7Z0JBQy9CLGFBQWEsR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUM7YUFDL0U7aUJBQU07Z0JBQ0wsOEVBQThFO2dCQUM5RSxtRUFBbUU7Z0JBQ25FLENBQUMsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLEdBQUcsTUFBTSxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUVsRixJQUFJLENBQUMsS0FBSyxFQUFFO29CQUNWLE1BQU0sSUFBSSxxQkFBcUIsQ0FBQywwQkFBMEIsQ0FBQyxtQkFBbUIsRUFDNUUsaUJBQWlCLFdBQVcsb0NBQW9DLENBQUMsQ0FBQztpQkFDckU7YUFDRjtZQUVELElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7WUFDcEMsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNwQyxJQUFJLFNBQVMsRUFBRTtnQkFDYixhQUFhLEdBQUcsYUFBYSxDQUFDO2dCQUM5QixhQUFhLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNqQztZQUVELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFDdkUsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRWhDLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRXpELE9BQU87Z0JBQ0wsV0FBVztnQkFDWCxLQUFLO2FBQ04sQ0FBQztTQUNIO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUsscUJBQXFCLENBQUMsUUFBUSxFQUFFO2dCQUNqRCxNQUFNLEtBQUssQ0FBQzthQUNiO1lBQ0QsTUFBTSxJQUFJLHFCQUFxQixDQUFDLDBCQUEwQixDQUFDLFdBQVcsRUFDcEUsNEJBQTRCLE9BQU8sQ0FBQyxXQUFXLE9BQU8sT0FBTyxDQUFDLFNBQVMsT0FBTyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQzFGO0lBQ0gsQ0FBQztDQUNGIn0=