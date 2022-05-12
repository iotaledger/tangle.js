import { Anchors } from "../src/anchors";
import { AnchoringChannelErrorNames } from "../src/errors/anchoringChannelErrorNames";
import { SeedHelper } from "../src/helpers/seedHelper";
import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";
import { network, newChannel, newEncryptedChannel, newPrivateChannel } from "./testCommon";


describe("Anchor Messages", () => {
    const message = Buffer.from("Hello");

    beforeAll(async () => {
       await Anchors.initialize();
    });

    test("should anchor a message to the initial anchorage", async () => {
        const anchoringChannel = await newChannel(network);

        const firstAnchorageID = anchoringChannel.firstAnchorageID;

        const result = await anchoringChannel.anchor(message, firstAnchorageID);

        expect(result.anchorageID).toBe(firstAnchorageID);
        expect(result.msgID).toBeDefined();
    });

    test("should anchor a message to the initial anchorage - encrypted", async () => {
        const anchoringChannel = await newEncryptedChannel(network);

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

    test("should anchor a message to an anchorage different than the first one - private", async () => {
        const channel = await newPrivateChannel(network);

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
        const secondChannel = await
            IotaAnchoringChannel.fromID(channel.channelID, { node: channel.node }).bind(channel.seed);

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
        const secondChannel = await
            IotaAnchoringChannel.fromID(channel.channelID, { node: channel.node }).bind(channel.seed);
        // We anchor a message directly to one of the previous message IDs
        const result3 = await secondChannel.anchor(message, result2.msgID);
        expect(result3.msgID).toBeDefined();
    });

    test("should bind to an already existing channel and anchor to a previous message ID - private", async () => {
        // Channel created
        const channel = await newPrivateChannel(network);

        const firstAnchorageID = channel.firstAnchorageID;
        const result = await channel.anchor(message, firstAnchorageID);
        const result2 = await channel.anchor(message, result.msgID);

        // Now a new channel is created bound to the initial one
        const secondChannel = await
            IotaAnchoringChannel.fromID(
                channel.channelID, { node: channel.node, encrypted: channel.encrypted, isPrivate: channel.isPrivate }
            ).bind(channel.seed);
        // We anchor a message directly to one of the previous message IDs
        const result3 = await secondChannel.anchor(message, result2.msgID);
        expect(result3.msgID).toBeDefined();
    });

    test("should throw error if node not a URL", async () => {
        try {
            await IotaAnchoringChannel.create("seed1", { node: "thisisnotanode" });
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.INVALID_NODE);
            return;
        }

        fail("No exception thrown");
    });

    // Skipped for the moment until there is better error control
    test.skip("should throw error if node service is not available", async () => {
        try {
            await IotaAnchoringChannel.create("seed1", { node: "http://example.org" });
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.OTHER_ERROR);
            return;
        }

        fail("No exception thrown");
    });

    test("should throw error if channel not bound yet", async () => {
        const channelDetails = await IotaAnchoringChannel.create(SeedHelper.generateSeed(), { node: network });
        const channel = IotaAnchoringChannel.fromID(channelDetails.channelID, { node: network });

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
            const channel = await newChannel(network);
            await channel.bind(SeedHelper.generateSeed());
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.CHANNEL_ALREADY_BOUND);
            return;
        }

        fail("No exception thrown");
    });


    test("should throw error if trying to instantiate a channel from an invalid channel ID", async () => {
        try {
            IotaAnchoringChannel.fromID("aaaaaabbbbbbb", { node: network });
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
            const channel = IotaAnchoringChannel.fromID(channelID, { node: network });
            await channel.bind(SeedHelper.generateSeed());
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
