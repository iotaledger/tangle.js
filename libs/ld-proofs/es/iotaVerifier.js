"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVZlcmlmaWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2lvdGFWZXJpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLGdEQUF3QjtBQUN4QiwrQ0FBaUM7QUFDakMsdUNBQTBDO0FBQzFDLCtDQUFpQztBQUNqQyx5RUFBaUQ7QUFDakQsbUZBQTJEO0FBQzNELHlFQUFzRTtBQUN0RSxzRUFBOEM7QUFDOUMseURBQStEO0FBQy9ELGtGQUEwRDtBQUkxRCx3REFBcUQ7QUFDckQsNERBQXlEO0FBQ3pELHVFQUErQztBQUUvQyxNQUFhLFlBQVk7SUFDckI7Ozs7Ozs7Ozs7T0FVRztJQUNJLE1BQU0sQ0FBTyxNQUFNLENBQUMsT0FBZSxFQUFFLGNBQXNCLEVBQzlELE9BQTZCOztZQUM3QixJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQywwQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNyRCxNQUFNLElBQUksc0JBQVksQ0FBQywyQkFBaUIsQ0FBQyxZQUFZLEVBQ2pELDBCQUEwQixDQUFDLENBQUM7YUFDbkM7WUFFRCxJQUFJLENBQUMsMEJBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO2dCQUNuRCxNQUFNLElBQUksc0JBQVksQ0FBQywyQkFBaUIsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7YUFDeEU7WUFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLG9CQUFVLENBQUMsYUFBYSxDQUFDLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxJQUFJLEVBQzNELE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRWhDLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyw0QkFBNEIsRUFBRTtnQkFDbEQsTUFBTSxJQUFJLHNCQUFZLENBQUMsMkJBQWlCLENBQUMs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