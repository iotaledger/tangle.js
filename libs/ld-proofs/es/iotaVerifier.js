"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.IotaVerifier = void 0;
const bs58_1 = __importDefault(require("bs58"));
const crypto = __importStar(require("crypto"));
const elliptic_1 = require("elliptic");
const jsonld = __importStar(require("jsonld"));
const ldProofError_1 = __importDefault(require("./errors/ldProofError"));
const ldProofErrorNames_1 = __importDefault(require("./errors/ldProofErrorNames"));
const jsonCanonicalization_1 = require("./helpers/jsonCanonicalization");
const jsonHelper_1 = __importDefault(require("./helpers/jsonHelper"));
const jsonLdHelper_1 = require("./helpers/jsonLdHelper");
const validationHelper_1 = __importDefault(require("./helpers/validationHelper"));
const ldContextURL_1 = require("./models/ldContextURL");
const signatureTypes_1 = require("./models/signatureTypes");
const didService_1 = __importDefault(require("./services/didService"));
class IotaVerifier {
    /**
     * Verifies a Ed25519 signature corresponding to a string message
     *
     * @param  message the message to be verified
     * @param  signatureValue the signature value
     *
     * @param options The verification request
     *
     * @returns true or false depending on the verification result
     *
     */
    static verify(message, signatureValue, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.node && !validationHelper_1.default.url(options.node)) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_NODE, "The node has to be a URL");
            }
            if (!validationHelper_1.default.did(options.verificationMethod)) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_DID, "Invalid DID");
            }
            const resolution = yield didService_1.default.resolveMethod(options === null || options === void 0 ? void 0 : options.node, options.verificationMethod);
            if (resolution.type !== "Ed25519VerificationKey2018") {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_DID_METHOD, "Only 'Ed25519VerificationKey2018' verification methods are allowed");
            }
            return this.verifySignature(signatureValue, message, resolution.toJSON().publicKeyBase58);
        });
    }
    /**
     * Verifies a JSON(-LD) document containing a Linked Data Signature
     *
     * @param doc The document to verify
     * @param options The verification options
     *
     * @returns true or false depending on the verification result
     */
    static verifyJson(doc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = jsonHelper_1.default.getSignedDocument(doc);
            if (document.proof.type === signatureTypes_1.SignatureTypes.JCS_ED25519_2020) {
                return this.doVerifyJson(document, options);
            }
            if (document.proof.type === signatureTypes_1.SignatureTypes.ED25519_2018) {
                return this.doVerifyJsonLd(document, options);
            }
            // Otherwise exception is thrown
            throw new ldProofError_1.default(ldProofErrorNames_1.default.NOT_SUPPORTED_SIGNATURE, `Only '${signatureTypes_1.SignatureTypes.JCS_ED25519_2020}' and '${signatureTypes_1.SignatureTypes.ED25519_2018}' are supported`);
        });
    }
    /**
     * Verifies a JSON document containing a Linked Data Signature
     *
     * @param doc The document to verify
     * @param options The verification options
     *
     * @returns true or false depending on the verification result
     */
    static doVerifyJson(doc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = jsonHelper_1.default.getSignedDocument(doc);
            const resolution = yield this.verificationMethod(document, options === null || options === void 0 ? void 0 : options.node);
            const proof = document.proof;
            // After removing the proofValue we obtain the canonical form and that will be verified
            const proofValue = proof.proofValue;
            delete proof.proofValue;
            const canonical = jsonCanonicalization_1.JsonCanonicalization.calculate(document);
            const msgHash = crypto
                .createHash("sha256").update(canonical)
                .digest();
            const result = this.verifySignature(proofValue, msgHash, resolution.toJSON().publicKeyBase58);
            // Restore the proof value
            proof.proofValue = proofValue;
            return result;
        });
    }
    /**
     * Verifies a JSON-LD document containing a Linked Data Signature
     *
     * @param doc The document to be verified
     * @param options The verification options
     * @returns true or false depending on the verification result
     */
    static doVerifyJsonLd(doc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = jsonHelper_1.default.getSignedJsonLdDocument(doc);
            const resolution = yield this.verificationMethod(document, options === null || options === void 0 ? void 0 : options.node);
            const proof = document.proof;
            const proofOptions = {
                "@context": ldContextURL_1.LdContextURL.W3C_SECURITY,
                verificationMethod: proof.verificationMethod,
                created: proof.created
            };
            // Remove the document proof to calculate the canonization without the proof
            delete document.proof;
            const canonizeOptions = {
                algorithm: "URDNA2015",
                format: "application/n-quads",
                documentLoader: jsonLdHelper_1.customLdContextLoader
            };
            const docCanonical = yield jsonld.canonize(document, canonizeOptions);
            const docHash = crypto.createHash("sha512").update(docCanonical)
                .digest();
            const proofCanonical = yield jsonld.canonize(proofOptions, canonizeOptions);
            const proofHash = crypto.createHash("sha512").update(proofCanonical)
                .digest();
            const hashToVerify = Buffer.concat([docHash, proofHash]);
            const result = this.verifySignature(proof.proofValue, hashToVerify, resolution.toJSON().publicKeyBase58);
            // Restore the proof value on the original document
            document.proof = proof;
            return result;
        });
    }
    static verificationMethod(document, node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (node && !validationHelper_1.default.url(node)) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_NODE, "The node has to be a URL");
            }
            const proof = document.proof;
            const verificationMethod = proof.verificationMethod;
            if (!validationHelper_1.default.did(verificationMethod)) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_DID, "Invalid DID");
            }
            const resolution = yield didService_1.default.resolveMethod(node, verificationMethod);
            if (resolution.type !== "Ed25519VerificationKey2018") {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_DID_METHOD, "Only 'Ed25519VerificationKey2018' verification methods are allowed");
            }
            return resolution;
        });
    }
    static verifySignature(signature, message, publicKeyBase58) {
        try {
            const signatureBytes = bs58_1.default.decode(signature);
            const publicKeyBytes = bs58_1.default.decode(publicKeyBase58);
            const ed25519 = new elliptic_1.eddsa("ed25519");
            const ecKey = ed25519.keyFromPublic(publicKeyBytes.toString("hex"), "hex");
            return (ecKey.verify(message, signatureBytes.toString("hex")));
        }
        catch (error) {
            console.log("Error while verifying signature:", error);
            return false;
        }
    }
}
exports.IotaVerifier = IotaVerifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVZlcmlmaWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2lvdGFWZXJpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsZ0RBQXdCO0FBQ3hCLCtDQUFpQztBQUNqQyx1Q0FBMEM7QUFDMUMsK0NBQWlDO0FBQ2pDLHlFQUFpRDtBQUNqRCxtRkFBMkQ7QUFDM0QseUVBQXNFO0FBQ3RFLHNFQUE4QztBQUM5Qyx5REFBK0Q7QUFDL0Qsa0ZBQTBEO0FBSzFELHdEQUFxRDtBQUNyRCw0REFBeUQ7QUFDekQsdUVBQStDO0FBSS9DLE1BQWEsWUFBWTtJQUNyQjs7Ozs7Ozs7OztPQVVHO0lBQ0ksTUFBTSxDQUFPLE1BQU0sQ0FBQyxPQUFlLEVBQUUsY0FBc0IsRUFDOUQsT0FBNkI7O1lBQzdCLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLDBCQUFnQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3JELE1BQU0sSUFBSSxzQkFBWSxDQUFDLDJCQUFpQixDQUFDLFlBQVksRUFDakQsMEJBQTBCLENBQUMsQ0FBQzthQUNuQztZQUVELElBQUksQ0FBQywwQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEVBQUU7Z0JBQ25ELE1BQU0sSUFBSSxzQkFBWSxDQUFDLDJCQUFpQixDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQzthQUN4RTtZQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sb0JBQVUsQ0FBQyxhQUFhLENBQUMsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLElBQUksRUFDM0QsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFaEMsSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLDRCQUE0QixFQUFFO2dCQUNsRCxNQUFNLElBQUksc0JBQVksQ0FBQywyQkFBaUIsQ0FBQyxrQkFBa0IsRUFDdkQsb0VBQW9FLENBQUMsQ0FBQzthQUM3RTtZQUVELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUMvQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDN0MsQ0FBQztLQUFBO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBTyxVQUFVLENBQUMsR0FBaUMsRUFDNUQsT0FBa0M7O1lBQ2xDLE1BQU0sUUFBUSxHQUFHLG9CQUFVLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkQsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSywrQkFBYyxDQUFDLGdCQUFnQixFQUFFO2dCQUN6RCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQy9DO1lBRUQsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSywrQkFBYyxDQUFDLFlBQVksRUFBRTtnQkFDckQsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNqRDtZQUVELGdDQUFnQztZQUNoQyxNQUFNLElBQUksc0JBQVksQ0FBQywyQkFBaUIsQ0FBQyx1QkFBdUIsRUFDNUQsU0FBUywrQkFBYyxDQUFDLGdCQUFnQixVQUFVLCtCQUFjLENBQUMsWUFBWSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3hHLENBQUM7S0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDSyxNQUFNLENBQU8sWUFBWSxDQUFDLEdBQWlDLEVBQy9ELE9BQWtDOztZQUNsQyxNQUFNLFFBQVEsR0FBRyxvQkFBVSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRW5ELE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsSUFBSSxDQUFDLENBQUM7WUFFMUUsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztZQUU3Qix1RkFBdUY7WUFDdkYsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztZQUNwQyxPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFFeEIsTUFBTSxTQUFTLEdBQUcsMkNBQW9CLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNELE1BQU0sT0FBTyxHQUFHLE1BQU07aUJBQ2pCLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO2lCQUN0QyxNQUFNLEVBQUUsQ0FBQztZQUVkLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFOUYsMEJBQTBCO1lBQzFCLEtBQUssQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBRTlCLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7S0FBQTtJQUdEOzs7Ozs7T0FNRztJQUNLLE1BQU0sQ0FBTyxjQUFjLENBQUMsR0FBaUMsRUFDakUsT0FBa0M7O1lBQ2xDLE1BQU0sUUFBUSxHQUFHLG9CQUFVLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFekQsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxJQUFJLENBQUMsQ0FBQztZQUUxRSxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBRTdCLE1BQU0sWUFBWSxHQUFHO2dCQUNqQixVQUFVLEVBQUUsMkJBQVksQ0FBQyxZQUFZO2dCQUNyQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsa0JBQWtCO2dCQUM1QyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87YUFDekIsQ0FBQztZQUVGLDRFQUE0RTtZQUM1RSxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFFdEIsTUFBTSxlQUFlLEdBQUc7Z0JBQ3BCLFNBQVMsRUFBRSxXQUFXO2dCQUN0QixNQUFNLEVBQUUscUJBQXFCO2dCQUM3QixjQUFjLEVBQUUsb0NBQXFCO2FBQ3hDLENBQUM7WUFFRixNQUFNLFlBQVksR0FBRyxNQUFNLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztpQkFDM0QsTUFBTSxFQUFFLENBQUM7WUFFZCxNQUFNLGNBQWMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQzVFLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztpQkFDL0QsTUFBTSxFQUFFLENBQUM7WUFFZCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFFekQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFekcsbURBQW1EO1lBQ25ELFFBQVEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBRXZCLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7S0FBQTtJQUVPLE1BQU0sQ0FBTyxrQkFBa0IsQ0FBQyxRQUE2QixFQUFFLElBQVk7O1lBQy9FLElBQUksSUFBSSxJQUFJLENBQUMsMEJBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNyQyxNQUFNLElBQUksc0JBQVksQ0FBQywyQkFBaUIsQ0FBQyxZQUFZLEVBQ2pELDBCQUEwQixDQUFDLENBQUM7YUFDbkM7WUFFRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBRTdCLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1lBRXBELElBQUksQ0FBQywwQkFBZ0IsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsRUFBRTtnQkFDM0MsTUFBTSxJQUFJLHNCQUFZLENBQUMsMkJBQWlCLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2FBQ3hFO1lBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxvQkFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUU1RSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssNEJBQTRCLEVBQUU7Z0JBQ2xELE1BQU0sSUFBSSxzQkFBWSxDQUFDLDJCQUFpQixDQUFDLGtCQUFrQixFQUN2RCxvRUFBb0UsQ0FBQyxDQUFDO2FBQzdFO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDdEIsQ0FBQztLQUFBO0lBRU8sTUFBTSxDQUFDLGVBQWUsQ0FBQyxTQUFpQixFQUFFLE9BQWUsRUFBRSxlQUF1QjtRQUN0RixJQUFJO1lBQ0EsTUFBTSxjQUFjLEdBQUcsY0FBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QyxNQUFNLGNBQWMsR0FBRyxjQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRXBELE1BQU0sT0FBTyxHQUFHLElBQUksZ0JBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFM0UsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBWSxDQUFDO1NBQzdFO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztDQUNKO0FBbkxELG9DQW1MQyJ9