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
    const anchoringChannel = await IotaAnchoringChannel.create(undefined, node).bind();

    expect(anchoringChannel.seed).toBeDefined();
    expect(anchoringChannel.channelID).toBeDefined();
    expect(anchoringChannel.channelAddr).toBeDefined();

    expect(anchoringChannel.firstAnchorageID).toBeDefined();

    expect(anchoringChannel.authorPubKey).toBeDefined();
    expect(anchoringChannel.publisherPubKey).toBeDefined();

    // If a channel is new the publisher an author pub keys shall be the same
    expect(anchoringChannel.publisherPubKey).toBe(anchoringChannel.authorPubKey);

    return anchoringChannel;
}
