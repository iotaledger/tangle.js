import AnchoringChannelErrorNames from "../src/errors/anchoringChannelErrorNames";
import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";
import { network, newChannel } from "./testCommon";


describe("Anchor Messages", () => {
    const message = Buffer.from("Hello");

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

    test("should bind to an already existing channel and anchor to a previous message ID", async () => {
        // Channel created
        const channel = await newChannel(network);

        const firstAnchorageID = channel.firstAnchorageID;
        const result = await channel.anchor(message, firstAnchorageID);
        const result2 = await channel.anchor(message, result.msgID);

        // Now a new channel is created bound to the initial one
        const secondChannel = await IotaAnchoringChannel.create(channel.node, channel.seed).bind(channel.channelID);
        // We anchor a message directly to one of the previous message IDs
        const result3 = await secondChannel.anchor(message, result2.msgID);
        expect(result3.msgID).toBeDefined();
    });

    test("should throw error if node not a URL", async () => {
        try {
            IotaAnchoringChannel.create("thisisnotanode");
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.INVALID_NODE);
            return;
        }

        fail("No exception thrown");
    });

    /* Skipped for the moment until there is better error control */
    test.skip("should throw error if node service is not available", async () => {
        try {
            await IotaAnchoringChannel.create("http://example.org").bind();
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.OTHER_ERROR);
            return;
        }

        fail("No exception thrown");
    });

    test("should throw error if channel not bound yet", async () => {
        const channel = IotaAnchoringChannel.create(network);

        expect(channel.firstAnchorageID).toBeUndefined();

        try {
            await channel.anchor(message, "123456789aa");
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.CHANNEL_NOT_BOUND);
            return;
        }

        fail("No exception thrown");
    });

    test("should throw error if trying to bind to an already bound channel", async () => {
        try {
            const channel = await IotaAnchoringChannel.create(network).bind();
            await channel.bind();
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.CHANNEL_ALREADY_BOUND);
            return;
        }

        fail("No exception thrown");
    });


    test("should throw error if trying to bind to an invalid channel ID", async () => {
        try {
            await IotaAnchoringChannel.create(network).bind("aaaaaabbbbbbb");
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR);
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
            expect(error.name).toBe(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR);
            return;
        }

        fail("No exception thrown");
    });

    test("should throw error if anchorageID cannot be found", async () => {
        const channel = await newChannel(network);

        try {
            await channel.anchor(message, "123456789aa");
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND);
            return;
        }

        fail("No exception thrown");
    });
});
