"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@iota/identity-wasm/node");
const anchoringChannelError_1 = __importDefault(require("../errors/anchoringChannelError"));
const anchoringChannelErrorNames_1 = __importDefault(require("../errors/anchoringChannelErrorNames"));
const channelHelper_1 = require("../helpers/channelHelper");
class DidService {
    /**
     * Resolves the DID
     * @param node Node against the DID is resolved
     * @param did  DID to be resolved
     * @returns The DID Document resolved from Tangle
     */
    static resolve(node, did) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jsonDoc = yield node_1.resolve(did, {
                    network: "mainnet"
                });
                const doc = node_1.Document.fromJSON(jsonDoc);
                if (!doc.verify()) {
                    throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.DID_NOT_VERIFIED, "DID cannot be verified");
                }
                return doc;
            }
            catch (_a) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.DID_NOT_FOUND, "DID cannot be resolved");
            }
        });
    }
    /**
     * Resolves the DID verification method
     * @param node Node against the DID is resolved
     * @param didMethod  DID method to be resolved
     * @returns The DID Document resolved from Tangle
     */
    static resolveMethod(node, didMethod) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const didDocument = yield this.resolve(node, didMethod.split("#")[0]);
                return didDocument.resolveKey(didMethod);
            }
            catch (_a) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.DID_NOT_FOUND, "DID cannot be resolved");
            }
        });
    }
    /**
     * Verifies that the secret really corresponds to the verification method
     *
     * @param didDocument DID document
     * @param method The method (expressed as a fragment identifier)
     * @param secret The private key (in base 58)
     *
     * @returns true if verified false if not
     */
    static verifyOwnership(didDocument, method, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            // First we verify if the method really exists on the DID
            try {
                didDocument.resolveKey(`${didDocument.id}#${method}`);
            }
            catch (_a) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_DID_METHOD, "The DID method supplied is not valid");
            }
            try {
                const verificationData = { "testData": channelHelper_1.ChannelHelper.generateSeed(10) };
                const signature = yield didDocument.signData(verificationData, {
                    secret,
                    method: `${didDocument.id}#${method}`
                });
                return didDocument.verifyData(signature);
            }
            catch (_b) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_SIGNING_KEY, "The key supplied is not valid");
            }
        });
    }
}
exports.default = DidService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9kaWRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbURBQWtIO0FBQ2xILDRGQUFvRTtBQUNwRSxzR0FBOEU7QUFDOUUsNERBQXlEO0FBRXpELE1BQXFCLFVBQVU7SUFDM0I7Ozs7O09BS0c7SUFDSSxNQUFNLENBQU8sT0FBTyxDQUFDLElBQVksRUFBRSxHQUFXOztZQUNqRCxJQUFJO2dCQUNBLE1BQU0sT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFDLEdBQUcsRUFBRTtvQkFDdEMsT0FBTyxFQUFFLFNBQVM7aUJBQ3JCLENBQUMsQ0FBQztnQkFFSCxNQUFNLEdBQUcsR0FBRyxlQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFO29CQUNmLE1BQU0sSUFBSSwrQkFBcUIsQ0FBQyxvQ0FBMEIsQ0FBQyxnQkFBZ0IsRUFDdkUsd0JBQXdCLENBQUMsQ0FBQztpQkFDakM7Z0JBRUQsT0FBTyxHQUFHLENBQUM7YUFDZDtZQUFDLFdBQU07Z0JBQ0osTUFBTSxJQUFJLCtCQUFxQixDQUFDLG9DQUEwQixDQUFDLGFBQWEsRUFDcEUsd0JBQXdCLENBQUMsQ0FBQzthQUNqQztRQUNMLENBQUM7S0FBQTtJQUVEOzs7OztPQUtHO0lBQ0ssTUFBTSxDQUFPLGFBQWEsQ0FBQyxJQUFZLEVBQUUsU0FBaUI7O1lBQzlELElBQUk7Z0JBQ0EsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRFLE9BQU8sV0FBVyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUM1QztZQUFDLFdBQU07Z0JBQ0osTUFBTSxJQUFJLCtCQUFxQixDQUFDLG9DQUEwQixDQUFDLGFBQWEsRUFDcEUsd0JBQXdCLENBQUMsQ0FBQzthQUNqQztRQUNMLENBQUM7S0FBQTtJQUdEOzs7Ozs7OztPQVFHO0lBQ0ksTUFBTSxDQUFPLGVBQWUsQ0FBQyxXQUF3QixFQUFFLE1BQWMsRUFBRSxNQUFjOztZQUN4Rix5REFBeUQ7WUFDekQsSUFBSTtnQkFDQSxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsV0FBVyxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUUsQ0FBQyxDQUFDO2FBQ3pEO1lBQUMsV0FBTTtnQkFDSixNQUFNLElBQUksK0JBQXFCLENBQUMsb0NBQTBCLENBQUMsa0JBQWtCLEVBQ3pFLHNDQUFzQyxDQUFDLENBQUM7YUFDL0M7WUFFRCxJQUFJO2dCQUNBLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxVQUFVLEVBQUUsNkJBQWEsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFFeEUsTUFBTSxTQUFTLEdBQUcsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFO29CQUMzRCxNQUFNO29CQUNOLE1BQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxFQUFFLElBQUksTUFBTSxFQUFFO2lCQUN4QyxDQUFDLENBQUM7Z0JBRUgsT0FBTyxXQUFXLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzVDO1lBQUMsV0FBTTtnQkFDSixNQUFNLElBQUksK0JBQXFCLENBQUMsb0NBQTBCLENBQUMsbUJBQW1CLEVBQzFFLCtCQUErQixDQUFDLENBQUM7YUFDeEM7UUFDTCxDQUFDO0tBQUE7Q0FDSjtBQTVFRCw2QkE0RUMifQ==