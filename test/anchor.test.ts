import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";

describe("Anchor Messages", () => {
    const message = "Hello";
    // Chrysalis testnet
    const network = "https://api.lb-0.testnet.chrysalis2.com";

    test("Anchor a message to the initial anchorage", async () => {
        const channel = await IotaAnchoringChannel.create(network).bind();
        expect(channel.seed).toBeDefined();

        const announceMsgID = channel.announceMsgID;

        console.log(announceMsgID);

        const result = await channel.anchor(message, announceMsgID);

        expect(result.anchorageID).toBe(announceMsgID);
        expect(result.channel.split(":")[1]).toEqual(result.anchorageID);
        expect(result.msgID).toBeDefined();
    });
});
