import { StreamsClient, ClientBuilder } from "@tangle.js/streams-wasm/node/streams.js";
import initialize from "./initializationHelper";
export class ClientHelper {
    /**
     * Returns a client for Streams using the node and permanode
     *
     * @param node Node endpoint URL
     * @param permanode endpoint URL
     * @returns StreamsClient
     */
    static async getClient(node, permanode) {
        await initialize();
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
    static async getMainnetClient() {
        return this.getClient(this.DEFAULT_NODE, this.DEFAULT_PERMANODE);
    }
}
ClientHelper.DEFAULT_NODE = "https://chrysalis-nodes.iota.org";
ClientHelper.DEFAULT_PERMANODE = "https://chrysalis-chronicle.iota.org/api/mainnet/";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50SGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvY2xpZW50SGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBZSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDcEcsT0FBTyxVQUFVLE1BQU0sd0JBQXdCLENBQUM7QUFFaEQsTUFBTSxPQUFPLFlBQVk7SUFLckI7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBWSxFQUFFLFNBQWtCO1FBQzFELE1BQU0sVUFBVSxFQUFFLENBQUM7UUFFbkIsaUJBQWlCO1FBQ2pCLElBQUksT0FBTyxHQUFHLElBQUksYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLElBQUksU0FBUyxFQUFFO1lBQ1gsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDMUM7UUFDRCxNQUFNLE1BQU0sR0FBVyxNQUFNLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QyxPQUFPLGFBQWEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQjtRQUNoQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNyRSxDQUFDOztBQTlCc0IseUJBQVksR0FBRyxrQ0FBa0MsQ0FBQztBQUVsRCw4QkFBaUIsR0FBRyxtREFBbUQsQ0FBQyJ9