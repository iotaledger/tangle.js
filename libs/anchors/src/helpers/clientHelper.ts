import { StreamsClient, ClientBuilder } from "@iota/streams/node/streams.js";

export class ClientHelper {
    public static readonly DEFAULT_NODE = "https://chrysalis-nodes.iota.org";

    public static readonly DEFAULT_PERMANODE = "https://chrysalis-chronicle.iota.org/api/mainnet/";

    /**
     * Returns a client for Streams using the node and permanode
     *
     * @param node Node endpoint URL
     * @param permanode endpoint URL
     *
     * @returns StreamsClient
     */
    public static async getClient(node: string, permanode?: string): Promise<StreamsClient> {
        // iota.rs client
        let builder = new ClientBuilder().node(node);
        if (permanode) {
            builder = builder.permanode(permanode);
        }
        const client = await builder.build();
        return StreamsClient.fromClient(client);
    }

    /**
     *  Returns a client for the mainnet setting node and permanode
     *
     * @returns StreamsClient
     */
    public static async getMainnetClient(): Promise<StreamsClient> {
        return this.getClient(this.DEFAULT_NODE, this.DEFAULT_PERMANODE);
    }
}
