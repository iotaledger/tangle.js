import { IotaAnchoringChannel } from "../iotaAnchoringChannel";

export default interface ILdProofVerificationOptions {
    /** channel to be used */
    channel?: IotaAnchoringChannel;
    /** Node to be used */
    node?: string;
    /** Strict mode */
    strict?: boolean;
}
