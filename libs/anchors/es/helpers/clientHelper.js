import { StreamsClient, ClientBuilder } from "@iota/streams/node";
export class ClientHelper {
    /**
     * Returns a client for Streams using the node and permanode
     *
     * @param node Node endpoint URL
     * @param permanode endpoint URL
     *
     * @returns StreamsClient
     */
    static async getClient(node, permanode) {
        console.log("Get Client before!!!!");
        // iota.rs client
        let builder = new ClientBuilder().node(node);
        if (permanode) {
            builder = builder.permanode(permanode);
        }
        console.log("Get Client after!!!!");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50SGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvY2xpZW50SGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFbEUsTUFBTSxPQUFPLFlBQVk7SUFLckI7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQVksRUFBRSxTQUFrQjtRQUMxRCxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDckMsaUJBQWlCO1FBQ2pCLElBQUksT0FBTyxHQUFHLElBQUksYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLElBQUksU0FBUyxFQUFFO1lBQ1gsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDMUM7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDcEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckMsT0FBTyxhQUFhLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0I7UUFDaEMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDckUsQ0FBQzs7QUEvQnNCLHlCQUFZLEdBQUcsa0NBQWtDLENBQUM7QUFFbEQsOEJBQWlCLEdBQUcsbURBQW1ELENBQUMifQ==