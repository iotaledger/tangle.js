import AnchoringChannelErrorNames from "../src/errors/anchoringChannelErrorNames";
import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";
import { network, newChannel } from "./testCommon";

describe("Fetch Messages", () => {
    const MSG_1 = "Hello 1";
    const MSG_2 = "Hello 2";

    let msgID1: string;
    let msgID2: string;

    let channelID: string;

    beforeAll(async () => {
        const channel = await newChannel(network);
        channelID = channel.channelID;

        // First message
        const result = await channel.anchor(channel.firstAnchorageID, MSG_1);
        msgID1 = result.msgID;

        // Second message
        const result2 = await channel.anchor(result.msgID, MSG_2);
        msgID2 = result2.msgID;
    });

    test("should fetch message anchored to the first anchorage", async () => {
        const channel = await IotaAnchoringChannel.create(network).bind(channelID);

        const response = await channel.fetch(channel.firstAnchorageID, msgID1);

        expect(response.message).toBe(MSG_1);
    });

    test("should fetch message anchored to non-first anchorage", async () => {
        const channel = await IotaAnchoringChannel.create(network).bind(channelID);

        const response = await channel.fetch(msgID1, msgID2);

        expect(response.message).toBe(MSG_2);
    });

    test("should fetch message anchored to non-first after fetching the first one", async () => {
        const channel = await IotaAnchoringChannel.create(network).bind(channelID);

        const response1 = await channel.fetch(channel.firstAnchorageID, msgID1);
        const response2 = await channel.fetch(msgID1, msgID2);

        expect(response1.message).toBe(MSG_1);
        expect(response2.message).toBe(MSG_2);
    });

    test("should perform a cycle of anchor, fetch with the same channel object", async () => {
        const channel = await newChannel(network);

        const anchorResponse = await channel.anchor(channel.firstAnchorageID, MSG_1);

        const fetchResponse = await channel.fetch(channel.firstAnchorageID, anchorResponse.msgID);

        expect(fetchResponse.message).toBe(MSG_1);
    });

    test("should perform a cycle of anchor, anchor, skip, fetch with the same channel object", async () => {
        const channel = await newChannel(network);

        const anchorResponse1 = await channel.anchor(channel.firstAnchorageID, MSG_1);
        const anchorResponse2 = await channel.anchor(anchorResponse1.msgID, MSG_2);

        const fetchResponse = await channel.fetch(anchorResponse1.msgID, anchorResponse2.msgID);

        expect(fetchResponse.message).toBe(MSG_2);
    });

    test("should fetch without passing the message ID. First anchorage", async () => {
        const channel = await IotaAnchoringChannel.create(network).bind(channelID);

        const response = await channel.fetch(channel.firstAnchorageID);

        expect(response.message).toBe(MSG_1);
    });

    test("should fetch without passing the message ID. Non-first anchorage", async () => {
        const channel = await IotaAnchoringChannel.create(network).bind(channelID);

        const response = await channel.fetch(msgID1);

        expect(response.message).toBe(MSG_2);
    });

    test("should throw error if fetching a message from an anchorage which does not have anything", async () => {
        const channel = await newChannel(network);
        // First message
        const result = await channel.anchor(channel.firstAnchorageID, MSG_1);

        try {
            await channel.fetch(result.msgID, msgID2);
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.MSG_NOT_FOUND);
            return;
        }

        fail("No exception thrown");
    });

    test("should throw error if fetching a message which anchorage does not exist", async () => {
        const channel = await IotaAnchoringChannel.create(network).bind(channelID);

        try {
            await channel.fetch("1234567abcdef", msgID1);
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND);
            return;
        }

        fail("No exception thrown");
    });

    test("should throw error if fetching a message which does not exist", async () => {
        const channel = await IotaAnchoringChannel.create(network).bind(channelID);

        await channel.fetch(channel.firstAnchorageID, msgID1);

        try {
            await channel.fetch(msgID1, "12345678abcdef");
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.MSG_NOT_FOUND);
            return;
        }

        fail("No exception thrown");
    });

    test("should throw error if channel is not bound yet", async () => {
        const channel = IotaAnchoringChannel.create(network);

        try {
            await channel.fetch(msgID1, msgID2);
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.CHANNEL_NOT_BOUND);
            return;
        }

        fail("No exception thrown");
    });

    test("should throw error if channel only contains the first anchorage", async () => {
        const channel = await newChannel(network);

        try {
            await channel.fetch(channel.firstAnchorageID, msgID1);
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.MSG_NOT_FOUND);
            return;
        }

        fail("No exception thrown");
    });
});
