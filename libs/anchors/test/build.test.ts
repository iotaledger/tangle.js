import { AnchoringChannelErrorNames } from "../src/errors/anchoringChannelErrorNames";
import { SeedHelper } from "../src/helpers/seedHelper";
import { IotaAnchoringChannel } from "../src/iotaAnchoringChannel";
import { assertChannel, network } from "./testCommon";


describe("Build Anchoring Channel", () => {
    const presharedKey = "11aa11aa11aa11aa11aa11aa11aa11aa";

    test("should create and bind an Anchoring Channel on the mainnet", async () => {
        const anchoringChannel = await IotaAnchoringChannel.bindNew();

        assertChannel(anchoringChannel, false, false);
        expect(anchoringChannel.node).toBe(IotaAnchoringChannel.DEFAULT_NODE);
    });

    test("should create an anchoring channel", async () => {
        const seed = SeedHelper.generateSeed();
        const channelDetails = await IotaAnchoringChannel.create(seed);

        expect(channelDetails.authorPubKey).toBeDefined();
        expect(channelDetails.authorSeed).toBe(seed);
        expect(channelDetails.encrypted).toBe(false);
        expect(channelDetails.isPrivate).toBe(false);

        expect(channelDetails.node).toBe(IotaAnchoringChannel.DEFAULT_NODE);
        expect(channelDetails.channelID).toBeDefined();
        expect(channelDetails.channelAddr).toBe(channelDetails.channelID.split(":")[0]);
        expect(channelDetails.firstAnchorageID).toBe(channelDetails.channelID.split(":")[1]);
        // Only two components in a non-encrypted channel
        expect(channelDetails.channelID.split(":")[2]).toBeUndefined();
    });

    test("should create an anchoring channel - encrypted", async () => {
        const seed = SeedHelper.generateSeed();
        const channelDetails = await IotaAnchoringChannel.create(seed, { encrypted: true });

        expect(channelDetails.authorPubKey).toBeDefined();
        expect(channelDetails.authorSeed).toBe(seed);
        expect(channelDetails.encrypted).toBe(true);
        expect(channelDetails.isPrivate).toBe(false);

        expect(channelDetails.node).toBe(IotaAnchoringChannel.DEFAULT_NODE);
        expect(channelDetails.channelID).toBeDefined();
        expect(channelDetails.channelAddr).toBe(channelDetails.channelID.split(":")[0]);
        expect(channelDetails.firstAnchorageID).toBe(channelDetails.channelID.split(":")[1]);
    });

    test("should create an anchoring channel - private", async () => {
        const seed = SeedHelper.generateSeed();
        const channelDetails = await IotaAnchoringChannel.create(seed, { isPrivate: true });

        expect(channelDetails.authorPubKey).toBeDefined();
        expect(channelDetails.authorSeed).toBe(seed);
        expect(channelDetails.encrypted).toBe(false);
        expect(channelDetails.isPrivate).toBe(true);

        expect(channelDetails.node).toBe(IotaAnchoringChannel.DEFAULT_NODE);
        expect(channelDetails.channelID).toBeDefined();
        expect(channelDetails.channelAddr).toBe(channelDetails.channelID.split(":")[0]);
        expect(channelDetails.firstAnchorageID).toBe(channelDetails.channelID.split(":")[2]);
    });

    test("should create an anchoring channel - private and encrypted", async () => {
        const seed = SeedHelper.generateSeed();
        const channelDetails = await IotaAnchoringChannel.create(seed, { isPrivate: true, encrypted: true });

        expect(channelDetails.authorPubKey).toBeDefined();
        expect(channelDetails.authorSeed).toBe(seed);
        expect(channelDetails.encrypted).toBe(true);
        expect(channelDetails.isPrivate).toBe(true);

        expect(channelDetails.node).toBe(IotaAnchoringChannel.DEFAULT_NODE);
        expect(channelDetails.channelID).toBeDefined();
        expect(channelDetails.channelAddr).toBe(channelDetails.channelID.split(":")[0]);
        expect(channelDetails.firstAnchorageID).toBe(channelDetails.channelID.split(":")[2]);
    });

    test("should create an anchoring channel - private and encrypted. preshared keys", async () => {
        const seed = SeedHelper.generateSeed();

        const channelDetails = await IotaAnchoringChannel.create(seed,
            { isPrivate: true, encrypted: true, presharedKeys: [presharedKey] });

        expect(channelDetails.authorPubKey).toBeDefined();
        expect(channelDetails.authorSeed).toBe(seed);
        expect(channelDetails.encrypted).toBe(true);
        expect(channelDetails.isPrivate).toBe(true);

        expect(channelDetails.node).toBe(IotaAnchoringChannel.DEFAULT_NODE);
        expect(channelDetails.channelID).toBeDefined();
        expect(channelDetails.channelAddr).toBe(channelDetails.channelID.split(":")[0]);
        expect(channelDetails.firstAnchorageID).toBe(channelDetails.channelID.split(":")[2]);
    });

    test("should fail creation if the same seed is used", async () => {
        const seed = SeedHelper.generateSeed();
        const channelDetails = await IotaAnchoringChannel.create(seed);

        try {
            await IotaAnchoringChannel.create(channelDetails.authorSeed);
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.OTHER_ERROR);
        }
    });

    test("should instantiate an existing anchoring channel from an ID", async () => {
        const seed = SeedHelper.generateSeed();
        const channelDetails = await IotaAnchoringChannel.create(seed);

        const channel = await IotaAnchoringChannel.fromID(channelDetails.channelID).bind(seed);

        expect(channel.seed).toBe(seed);
        expect(channel.subscriberPubKey).toBe(channelDetails.authorPubKey);
        expect(channel.node).toBe(IotaAnchoringChannel.DEFAULT_NODE);
        expect(channel.channelID).toBe(channelDetails.channelID);
        expect(channel.channelAddr).toBe(channelDetails.channelID.split(":")[0]);
        expect(channel.firstAnchorageID).toBe(channelDetails.channelID.split(":")[1]);
    });

    test("should instantiate an existing anchoring channel from an ID - encrypted and private", async () => {
        const seed = SeedHelper.generateSeed();
        const channelDetails = await IotaAnchoringChannel.create(seed, { isPrivate: true, encrypted: true });

        const channel = await IotaAnchoringChannel.fromID(
            channelDetails.channelID, { encrypted: true, isPrivate: true }
        ).bind(seed);

        expect(channel.seed).toBe(seed);
        expect(channel.encrypted).toBe(true);

        expect(channel.subscriberPubKey).toBe(channelDetails.authorPubKey);
        expect(channel.node).toBe(IotaAnchoringChannel.DEFAULT_NODE);
        expect(channel.channelID).toBe(channelDetails.channelID);
        expect(channel.channelAddr).toBe(channelDetails.channelID.split(":")[0]);
        expect(channel.firstAnchorageID).toBe(channelDetails.channelID.split(":")[2]);
    });

    test("should fail instantiation of an existing private channel from an ID - incorrect seed", async () => {
        const seed = SeedHelper.generateSeed();
        const channelDetails = await IotaAnchoringChannel.create(seed, { isPrivate: true, encrypted: true });

        try {
            await IotaAnchoringChannel.fromID(
                channelDetails.channelID, { encrypted: true, isPrivate: true }
            ).bind(SeedHelper.generateSeed());
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.CHANNEL_BINDING_PERMISSION_ERROR);
            return;
        }

        fail("No exception thrown");
    });

    test("should fail instantiation of an existing private channel from an ID - incorrect PSK", async () => {
        const seed = SeedHelper.generateSeed();
        const channelDetails = await IotaAnchoringChannel.create(seed,
            { isPrivate: true, encrypted: true, presharedKeys: [presharedKey] });

        try {
            const presharedKey2 = "21aa11aa11aa11aa11aa11aa11aa11aa";
            await IotaAnchoringChannel.fromID(
                channelDetails.channelID, { encrypted: true, isPrivate: true }
            ).bind(SeedHelper.generateSeed(), presharedKey2);
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.CHANNEL_BINDING_PERMISSION_ERROR);
            return;
        }

        fail("No exception thrown");
    });

    test("should fail instantiation if passing an ID of a public channel", async () => {
        const seed = SeedHelper.generateSeed();
        const channelDetails = await IotaAnchoringChannel.create(seed);

        try {
            await IotaAnchoringChannel.fromID(
                channelDetails.channelID, { isPrivate: true }
            ).bind(seed);
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR);
            return;
        }

        fail("No exception thrown");
    });

    test("should fail instantiation if passing an ID of a private channel", async () => {
        const seed = SeedHelper.generateSeed();
        const channelDetails = await IotaAnchoringChannel.create(seed, { isPrivate: true });

        try {
            await IotaAnchoringChannel.fromID(channelDetails.channelID).bind(seed);
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR);
            return;
        }

        fail("No exception thrown");
    });

    test("should fail instantiation if passing a PSK on a public channel", async () => {
        const seed = SeedHelper.generateSeed();
        try {
            await IotaAnchoringChannel.create(seed, { isPrivate: false, presharedKeys: [presharedKey] });
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR);
            return;
        }

        fail("No exception thrown");
    });

    test("should fail instantiation if ID is incorrect", async () => {
        const seed = SeedHelper.generateSeed();
        const channelDetails = await IotaAnchoringChannel.create(seed, { node: network });

        try {
            await IotaAnchoringChannel.fromID(channelDetails.channelID).bind(seed);
        } catch (error) {
            expect(error.name).toBe(AnchoringChannelErrorNames.CHANNEL_BINDING_ERROR);
            return;
        }

        fail("No exception thrown");
    });
});
