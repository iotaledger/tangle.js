import { AnchoringChannelErrorNames } from "../src/errors/anchoringChannelErrorNames";
import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";
import { network, newChannel } from "./testCommon";

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

    beforeAll(async () => {
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
    });

    test("should receive message when only announce has been seen", async () => {
        const channel = await IotaAnchoringChannel.create(network).bind(channelID);

        const response = await channel.receive(msgID1, channel.firstAnchorageID);

        expect(response.message).toBe(MSG_1);
    });

    test("should receive messages one by one", async () => {
        const channel = await IotaAnchoringChannel.create(network).bind(channelID);

        const msgIDs = [msgID1, msgID2, msgID3];
        const msgs = [MSG_1, MSG_2, MSG_3];

        let anchorage = channel.firstAnchorageID;

        let index = 0;
        for (const msgID of msgIDs) {
            const response = await channel.receive(msgID, anchorage);
            expect(response.message).toBe(msgs[index++]);
            anchorage = msgID;
        }
    });

    test("should not receive message if its anchorage has not been seen yet on the channel", async () => {
        const channel = await IotaAnchoringChannel.create(network).bind(channelID);

        try {
            await channel.receive(msgID2, msgID1);
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.MSG_NOT_FOUND);
            return;
        }

        fail("No exception thrown");
    });
});
