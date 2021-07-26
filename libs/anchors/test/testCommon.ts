import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";

// Chrysalis testnet
export const network = "https://api.lb-0.testnet.chrysalis2.com";

/**
 * Creates a new anchoring channel
 *
 *  @param node The node on which the chanel is created
 *
 * @returns the anchoring channel
 */
 export async function newChannel(node: string): Promise<IotaAnchoringChannel> {
    const anchoringChannel = await IotaAnchoringChannel.bindNew({ node });

    assertChannel(anchoringChannel);

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

    assertChannel(anchoringChannel, true);

    return anchoringChannel;
}

/**
 * Asserts an anchoring channel
 *
 * @param anchoringChannel The anchoring channel to assert
 * @param encrypted whether it should be encrypted or not
 */
export function assertChannel(anchoringChannel: IotaAnchoringChannel, encrypted: boolean = false) {
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
