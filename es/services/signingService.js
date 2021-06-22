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
const bs58_1 = __importDefault(require("bs58"));
const elliptic_1 = require("elliptic");
const anchoringChannelError_1 = __importDefault(require("../errors/anchoringChannelError"));
const anchoringChannelErrorNames_1 = __importDefault(require("../errors/anchoringChannelErrorNames"));
const didService_1 = __importDefault(require("./didService"));
class SigningService {
    /**
     * Signs the message using the identity and method specified
     *
     * It uses the Ed25519 as the signature algorithm and the hash algorithm passed as parameter
     *
     * @param request Signing Request
     *
     * @returns The signature details
     *
     */
    static sign(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const didDocument = request.didDocument;
            let methodDocument;
            try {
                methodDocument = didDocument.resolveKey(`${didDocument.id}#${request.method}`);
            }
            catch (_a) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_DID_METHOD, "The method has not been found on the DID Document");
            }
            if (methodDocument && methodDocument.type !== "Ed25519VerificationKey2018") {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_DID_METHOD, "Only 'Ed25519VerificationKey2018' verification methods are allowed");
            }
            const proofedOwnership = yield didService_1.default.verifyOwnership(request.didDocument, request.method, request.secret);
            if (!proofedOwnership) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_SIGNING_KEY, "The secret key supplied does not correspond to the verification method");
            }
            const signatureValue = this.calculateSignature(request.secret, request.message);
            const response = {
                created: new Date().toISOString(),
                verificationMethod: `${didDocument.id}#${request.method}`,
                signatureValue
            };
            return response;
        });
    }
    /**
     * Calculates the signature
     * @param privateKey private key
     * @param message message to be signed
     *
     * @returns the signature value
     */
    static calculateSignature(privateKey, message) {
        const bytesKey = bs58_1.default.decode(privateKey);
        const ed25519 = new elliptic_1.eddsa("ed25519");
        const ecKey = ed25519.keyFromSecret(bytesKey.toString("hex"), "hex");
        const signatureHex = ecKey.sign(message).toHex();
        // Final conversion to B58
        const signature = bs58_1.default.encode(Buffer.from(signatureHex, "hex"));
        return signature;
    }
}
exports.default = SigningService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmluZ1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvc2lnbmluZ1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFDQSxnREFBd0I7QUFDeEIsdUNBQTBDO0FBQzFDLDRGQUFvRTtBQUNwRSxzR0FBOEU7QUFHOUUsOERBQXNDO0FBRXRDLE1BQXFCLGNBQWM7SUFDL0I7Ozs7Ozs7OztPQVNHO0lBQ0ksTUFBTSxDQUFPLElBQUksQ0FBQyxPQUF3Qjs7WUFDN0MsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztZQUV4QyxJQUFJLGNBQWtDLENBQUM7WUFDdkMsSUFBSTtnQkFDQSxjQUFjLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxFQUFFLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDbEY7WUFBQyxXQUFNO2dCQUNKLE1BQU0sSUFBSSwrQkFBcUIsQ0FBQyxvQ0FBMEIsQ0FBQyxrQkFBa0IsRUFDekUsbURBQW1ELENBQUMsQ0FBQzthQUM1RDtZQUNELElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxJQUFJLEtBQUssNEJBQTRCLEVBQUU7Z0JBQ3hFLE1BQU0sSUFBSSwrQkFBcUIsQ0FBQyxvQ0FBMEIsQ0FBQyxrQkFBa0IsRUFDekUsb0VBQW9FLENBQUMsQ0FBQzthQUM3RTtZQUVELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxvQkFBVSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUN6RSxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVwQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ25CLE1BQU0sSUFBSSwrQkFBcUIsQ0FBQyxvQ0FBMEIsQ0FBQyxtQkFBbUIsRUFDMUUsd0VBQXdFLENBQUMsQ0FBQzthQUNqRjtZQUVELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVoRixNQUFNLFFBQVEsR0FBbUI7Z0JBQzdCLE9BQU8sRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtnQkFDakMsa0JBQWtCLEVBQUUsR0FBRyxXQUFXLENBQUMsRUFBRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3pELGNBQWM7YUFDakIsQ0FBQztZQUVGLE9BQU8sUUFBUSxDQUFDO1FBQ3BCLENBQUM7S0FBQTtJQUVEOzs7Ozs7T0FNRztJQUNLLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxVQUFrQixFQUFFLE9BQWU7UUFDakUsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV6QyxNQUFNLE9BQU8sR0FBRyxJQUFJLGdCQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXJFLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFakQsMEJBQTBCO1FBQzFCLE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoRSxPQUFPLFNBQW1CLENBQUM7SUFDL0IsQ0FBQztDQUNKO0FBaEVELGlDQWdFQyJ9