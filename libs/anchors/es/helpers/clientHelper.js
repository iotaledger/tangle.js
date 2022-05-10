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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50SGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvY2xpZW50SGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFbEUsTUFBTSxPQUFPLFlBQVk7SUFLckI7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQVksRUFBRSxTQUFrQjtRQUMxRCxpQkFBaUI7UUFDakIsSUFBSSxPQUFPLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsSUFBSSxTQUFTLEVBQUU7WUFDWCxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMxQztRQUNELE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JDLE9BQU8sYUFBYSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCO1FBQ2hDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7O0FBN0JzQix5QkFBWSxHQUFHLGtDQUFrQyxDQUFDO0FBRWxELDhCQUFpQixHQUFHLG1EQUFtRCxDQUFDIn0=