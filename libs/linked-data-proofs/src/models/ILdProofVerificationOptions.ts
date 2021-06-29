import { IotaAnchoringChannel } from "@gtsc-libs/anchoring-channels";

export default interface ILdProofVerificationOptions {
    /** channel to be used */
    channel?: IotaAnchoringChannel;
    /** Node to be used */
    node?: string;
    /** Strict mode */
    strict?: boolean;
}
