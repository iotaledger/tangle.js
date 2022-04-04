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
const anchors_1 = require("@tangle-js/anchors");
const ldProofError_1 = __importDefault(require("../errors/ldProofError"));
const ldProofErrorNames_1 = __importDefault(require("../errors/ldProofErrorNames"));
const identityHelper_1 = require("../helpers/identityHelper");
const iotaIdentity_1 = require("../iotaIdentity");
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
                const identityClient = identityHelper_1.IdentityHelper.getClient(node);
                const jsonDoc = (yield identityClient.resolve(did)).document;
                const doc = iotaIdentity_1.Document.fromJSON(jsonDoc);
                if (!doc.verify()) {
                    throw new ldProofError_1.default(ldProofErrorNames_1.default.DID_NOT_VERIFIED, "DID cannot be verified");
                }
                return doc;
            }
            catch (_a) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.DID_NOT_FOUND, "DID cannot be resolved");
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
                throw new ldProofError_1.default(ldProofErrorNames_1.default.DID_NOT_FOUND, "DID cannot be resolved");
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
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_DID_METHOD, "The DID method supplied is not valid");
            }
            try {
                const verificationData = { "testData": anchors_1.SeedHelper.generateSeed(10) };
                const signature = yield didDocument.signData(verificationData, {
                    secret,
                    method: `${didDocument.id}#${method}`
                });
                return didDocument.verifyData(signature);
            }
            catch (_b) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_SIGNING_KEY, "The key supplied is not valid");
            }
        });
    }
}
exports.default = DidService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9kaWRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsZ0RBQWdEO0FBQ2hELDBFQUFrRDtBQUNsRCxvRkFBNEQ7QUFDNUQsOERBQTJEO0FBQzNELGtEQUFxRTtBQUtyRSxNQUFxQixVQUFVO0lBQzNCOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFPLE9BQU8sQ0FBQyxJQUFZLEVBQUUsR0FBVzs7WUFDakQsSUFBSTtnQkFDQSxNQUFNLGNBQWMsR0FBRywrQkFBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFdEQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxNQUFNLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBRTdELE1BQU0sR0FBRyxHQUFHLHVCQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFO29CQUNmLE1BQU0sSUFBSSxzQkFBWSxDQUFDLDJCQUFpQixDQUFDLGdCQUFnQixFQUNyRCx3QkFBd0IsQ0FBQyxDQUFDO2lCQUNqQztnQkFFRCxPQUFPLEdBQUcsQ0FBQzthQUNkO1lBQUMsV0FBTTtnQkFDSixNQUFNLElBQUksc0JBQVksQ0FBQywyQkFBaUIsQ0FBQyxhQUFhLEVBQ2xELHdCQUF3QixDQUFDLENBQUM7YUFDakM7UUFDTCxDQUFDO0tBQUE7SUFFRDs7Ozs7T0FLRztJQUNLLE1BQU0sQ0FBTyxhQUFhLENBQUMsSUFBWSxFQUFFLFNBQWlCOztZQUM5RCxJQUFJO2dCQUNBLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV0RSxPQUFPLFdBQVcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDNUM7WUFBQyxXQUFNO2dCQUNKLE1BQU0sSUFBSSxzQkFBWSxDQUFDLDJCQUFpQixDQUFDLGFBQWEsRUFDbEQsd0JBQXdCLENBQUMsQ0FBQzthQUNqQztRQUNMLENBQUM7S0FBQTtJQUdEOzs7Ozs7OztPQVFHO0lBQ0ksTUFBTSxDQUFPLGVBQWUsQ0FBQyxXQUF3QixFQUFFLE1BQWMsRUFBRSxNQUFjOztZQUN4Rix5REFBeUQ7WUFDekQsSUFBSTtnQkFDQSxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsV0FBVyxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUUsQ0FBQyxDQUFDO2FBQ3pEO1lBQUMsV0FBTTtnQkFDSixNQUFNLElBQUksc0JBQVksQ0FBQywyQkFBaUIsQ0FBQyxrQkFBa0IsRUFDdkQsc0NBQXNDLENBQUMsQ0FBQzthQUMvQztZQUVELElBQUk7Z0JBQ0EsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLFVBQVUsRUFBRSxvQkFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUVyRSxNQUFNLFNBQVMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUU7b0JBQzNELE1BQU07b0JBQ04sTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLEVBQUUsSUFBSSxNQUFNLEVBQUU7aUJBQ3hDLENBQUMsQ0FBQztnQkFFSCxPQUFPLFdBQVcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDNUM7WUFBQyxXQUFNO2dCQUNKLE1BQU0sSUFBSSxzQkFBWSxDQUFDLDJCQUFpQixDQUFDLG1CQUFtQixFQUN4RCwrQkFBK0IsQ0FBQyxDQUFDO2FBQ3hDO1FBQ0wsQ0FBQztLQUFBO0NBQ0o7QUE1RUQsNkJBNEVDIn0=