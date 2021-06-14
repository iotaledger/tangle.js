import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";

describe("Anchor Messages", () => {
    const message = "Hello";
    // Chrysalis testnet
    const network = "https://api.lb-0.testnet.chrysalis2.com";

    test("Anchor a message to the initial anchorage", async () => {
        const anchoringChannel = await IotaAnchoringChannel.create(network).bind();
        expect(anchoringChannel.seed).toBeDefined();
        expect(anchoringChannel.channelID).toBeDefined();

        const announceMsgID = anchoringChannel.announceMsgID;

        const result = await anchoringChannel.anchor(message, announceMsgID);

        expect(result.anchorageID).toBe(announceMsgID);
        expect(result.channel.split(":")[1]).toEqual(result.anchorageID);
        expect(result.msgID).toBeDefined();
    });

    test("Anchor a message to an anchorage point different than announce", async () => {
        const channel = await IotaAnchoringChannel.create(network).bind();

        const announceMsgID = channel.announceMsgID;
        const result = await channel.anchor(message, announceMsgID);

        const result2 = await channel.anchor(message, result.msgID);

        expect(result2.anchorageID).toBe(result.msgID);
        expect(result2.channel.split(":")[1]).toEqual(result.anchorageID);
        expect(result2.msgID).toBeDefined();
    });
});
