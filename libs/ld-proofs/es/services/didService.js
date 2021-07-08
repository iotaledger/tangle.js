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
const anchors_1 = require("@tangle.js/anchors");
const ldProofError_1 = __importDefault(require("../errors/ldProofError"));
const ldProofErrorNames_1 = __importDefault(require("../errors/ldProofErrorNames"));
const identityHelper_1 = require("../helpers/identityHelper");
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
                const doc = node_1.Document.fromJSON(jsonDoc);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9kaWRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbURBQXVGO0FBQ3ZGLGdEQUFnRDtBQUNoRCwwRUFBa0Q7QUFDbEQsb0ZBQTREO0FBQzVELDhEQUEyRDtBQUUzRCxNQUFxQixVQUFVO0lBQzNCOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFPLE9BQU8sQ0FBQyxJQUFZLEVBQUUsR0FBVzs7WUFDakQsSUFBSTtnQkFDQSxNQUFNLGNBQWMsR0FBRywrQkFBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFdEQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxNQUFNLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBRTdELE1BQU0sR0FBRyxHQUFHLGVBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUU7b0JBQ2YsTUFBTSxJQUFJLHNCQUFZLENBQUMsMkJBQWlCLENBQUMsZ0JBQWdCLEVBQ3JELHdCQUF3QixDQUFDLENBQUM7aUJBQ2pDO2dCQUVELE9BQU8sR0FBRyxDQUFDO2FBQ2Q7WUFBQyxXQUFNO2dCQUNKLE1BQU0sSUFBSSxzQkFBWSxDQUFDLDJCQUFpQixDQUFDLGFBQWEsRUFDbEQsd0JBQXdCLENBQUMsQ0FBQzthQUNqQztRQUNMLENBQUM7S0FBQTtJQUVEOzs7OztPQUtHO0lBQ0ssTUFBTSxDQUFPLGFBQWEsQ0FBQyxJQUFZLEVBQUUsU0FBaUI7O1lBQzlELElBQUk7Z0JBQ0EsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRFLE9BQU8sV0FBVyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUM1QztZQUFDLFdBQU07Z0JBQ0osTUFBTSxJQUFJLHNCQUFZLENBQUMsMkJBQWlCLENBQUMsYUFBYSxFQUNsRCx3QkFBd0IsQ0FBQyxDQUFDO2FBQ2pDO1FBQ0wsQ0FBQztLQUFBO0lBR0Q7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sZUFBZSxDQUFDLFdBQXdCLEVBQUUsTUFBYyxFQUFFLE1BQWM7O1lBQ3hGLHlEQUF5RDtZQUN6RCxJQUFJO2dCQUNBLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxXQUFXLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDekQ7WUFBQyxXQUFNO2dCQUNKLE1BQU0sSUFBSSxzQkFBWSxDQUFDLDJCQUFpQixDQUFDLGtCQUFrQixFQUN2RCxzQ0FBc0MsQ0FBQyxDQUFDO2FBQy9DO1lBRUQsSUFBSTtnQkFDQSxNQUFNLGdCQUFnQixHQUFHLEVBQUUsVUFBVSxFQUFFLG9CQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBRXJFLE1BQU0sU0FBUyxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDM0QsTUFBTTtvQkFDTixNQUFNLEVBQUUsR0FBRyxXQUFXLENBQUMsRUFBRSxJQUFJLE1BQU0sRUFBRTtpQkFDeEMsQ0FBQyxDQUFDO2dCQUVILE9BQU8sV0FBVyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUM1QztZQUFDLFdBQU07Z0JBQ0osTUFBTSxJQUFJLHNCQUFZLENBQUMsMkJBQWlCLENBQUMsbUJBQW1CLEVBQ3hELCtCQUErQixDQUFDLENBQUM7YUFDeEM7UUFDTCxDQUFDO0tBQUE7Q0FDSjtBQTVFRCw2QkE0RUMifQ==