export class VcHelper {
    private static readonly VC_TYPE = "VerifiableCredential";

    private static readonly VP_TYPE = "VerifiablePresentation";

    /**
     * Validates a Verifiable Credential
     *
     * @param vc Verifiable Credential object
     *
     * @returns boolean indicating if validates or not
     *
     */
    public static validateVc(vc: Credential | string): { result: boolean; credentialObj?: Credential } {
        return this.validateCredential(vc, this.VC_TYPE);
    }

    /**
     * Validates a Verifiable Presentation
     * @param cred Verifiable Presentation as an object or a string
     * @returns boolean indicating if validates or not
     */
    public static validateVp(cred: Credential | string): { result: boolean; credentialObj?: Credential } {
        const { result, credentialObj } = this.validateCredential(cred, this.VP_TYPE);
        const vp = credentialObj;

        if (result) {
            const credentials = vp.verifiableCredential;
            let credArray: Credential[] = [];

            if (Array.isArray(credentials)) {
                credArray = credentials as Credential[];
            } else {
                credArray.push(credentials as Credential);
            }

            for (const aCred of credArray) {
                if (!this.validateVc(aCred).result) {
                    return { result: false };
                }
            }

            return { result: true, credentialObj: vp };
        }

        return { result: false };
    }

    /**
     * Validates that the object represents a Vc or Vp
     *
     * @param cred The object to be validated
     *
     * @returns boolean indicating if validates or not
     */
    public static validateVcOrVp(cred: Credential | string): { result: boolean; credentialObj?: Credential } {
        const { result, credentialObj } = this.validateCredential(cred, this.VC_TYPE);

        if (!result) {
            return this.validateCredential(cred, this.VP_TYPE);
        }

        return { result: true, credentialObj };
    }

    /**
     * Validates a credential that can be a Verifiable Credential or Verifiable Presentation
     *
     * @param cred Credential Object or stringified credential object
     * @param credType Type of Credential "VerifiableCredential" or "VerifiablePresentation"
     *
     * @returns boolean indicating whether it validated or not
     */
    private static validateCredential(
        cred: Credential | string,
        credType: string
    ): { result: boolean; credentialObj?: Credential } {
        let vc = cred;

        if (!cred) {
            return { result: false };
        }

        if (typeof cred === "string") {
            try {
                vc = JSON.parse(cred) as Credential;
            } catch {
                return { result: false };
            }
        } else {
            vc = cred;
        }

        if (!vc.type) {
            return { result: false };
        }

        if (Array.isArray(vc.type)) {
            const types = vc.type as string[];
            if (!types.includes(credType)) {
                return { result: false };
            }
        } else if (typeof vc.type === "string") {
            if (vc.type !== credType) {
                return { result: false };
            }
        }

        return { result: true, credentialObj: vc };
    }
}

interface Credential {
    [key: string]: unknown;
}
