import { AnchoringChannelErrorNames } from "../src/errors/anchoringChannelErrorNames";
import { SeedHelper } from "../src/helpers/seedHelper";
import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";
import { network, newChannel, newEncryptedChannel, newPrivateChannel } from "./testCommon";

describe("Fetch Messages", () => {
    const MSG_1 = "Hello 1";
    const MSG_2 = "Hello 2";

    let msgID1: string;
    let msgID2: string;

    let authorSeed: string;

    let channelID: string;

    let encryptedChannelID: string;
    let encryptedMsgID1: string;
    let encryptedMsgID2: string;

    let privateChannelID: string;
    let privateChannelSeed: string;
    let privateMsgID1: string;
    let privateMsgID2: string;

    beforeAll(async () => {
        const channel = await newChannel(network);
        channelID = channel.channelID;
        authorSeed = channel.seed;

        console.log("ChannelID:", channelID);
        console.log("Author's Seed:", authorSeed);

        // First message
        const result = await channel.anchor(Buffer.from(MSG_1), channel.firstAnchorageID);
        msgID1 = result.msgID;

        // Second message (using the same subscriber's seed)
        const result2 = await channel.anchor(Buffer.from(MSG_2), result.msgID);
        msgID2 = result2.msgID;

        const encryptedChannel = await newEncryptedChannel(network);
        console.log("Encrypted ChannelID:", encryptedChannel.channelID);
        encryptedChannelID = encryptedChannel.channelID;

        // First encrypted message
        const encResult = await encryptedChannel.anchor(Buffer.from(MSG_1), encryptedChannel.firstAnchorageID);
        encryptedMsgID1 = encResult.msgID;

        // Second message (using the same subscriber's seed)
        const encResult2 = await encryptedChannel.anchor(Buffer.from(MSG_2), encResult.msgID);
        encryptedMsgID2 = encResult2.msgID;

        const privateChannel = await newPrivateChannel(network);
        console.log("Private ChannelID:", privateChannel.channelID);
        privateChannelID = privateChannel.channelID;
        privateChannelSeed = privateChannel.seed;

        // First message on the private channel
        const privateResult = await privateChannel.anchor(Buffer.from(MSG_1), privateChannel.firstAnchorageID);
        privateMsgID1 = privateResult.msgID;

        // Second message on the private channel
        const privateResult2 = await privateChannel.anchor(Buffer.from(MSG_2), privateResult.msgID);
        privateMsgID2 = privateResult2.msgID;
    });

    test("should fetch message anchored to the first anchorage", async () => {
        const channel = await IotaAnchoringChannel.fromID(channelID, { node: network }).bind(SeedHelper.generateSeed());

        const response = await channel.fetch(channel.firstAnchorageID, msgID1);

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.message.toString()).toBe(MSG_1);
    });

    test.skip("should fetch message anchored to the first anchorage - same channel, no msgID", async () => {
        const channel = await IotaAnchoringChannel.bindNew();
        await channel.anchor(Buffer.from(MSG_2), channel.firstAnchorageID);

        const response = await channel.fetch(channel.firstAnchorageID);

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.message.toString()).toBe(MSG_2);
    });

    test("should fetch message anchored to the first anchorage - encrypted", async () => {
        const channel = await IotaAnchoringChannel.fromID(
            encryptedChannelID, { node: network, encrypted: true }
        ).bind(SeedHelper.generateSeed());

        const response = await channel.fetch(channel.firstAnchorageID, encryptedMsgID1);

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.message.toString()).toBe(MSG_1);
    });

    test("should fetch message anchored to the first anchorage - private", async () => {
        const channel = await IotaAnchoringChannel.fromID(
            privateChannelID, { node: network, encrypted: true, isPrivate: true }
        ).bind(privateChannelSeed);

        const response = await channel.fetch(channel.firstAnchorageID, privateMsgID1);

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.message.toString()).toBe(MSG_1);
    });

    test("should fetch message anchored to non-first anchorage", async () => {
        const channel = await IotaAnchoringChannel.fromID(channelID, { node: network }).bind(SeedHelper.generateSeed());

        const response = await channel.fetch(msgID1, msgID2);

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.message.toString()).toBe(MSG_2);
    });

    test("should fetch message anchored to non-first anchorage - encrypted", async () => {
        const channel = await IotaAnchoringChannel.fromID(
            encryptedChannelID, { node: network, encrypted: true }
        ).bind(SeedHelper.generateSeed());

        const response = await channel.fetch(encryptedMsgID1, encryptedMsgID2);

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.message.toString()).toBe(MSG_2);
    });

    test("should fetch message anchored to non-first anchorage - private", async () => {
        const channel = await IotaAnchoringChannel.fromID(
            privateChannelID, { node: network, encrypted: true, isPrivate: true }
        ).bind(privateChannelSeed);

        const response = await channel.fetch(privateMsgID1, privateMsgID2);

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.message.toString()).toBe(MSG_2);
    });

    test("should fetch message anchored to non-first after fetching the first one", async () => {
        const channel = await IotaAnchoringChannel.fromID(channelID, { node: network }).bind(SeedHelper.generateSeed());

        const response1 = await channel.fetch(channel.firstAnchorageID, msgID1);
        const response2 = await channel.fetch(msgID1, msgID2);

        expect(response1.message.toString()).toBe(MSG_1);
        expect(response2.message.toString()).toBe(MSG_2);
    });

    test("should perform a cycle of anchor, fetch with the same channel object", async () => {
        const channel = await newChannel(network);

        const anchorResponse = await channel.anchor(Buffer.from(MSG_1), channel.firstAnchorageID);

        const fetchResponse = await channel.fetch(channel.firstAnchorageID, anchorResponse.msgID);

        expect(fetchResponse.message.toString()).toBe(MSG_1);
    });

    test("should perform a cycle of anchor, fetch with the same channel object - private non encrypted",
        async () => {
            const channel = await IotaAnchoringChannel.bindNew({ node: network, isPrivate: true });

            const anchorResponse = await channel.anchor(Buffer.from(MSG_1), channel.firstAnchorageID);

            const fetchResponse = await channel.fetch(channel.firstAnchorageID, anchorResponse.msgID);

            expect(fetchResponse.message.toString()).toBe(MSG_1);
        });

    test("should perform a cycle of anchor, anchor, skip, fetch with the same channel object", async () => {
        const channel = await newChannel(network);

        const anchorResponse1 = await channel.anchor(Buffer.from(MSG_1), channel.firstAnchorageID);
        const anchorResponse2 = await channel.anchor(Buffer.from(MSG_2), anchorResponse1.msgID);

        const fetchResponse = await channel.fetch(anchorResponse1.msgID, anchorResponse2.msgID);

        expect(fetchResponse.message.toString()).toBe(MSG_2);
    });

    test("should perform a cycle of anchor, anchor, skip, fetch with the same channel object - encrypted",
        async () => {
            const channel = await newEncryptedChannel(network);

            const anchorResponse1 = await channel.anchor(Buffer.from(MSG_1), channel.firstAnchorageID);
            const anchorResponse2 = await channel.anchor(Buffer.from(MSG_2), anchorResponse1.msgID);

            const fetchResponse = await channel.fetch(anchorResponse1.msgID, anchorResponse2.msgID);

            expect(fetchResponse.message.toString()).toBe(MSG_2);
        });

    test("should perform a cycle of anchor, anchor, skip, fetch with the same channel object - private",
        async () => {
            const channel = await newPrivateChannel(network);

            const anchorResponse1 = await channel.anchor(Buffer.from(MSG_1), channel.firstAnchorageID);
            const anchorResponse2 = await channel.anchor(Buffer.from(MSG_2), anchorResponse1.msgID);

            const fetchResponse = await channel.fetch(anchorResponse1.msgID, anchorResponse2.msgID);

            expect(fetchResponse.message.toString()).toBe(MSG_2);
        });

    test("should fetch without passing the message ID. First anchorage", async () => {
        const channel = await IotaAnchoringChannel.fromID(channelID, { node: network }).bind(SeedHelper.generateSeed());

        const response = await channel.fetch(channel.firstAnchorageID);

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.msgID).toBe(msgID1);
        expect(response.message.toString()).toBe(MSG_1);
    });

    test("should fetch without passing the message ID. Non-first anchorage", async () => {
        const channel = await IotaAnchoringChannel.fromID(channelID, { node: network }).bind(SeedHelper.generateSeed());

        const response = await channel.fetch(msgID1);

        expect(response.msgID).toBe(msgID2);
        expect(response.message.toString()).toBe(MSG_2);
    });

    test("should fetch using fetchNext method", async () => {
        const channel = await IotaAnchoringChannel.fromID(channelID, { node: network }).bind(SeedHelper.generateSeed());

        const response = await channel.fetchNext();

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.msgID).toBe(msgID1);
        expect(response.message.toString()).toBe(MSG_1);

        const response2 = await channel.fetchNext();

        expect(response2.msgID).toBe(msgID2);
        expect(response2.message.toString()).toBe(MSG_2);

        const response3 = await channel.fetchNext();
        expect(response3).toBeUndefined();
    });

    test("should fetch using fetchNext method - private", async () => {
        const channel = await IotaAnchoringChannel.fromID(
            privateChannelID, { node: network, isPrivate: true, encrypted: true }
        ).bind(privateChannelSeed);

        const response = await channel.fetchNext();

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.msgID).toBe(privateMsgID1);
        expect(response.message.toString()).toBe(MSG_1);

        const response2 = await channel.fetchNext();

        expect(response2.msgID).toBe(privateMsgID2);
        expect(response2.message.toString()).toBe(MSG_2);

        const response3 = await channel.fetchNext();
        expect(response3).toBeUndefined();
    });

    test("should fetch - private preshared keys", async () => {
        // Preshared key used
        const presharedKey = "11aa11aa11aa11aa11aa11aa11aa11aa";

        const channel = await IotaAnchoringChannel.bindNew(
            { node: network, isPrivate: true, encrypted: true, presharedKeys: [presharedKey] });

        const anchorResp = await channel.anchor(Buffer.from(MSG_1), channel.firstAnchorageID);
        const msgID = anchorResp.msgID;

        const boundChannel = await IotaAnchoringChannel.fromID(channel.channelID,
            { node: network, isPrivate: true, encrypted: true }).bind(SeedHelper.generateSeed(20), presharedKey);

        const response = await boundChannel.fetchNext();

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.msgID).toBe(msgID);
        expect(response.message.toString()).toBe(MSG_1);

        const response2 = await boundChannel.fetchNext();
        expect(response2).toBeUndefined();
    });

    test("should return undefined if fetchNext on an empty channel", async () => {
        const channel = await newChannel(network);

        const response = await channel.fetchNext();

        expect(response).toBeUndefined();
    });

    test("should only fetch one with 'fetchNext' if generated with different seeds", async () => {
        const channel = await newChannel(network);
        const response = await channel.anchor(Buffer.from(MSG_1), channel.firstAnchorageID);

        // Here we are anchoring with a different seed
        const channel2 =
            await IotaAnchoringChannel.fromID(channel.channelID, { node: network }).bind(SeedHelper.generateSeed());
        await channel2.anchor(Buffer.from(MSG_2), response.msgID);

        const channel3 =
            await IotaAnchoringChannel.fromID(channel.channelID, { node: network }).bind(SeedHelper.generateSeed());

        const fetchNextResponse = await channel3.fetchNext();
        expect(fetchNextResponse.message.toString()).toBe(MSG_1);

        const fetchNextResponse2 = await channel3.fetchNext();
        // As the message was anchored with a different seed (i.e. different subscribers)
        expect(fetchNextResponse2).toBeUndefined();
    });

    test("should throw error if fetching a message from an anchorage which does not have anything", async () => {
        const channel = await newChannel(network);
        // First message
        const result = await channel.anchor(Buffer.from(MSG_1), channel.firstAnchorageID);

        try {
            await channel.fetch(result.msgID, msgID2);
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.MSG_NOT_FOUND);
            return;
        }

        fail("No exception thrown");
    });

    test("should throw error if fetching a message which anchorage does not exist", async () => {
        const channel = await IotaAnchoringChannel.fromID(channelID, { node: network }).bind(SeedHelper.generateSeed());

        try {
            await channel.fetch("1234567abcdef", msgID1);
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.ANCHORAGE_NOT_FOUND);
            return;
        }

        fail("No exception thrown");
    });

    test("should throw error if fetching a message which does not exist", async () => {
        const channel = await IotaAnchoringChannel.fromID(channelID, { node: network }).bind(SeedHelper.generateSeed());

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
        const channelDetails = await IotaAnchoringChannel.create(SeedHelper.generateSeed(), { node: network });
        const channel = IotaAnchoringChannel.fromID(channelDetails.channelID, { node: network });

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
