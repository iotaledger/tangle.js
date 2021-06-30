/* eslint-disable no-duplicate-imports */
import { Document, KeyType, publish as iotaDidPublish } from "@iota/identity-wasm/node";
import type { NewDocument } from "@iota/identity-wasm/node";
import { Arguments } from "yargs";
import { IService } from "./IService";

export default class CreateDidCommandExecutor {
  public static async execute(args: Arguments): Promise<boolean> {
    const { valid, serviceList } = this.validateService(args.didService as string);

    if (!valid) {
      return false;
    }

    const { doc, key } = (new Document(KeyType.Ed25519) as unknown) as NewDocument;

    let finalDocument = doc;
    if (serviceList) {
      finalDocument = this.addService(doc, serviceList);
    }

    finalDocument.sign(key);

    const transactionId = await iotaDidPublish(finalDocument, {
      network: "mainnet"
    });

    console.log({
      did: finalDocument.toJSON().id,
      keys: {
        public: key.public,
        private: key.secret
      },
      transactionUrl: `https://explorer.iota.org/mainnet/message/${transactionId}`
    });

    return true;
  }

  private static addService(doc: Document, service: IService[]): Document {
    const serviceFragment = "service";

    // First we convert the document to JSON
    const extDoc = doc.toJSON();
    // We ensure the services have an id
    for (let index = 0; index < service.length; index++) {
      if (!service[index].id) {
        service[index].id = `${extDoc.id}#${serviceFragment}${index + 1}`;
      }
    }

    extDoc.service = service;

    return Document.fromJSON(extDoc);
  }

  private static validateService(service: string): { valid: boolean; serviceList: IService[] | undefined } {
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
