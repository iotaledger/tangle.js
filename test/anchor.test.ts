import AnchorErrorNames from "../src/errors/anchorErrorNames";
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
        expect(result.msgID).toBeDefined();
    });

    test("should anchor a message to an anchorage different than the first one", async () => {
        const channel = await newChannel(network);

        const firstAnchorageID = channel.firstAnchorageID;
        const result = await channel.anchor(message, firstAnchorageID);

        const result2 = await channel.anchor(message, result.msgID);

        expect(result2.anchorageID).toBe(result.msgID);
        expect(result2.msgID).toBeDefined();
    });

    test("should bind to an already existing channel", async () => {
        // Channel created
        const channel = await newChannel(network);

        // Now a new channel is created bound to the initial one
        const secondChannel = await IotaAnchoringChannel.create(channel.node, channel.seed).bind(channel.channelID);

        // As they are the same the first anchorage must be the same as well
        expect(secondChannel.firstAnchorageID).toBe(channel.firstAnchorageID);
        expect(secondChannel.channelAddr).toBe(channel.channelAddr);
        expect(secondChannel.channelID).toBe(channel.channelID);

        const result = await secondChannel.anchor(message, secondChannel.firstAnchorageID);
        expect(result.msgID).toBeDefined();
    });

    test("should throw error if channel not bound yet", async () => {
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

    test("should throw error if trying to bind to an already bound channel", async () => {
        try {
            const channel = await IotaAnchoringChannel.create(network).bind();
            await channel.bind();
        } catch (error) {
            expect(error.name).toBe(AnchorErrorNames.CHANNEL_ALREADY_BOUND);
            return;
        }

        fail("No exception thrown");
    });


    test("should throw error if trying to bind to an invalid channel ID", async () => {
        try {
            await IotaAnchoringChannel.create(network).bind("aaaaaabbbbbbb");
        } catch (error) {
            expect(error.name).toBe(AnchorErrorNames.CHANNEL_BINDING_ERROR);
            return;
        }

        fail("No exception thrown");
    });

    test("should throw error if trying to bind to a non existent channel", async () => {
        const channelID =
            "3cd8745f5f9dee90955ba2c9b107bab40de018e84970da7e2c154cef4f066a2e0000000000000000:e2b49a4bb22c495c9bf8e185";

        try {
            await IotaAnchoringChannel.create(network).bind(channelID);
        } catch (error) {
            expect(error.name).toBe(AnchorErrorNames.CHANNEL_BINDING_ERROR);
            return;
        }

        fail("No exception thrown");
    });

    test("should throw error if anchorageID cannot be found", async () => {
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
