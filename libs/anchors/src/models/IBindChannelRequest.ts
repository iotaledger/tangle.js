import { StreamsClient } from "../iotaStreams";

export interface IBindChannelRequest {
    /** The client */
    client: InstanceType<typeof StreamsClient>;
    /** The channel ID 'channel_address:announce_msg_id:key_load_msg_id' */
    channelID: string;
    /** Whether the channel is encrypted */
    encrypted: boolean;
     /** Whether the channel is private */
     isPrivate: boolean;
    /** The seed */
    seed: string;
    /** Preshared key */
    presharedKey?: string;
}
