import { resolve as iotaDidResolve, Document as DidDocument } from "@iota/identity-wasm/node";
import AnchoringChannelError from "../errors/anchoringChannelError";
import AnchoringChannelErrorNames from "../errors/anchoringChannelErrorNames";

export default class DidService {
    public static async resolve(did: string): Promise<DidDocument> {
        try {
            const jsonDoc = await iotaDidResolve(did, {
              network: "mainnet"
            });

            return DidDocument.fromJSON(jsonDoc);
          } catch {
            throw new AnchoringChannelError(AnchoringChannelErrorNames.DID_NOT_FOUND,
                "DID cannot be resolved");
          }
    }
}
