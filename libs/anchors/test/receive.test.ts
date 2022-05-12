import { Anchors } from "../src/anchors";
import { AnchoringChannelErrorNames } from "../src/errors/anchoringChannelErrorNames";
import { SeedHelper } from "../src/helpers/seedHelper";
import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";
import { network, newChannel, newEncryptedChannel, newPrivateChannel } from "./testCommon";

// No search is made over the channel
/* channel.receive(msgID, anchorageID) --> Just receives the message i.e the messages has had to be seen */
/* It is needed to verify that the anchorageID is the correct one */

/* When anchoring we need to avoid anchoring two messages to the same anchorageID */
/* Streams Team - Ask for: When receiving a message receive the to what message such message is linked to */
/* Streams Team - Ask for: Generate an exception when anchoring to messages to the same anchorage */
/* Streams Team - fetch_next_msgs starting from a particular one, like rewinding the channel to that point */

describe("Receive Messages", () => {
    const MSG_1 = "Hello 1";
    const MSG_2 = "Hello 2";
    const MSG_3 = "Hello 3";

    let msgID1: string;
    let msgID2: string;
    let msgID3: string;

    let channelID: string;

    let encryptedChannelID: string;
    let encryptedMsgID1: string;

    let privateChannelID: string;
    let privateChannelSeed: string;
    let privateMsgID1: string;

    beforeAll(async () => {
        await Anchors.initialize();

        const channel = await newChannel(network);
        channelID = channel.channelID;

        // First message
        const result = await channel.anchor(Buffer.from(MSG_1), channel.firstAnchorageID);
        msgID1 = result.msgID;

        // Second message
        const result2 = await channel.anchor(Buffer.from(MSG_2), result.msgID);
        msgID2 = result2.msgID;

        // Third message
        const result3 = await channel.anchor(Buffer.from(MSG_3), result2.msgID);
        msgID3 = result3.msgID;

        const encryptedChannel = await newEncryptedChannel(network);
        encryptedChannelID = encryptedChannel.channelID;

        const encResult = await encryptedChannel.anchor(Buffer.from(MSG_1), encryptedChannel.firstAnchorageID);
        encryptedMsgID1 = encResult.msgID;

        const privateChannel = await newPrivateChannel(network);
        privateChannelID = privateChannel.channelID;
        privateChannelSeed = privateChannel.seed;

        const privateResult = await privateChannel.anchor(Buffer.from(MSG_1), privateChannel.firstAnchorageID);
        privateMsgID1 = privateResult.msgID;
    });

    test("should receive message when only announce has been seen", async () => {
        const channel = await IotaAnchoringChannel.fromID(channelID, { node: network }).bind(SeedHelper.generateSeed());

        const response = await channel.receive(msgID1, channel.firstAnchorageID);

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.message.toString()).toBe(MSG_1);
    });

    test("should receive message when only announce and keyLoad has been seen", async () => {
        const channel = await IotaAnchoringChannel.fromID(
            privateChannelID, { node: network, encrypted: true, isPrivate: true }
        ).bind(privateChannelSeed);

        const response = await channel.receive(privateMsgID1, channel.firstAnchorageID);

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.message.toString()).toBe(MSG_1);
    });

    test("should receive message from private non-encrypted channel", async () => {
        const channel = await IotaAnchoringChannel.bindNew({ node: network, isPrivate: true });

        const anchorResponse = await channel.anchor(Buffer.from(MSG_1), channel.firstAnchorageID);

        const response = await channel.receive(anchorResponse.msgID, channel.firstAnchorageID);

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.message.toString()).toBe(MSG_1);
    });

    test("should receive message from encrypted channel", async () => {
        const channel = await IotaAnchoringChannel.fromID(
            encryptedChannelID, { node: network, encrypted: true }
        ).bind(SeedHelper.generateSeed());

        const response = await channel.receive(encryptedMsgID1, channel.firstAnchorageID);

        expect(response.pk).toBe(channel.authorPubKey);
        expect(response.message.toString()).toBe(MSG_1);
    });

    test("should receive messages one by one", async () => {
        const channel = await IotaAnchoringChannel.fromID(channelID, { node: network }).bind(SeedHelper.generateSeed());

        const msgIDs = [msgID1, msgID2, msgID3];
        const msgs = [MSG_1, MSG_2, MSG_3];

        let anchorage = channel.firstAnchorageID;

        let index = 0;
        for (const msgID of msgIDs) {
            const response = await channel.receive(msgID, anchorage);
            expect(response.message.toString()).toBe(msgs[index++]);
            anchorage = msgID;
        }
    });

    test("should not receive message if its anchorage has not been seen yet on the channel", async () => {
        const channel = await IotaAnchoringChannel.fromID(channelID, { node: network }).bind(SeedHelper.generateSeed());

        try {
            await channel.receive(msgID2, msgID1);
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.MSG_NOT_FOUND);
            return;
        }

        fail("No exception thrown");
    });
});
