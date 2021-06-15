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
        const result = await channel.anchor(MSG_1, channel.firstAnchorageID);
        msgID1 = result.msgID;

        // Second message
        const result2 = await channel.anchor(MSG_2, result.msgID);
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

    test("should throw error if fetching a message from an anchorage which does not have anything", async () => {
        const channel = await newChannel(network);

        try {
            await channel.fetch(channel.firstAnchorageID, msgID1);
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.MSG_NOT_FOUND);
        }
    });

    test("should throw error if fetching a message which anchorage does not exist", async () => {

    });

    test("should throw error if fetching a message which does not exist", async () => {
    });

    test("should throw error if channel is not bound yet", async () => {
    });

    test("should throw error if channel only contains the first anchorage", async () => {
    });
});
