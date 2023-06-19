import { post, type Meta, type Trail, type TrailRecord, type Signature } from "../utilHttp";

import { Converter } from "@iota/util.js";
import { Ed25519 } from "@iota/crypto.js";

export async function createTrail(endpoint: { url: string, token: string },
    trail: { [id: string]: unknown }, stateControllerBech32Addr: string): Promise<Trail> {

    const pluginRequest = {
        type: "TrailCreation",
        action: "Issue",
        trail,
        meta: {
            // The stateController address could be omitted but in that case the plugin will be controlling as well
            stateControllerAddress: stateControllerBech32Addr
        }
    };

    const result = await post(`${endpoint.url}/trails`, endpoint.token, pluginRequest);

    return result as Trail;
}


export async function addTrailRecord(endpoint: { url: string, token: string },
    trailID: string, record: TrailRecord, address: { publicKey: string, privateKey: string }): Promise<Trail> {
    const pluginRequest = {
        type: "TrailRecordAdd",
        action: "TransactionRequest",
        record
    };

    const stateControllerPrivateKey = address.privateKey;
    const stateControllerPublicKey = address.publicKey;

    const updateEndpoint = `${endpoint.url}/trails/${encodeURIComponent(trailID)}`;

    const result1 = await post(updateEndpoint, endpoint.token, pluginRequest);
    const nextPayload = result1 as { trail: Trail; meta: Meta }
        & { type: string; action: string; txEssenceHash: string; signature?: Signature[] };

    // Now the transaction has to be signed by the state controller

    // The result will contain a txEssence that has to be signed
    // Once it is signed it has to be submitted to the plugin again
    const essence = Converter.hexToBytes(nextPayload.txEssenceHash);
    const essenceSigned = Ed25519.sign(Converter.hexToBytes(stateControllerPrivateKey), essence);

    // Now the essence is signed then the same payload is sent including a signature
    nextPayload.type = "TrailRecordAdd";
    nextPayload.action = "TransactionSignature";
    nextPayload.signature = [{
        publicKey: stateControllerPublicKey,
        signature: Converter.bytesToHex(essenceSigned, true)
    }];

    const finalResult = await post(updateEndpoint, endpoint.token, nextPayload);

    return finalResult as Trail;
}
