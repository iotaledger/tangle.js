import { SeedHelper } from "../src/helpers/seedHelper";
import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";
import { assertChannel } from "./testCommon";


describe("Build Anchoring Channel", () => {
    test("should build an Anchoring Channel on the mainnet", async () => {
        const anchoringChannel = await IotaAnchoringChannel.buildNew();

        assertChannel(anchoringChannel);
        expect(anchoringChannel.node).toBe(IotaAnchoringChannel.DEFAULT_NODE);
    });

    test("should create an anchoring channel", async () => {
        const seed = SeedHelper.generateSeed();
        const channelDetails = await IotaAnchoringChannel.create(seed);

        expect(channelDetails.authorPubKey).toBeDefined();
        expect(channelDetails.authorSeed).toBe(seed);
        expect(channelDetails.node).toBe(IotaAnchoringChannel.DEFAULT_NODE);
        expect(channelDetails.channelID).toBeDefined();
        expect(channelDetails.firstAnchorageID).toBe(channelDetails.channelID.split(":")[1]);
    });

    test("should instantiate an existing anchoring channel from an ID", async () => {
        const seed = SeedHelper.generateSeed();
        const channelDetails = await IotaAnchoringChannel.create(seed);

        const channel = await IotaAnchoringChannel.fromID(channelDetails.channelID).bind(seed);

        expect(channel.seed).toBe(seed);
        expect(channel.publisherPubKey).toBe(channelDetails.authorPubKey);
        expect(channel.node).toBe(IotaAnchoringChannel.DEFAULT_NODE);
        expect(channel.channelID).toBe(channelDetails.channelID);
        expect(channel.channelAddr).toBe(channelDetails.channelID.split(":")[0]);
        expect(channel.firstAnchorageID).toBe(channelDetails.channelID.split(":")[1]);
    });
});
