import AnchorErrorNames from "../src/anchorErrorNames";
import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";

/**
 * Creates a new anchoring channel
 *
 *  @param network The network on which the chanel is created
 *
 * @returns the anchoring channel
 */
 async function newChannel(network: string): Promise<IotaAnchoringChannel> {
    const anchoringChannel = await IotaAnchoringChannel.create(network).bind();
    expect(anchoringChannel.seed).toBeDefined();
    expect(anchoringChannel.channelID).toBeDefined();
    expect(anchoringChannel.channelAddr).toBeDefined();
    expect(anchoringChannel.firstAnchorageID).toBeDefined();

    return anchoringChannel;
}

describe("Anchor Messages", () => {
    const message = "Hello";
    // Chrysalis testnet
    const network = "https://api.lb-0.testnet.chrysalis2.com";

    test("should anchor a message to the initial anchorage", async () => {
        const anchoringChannel = await newChannel(network);

        const firstAnchorageID = anchoringChannel.firstAnchorageID;

        const result = await anchoringChannel.anchor(message, firstAnchorageID);

        expect(result.anchorageID).toBe(firstAnchorageID);
        expect(result.channel.split(":")[1]).toEqual(result.anchorageID);
        expect(result.msgID).toBeDefined();
    });

    test("should anchor a message to an anchorage point different than announce", async () => {
        const channel = await newChannel(network);

        const firstAnchorageID = channel.firstAnchorageID;
        const result = await channel.anchor(message, firstAnchorageID);

        const result2 = await channel.anchor(message, result.msgID);

        expect(result2.anchorageID).toBe(result.msgID);
        expect(result2.channel.split(":")[1]).toEqual(result.anchorageID);
        expect(result2.msgID).toBeDefined();
    });

    test("should throw error if channel not bound", async () => {
        const channel = IotaAnchoringChannel.create(network);

        expect(channel.firstAnchorageID).toBeUndefined();

        try {
            await channel.anchor(message, "123456789aa");
        } catch (error) {
            expect(error.name).toBe(AnchorErrorNames.CHANNEL_NOT_BOUND);
            return;
        }

        fail("No exception thrown");
    });

    test("should throw error if anchorageID can not be found", async () => {
        const channel = await newChannel(network);

        try {
            await channel.anchor(message, "123456789aa");
        } catch (error) {
            expect(error.name).toBe(AnchorErrorNames.ANCHORAGE_NOT_FOUND);
            return;
        }

        fail("No exception thrown");
    });
});
