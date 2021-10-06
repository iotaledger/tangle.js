import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";

// Chrysalis testnet
export const network = "https://api.lb-0.h.chrysalis-devnet.iota.cafe";
// export const network = "https://chrysalis-nodes.evrythng.iota.org";

/**
 * Creates a new anchoring channel
 *
 *  @param node The node on which the chanel is created
 *
 * @returns the anchoring channel
 */
 export async function newChannel(node: string): Promise<IotaAnchoringChannel> {
    const anchoringChannel = await IotaAnchoringChannel.bindNew({ node });

    assertChannel(anchoringChannel, false, false);

    return anchoringChannel;
}

/**
 * Creates a new encrypted anchoring channel
 *
 *  @param node The node on which the chanel is created
 *
 * @returns the anchoring channel
 */
 export async function newEncryptedChannel(node: string): Promise<IotaAnchoringChannel> {
    const anchoringChannel = await IotaAnchoringChannel.bindNew({ node, encrypted: true });

    assertChannel(anchoringChannel, false, true);

    return anchoringChannel;
}

/**
 * Creates a new private and encrypted anchoring channel
 *
 *  @param node The node on which the chanel is created
 *
 * @returns the anchoring channel
 */
 export async function newPrivateChannel(node: string): Promise<IotaAnchoringChannel> {
    const anchoringChannel = await IotaAnchoringChannel.bindNew({ node, isPrivate: true, encrypted: true });

    assertChannel(anchoringChannel, true, true);

    return anchoringChannel;
}

/**
 * Asserts an anchoring channel
 *
 * @param anchoringChannel The anchoring channel to assert
 * @param isPrivate should it be a private channel?
 * @param encrypted whether it should be encrypted or not
 */
export function assertChannel(anchoringChannel: IotaAnchoringChannel, isPrivate: boolean, encrypted: boolean) {
    expect(anchoringChannel.seed).toBeDefined();
    expect(anchoringChannel.encrypted).toBe(encrypted);

    expect(anchoringChannel.channelID).toBeDefined();
    expect(anchoringChannel.channelAddr).toBeDefined();

    expect(anchoringChannel.firstAnchorageID).toBeDefined();

    expect(anchoringChannel.authorPubKey).toBeDefined();
    expect(anchoringChannel.subscriberPubKey).toBeDefined();

    // If a channel is new the publisher an author pub keys shall be the same
    expect(anchoringChannel.subscriberPubKey).toBe(anchoringChannel.authorPubKey);
}
