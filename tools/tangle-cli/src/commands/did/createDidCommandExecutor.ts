// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Document, KeyType, KeyPair, Service, VerificationMethod, MethodScope } from "@iota/identity-wasm/node";
import bs58 from "bs58";
import { Arguments } from "yargs";
import { getNetworkParams } from "../../globalParams";
import { IdentityHelper } from "../identityHelper";
import { IService } from "./IService";

export default class CreateDidCommandExecutor {
    public static async execute(args: Arguments): Promise<boolean> {
        const { valid, serviceList } = this.validateService(args.didService as string);

        if (!valid) {
            return false;
        }

        const netParams = getNetworkParams(args);
        const identityClient = await IdentityHelper.getClient(netParams);

        // Generate a new keypair and DID document
        const key = new KeyPair(KeyType.Ed25519);
        const doc = new Document(key, identityClient.network().toString());

        let finalDocument = doc;
        if (serviceList) {
            finalDocument = this.addService(doc, serviceList);
        }

        const keys = {
            "sign-0": {
                public: bs58.encode(key.public()),
                private: bs58.encode(key.private())
            }
        };

        const key2 = new KeyPair(KeyType.Ed25519);

        const methodFragment = "dv-0";
        keys[methodFragment] = {
            public: bs58.encode(key2.public()),
            private: bs58.encode(key2.private())
        };

        const verificationMethod = VerificationMethod.fromJSON({
            id: `${doc.id().toString()}#${methodFragment}`,
            type: "Ed25519VerificationKey2018",
            controller: doc.id().toString(),
            publicKeyMultibase: `z${bs58.encode(key2.public())}`
        });

        // eslint-disable-next-line new-cap
        finalDocument.insertMethod(verificationMethod, MethodScope.VerificationMethod());

        finalDocument.signSelf(key, finalDocument.defaultSigningMethod().id());

        try {
            const receipt = await identityClient.publishDocument(finalDocument);

            console.log({
                did: finalDocument.id().toString(),
                keys: { ...keys },
                ...(Boolean(netParams.explorer) && {
                    transactionUrl: `${netParams.explorer}/message/${receipt.messageId()}`
                })
            });
        } catch (e) {
            console.error("Error", e);
        }

        return true;
    }

    private static addService(doc: Document, service: IService[]): Document {
        const serviceFragment = "service";

        // We ensure the services have an id
        for (let index = 0; index < service.length; index++) {
            if (!service[index].id) {
                service[index].id = `${doc.id().toString()}#${serviceFragment}${index + 1}`;
            }
            doc.insertService(Service.fromJSON(service[index]));
        }

        return doc;
    }

    private static validateService(service: string): {
        valid: boolean;
        serviceList: IService[] | undefined;
    } {
        let serviceList: IService[];
        let valid: boolean = false;

        if (!service) {
            return { valid: true, serviceList };
        }

        try {
            serviceList = JSON.parse(service);
        } catch {
            console.error("Invalid JSON for service");
            return { valid, serviceList: undefined };
        }
        if (!Array.isArray(serviceList)) {
            console.error("The DID service list must be an array");
            return { valid, serviceList };
        }

        for (const aService of serviceList) {
            if (!aService.serviceEndpoint || !aService.type) {
                console.error("DID service type and service endpoint have to be defined");
                return { valid, serviceList };
            }

            if (typeof aService.type !== "string") {
                if (Array.isArray(aService.type)) {
                    for (const aType of aService.type) {
                        if (typeof aType !== "string") {
                            console.error("DID service type must be a string");
                            return { valid, serviceList };
                        }
                    }
                } else {
                    console.error("DID service type must be a string");
                    return { valid, serviceList };
                }
            }

            // Validating the service endpoint URL
            try {
                // eslint-disable-next-line no-new
                new URL(aService.serviceEndpoint);
            } catch {
                console.error("Invalid DID service endpoint URL");
                return { valid, serviceList };
            }

            // If id is present it must be a valid URI
            if (aService.id) {
                try {
                    // eslint-disable-next-line no-new
                    new URL(aService.id);
                } catch {
                    console.error("Invalid DID service id. It must be a URI");
                    return { valid, serviceList };
                }
            }
        }

        valid = true;

        return { valid, serviceList };
    }
}
