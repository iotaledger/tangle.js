import type { IChannelOptions } from "./IChannelOptions";

export interface IChannelCreateOptions extends IChannelOptions {
    /**
     *  List of preshared keys that will give access to the channel
     * (isPrivate) must be equal to true
     */
     presharedKeys?: string[];
}
