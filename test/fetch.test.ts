import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";
import { network, newChannel } from "./testCommon";

describe("Fetch Messages", () => {
    const MSG_1 = "Hello 1";
    const MSG_2 = "Hello 2";

    let channel: IotaAnchoringChannel;

    beforeAll(async () => {
        channel = await newChannel(network);
        const result = await channel.anchor(MSG_1, channel.firstAnchorageID);
        await channel.anchor(MSG_2, result.msgID);
    });

    test("should fetch message anchored to the first anchorage", async () => {
    });

    test("should fetch message anchored to non-first anchorage", async () => {
    });

    test("should fetch message anchored to non-first after fetching the first one", async () => {
    });

    test("should throw error if fetching a message from an anchorage which does not have anything", async () => {
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
