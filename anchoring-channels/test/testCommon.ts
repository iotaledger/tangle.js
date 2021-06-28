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
    const anchoringChannel = await IotaAnchoringChannel.create(node).bind();

    expect(anchoringChannel.seed).toBeDefined();
    expect(anchoringChannel.channelID).toBeDefined();
    expect(anchoringChannel.channelAddr).toBeDefined();
    expect(anchoringChannel.firstAnchorageID).toBeDefined();

    return anchoringChannel;
}
