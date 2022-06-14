// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
    CredentialValidator,
    Resolver,
    Credential,
    PresentationValidator,
    CredentialValidationOptions,
    FailFast,
    Presentation,
    ResolvedDocument,
    PresentationValidationOptions
} from "@iota/identity-wasm/node";
import { Arguments } from "yargs";
import { isDefined, getNetworkParams } from "../../globalParams";
import { IdentityHelper } from "../identityHelper";
import { VcHelper } from "./vcHelper";

export default class VerifyVcCommandExecutor {
    public static async execute(args: Arguments): Promise<boolean> {
        if (isDefined(args, "vc")) {
            return this.doVerifyCredential(args);
        } else if (isDefined(args, "vp")) {
            return this.doVerifyPresentation(args);
        }
    }

    public static async doVerifyPresentation(args: Arguments): Promise<boolean> {
        const vp = args.vp as string;

        if (!VcHelper.validateVp(vp).result) {
            console.log("Error:", "Not a VerifiablePresentation");
            return false;
        }

        try {
            const identityClient = await IdentityHelper.getClient(getNetworkParams(args));

            const presentation = Presentation.fromJSON(vp);

            const resolver = await Resolver.builder().client(identityClient).build();
            const issuerDocs: ResolvedDocument[] = await resolver.resolvePresentationIssuers(presentation);
            const holderDoc: ResolvedDocument = await resolver.resolvePresentationHolder(presentation);

            PresentationValidator.validate(
                presentation,
                holderDoc,
                issuerDocs,
                PresentationValidationOptions.default(),
                FailFast.AllErrors
            );
        } catch (error) {
            console.error("Error:", error);
            return false;
        }

        return true;
    }

    public static async doVerifyCredential(args: Arguments): Promise<boolean> {
        const vc = args.vc as string;

        try {
            if (!VcHelper.validateVc(vc).result) {
                console.log("Error:", "Not a VerifiableCredential");
                return false;
            }

            const identityClient = await IdentityHelper.getClient(getNetworkParams(args));

            const credential = Credential.fromJSON(vc);

            const resolver = await Resolver.builder().client(identityClient).build();

            const doc = await resolver.resolveCredentialIssuer(credential);

            CredentialValidator.validate(credential, doc, CredentialValidationOptions.default(), FailFast.AllErrors);
        } catch (error) {
            console.error("Error:", error);
            return false;
        }
        return true;
    }
}
