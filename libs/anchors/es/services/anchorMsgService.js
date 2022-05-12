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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yTXNnU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9hbmNob3JNc2dTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUl6RDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsT0FBTyxPQUFPLGdCQUFnQjtJQUNuQzs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQTBCO1FBQ25ELElBQUk7WUFDRix1Q0FBdUM7WUFDdkMsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztZQUV4QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO1lBQ3BDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7WUFFcEMsaUJBQWlCO1lBQ2pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFFaEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEQsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksU0FBUyxFQUFFO2dCQUNiLFdBQVcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDN0I7WUFFRCxJQUFJLGFBQXNCLENBQUM7WUFDM0IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBRWpCLElBQUksV0FBVyxLQUFLLFdBQVcsRUFBRTtnQkFDL0IsYUFBYSxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQzthQUMvRTtpQkFBTTtnQkFDTCw4RUFBOEU7Z0JBQzlFLG1FQUFtRTtnQkFDbkUsQ0FBQyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsR0FBRyxNQUFNLGFBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBRWxGLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ1YsTUFBTSxJQUFJLHFCQUFxQixDQUFDLDBCQUEwQixDQUFDLG1CQUFtQixFQUM1RSxpQkFBaUIsV0FBVyxvQ0FBb0MsQ0FBQyxDQUFDO2lCQUNyRTthQUNGO1lBRUQsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztZQUNwQyxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLElBQUksU0FBUyxFQUFFO2dCQUNiLGFBQWEsR0FBRyxhQUFhLENBQUM7Z0JBQzlCLGFBQWEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ2pDO1lBRUQsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUN2RSxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFaEMsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFekQsT0FBTztnQkFDTCxXQUFXO2dCQUNYLEtBQUs7YUFDTixDQUFDO1NBQ0g7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNkLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2pELE1BQU0sS0FBSyxDQUFDO2FBQ2I7WUFDRCxNQUFNLElBQUkscUJBQXFCLENBQUMsMEJBQTBCLENBQUMsV0FBVyxFQUNwRSw0QkFBNEIsT0FBTyxDQUFDLFdBQVcsT0FBTyxPQUFPLENBQUMsU0FBUyxPQUFPLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDMUY7SUFDSCxDQUFDO0NBQ0YifQ==