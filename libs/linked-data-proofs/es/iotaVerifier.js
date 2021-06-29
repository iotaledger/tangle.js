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
const anchoringChannelError_1 = __importDefault(require("./errors/anchoringChannelError"));
const anchoringChannelErrorNames_1 = __importDefault(require("./errors/anchoringChannelErrorNames"));
const jsonCanonicalization_1 = require("./helpers/jsonCanonicalization");
const jsonHelper_1 = __importDefault(require("./helpers/jsonHelper"));
const jsonLdHelper_1 = require("./helpers/jsonLdHelper");
const validationHelper_1 = __importDefault(require("./helpers/validationHelper"));
const ldContextURL_1 = require("./models/ldContextURL");
const didService_1 = __importDefault(require("./services/didService"));
class IotaVerifier {
    /**
     * Verifies a Ed25519 signature corresponding to a string message
     *
     * @param request The verification request
     *
     * @returns true or false depending on the verification result
     *
     */
    static verify(request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validationHelper_1.default.url(request.node)) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_NODE, "The node has to be a URL");
            }
            if (!validationHelper_1.default.did(request.verificationMethod)) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_DID, "Invalid DID");
            }
            const resolution = yield didService_1.default.resolveMethod(request.node, request.verificationMethod);
            if (resolution.type !== "Ed25519VerificationKey2018") {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_DID_METHOD, "Only 'Ed25519VerificationKey2018' verification methods are allowed");
            }
            return this.verifySignature(request.signatureValue, request.message, resolution.toJSON().publicKeyBase58);
        });
    }
    /**
     * Verifies a plain JSON document containing a Linked Data Signature
     *
     * @param request Verification request
     *
     * @returns true or false depending on the verification result
     */
    static verifyJson(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = jsonHelper_1.default.getSignedDocument(request.document);
            const resolution = yield this.verificationMethod(request);
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
     * @param request Verification request
     *
     * @returns true or false depending on the verification result
     */
    static verifyJsonLd(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = jsonHelper_1.default.getSignedJsonLdDocument(request.document);
            const resolution = yield this.verificationMethod(request);
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
    static verificationMethod(request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (request.node && !validationHelper_1.default.url(request.node)) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_NODE, "The node has to be a URL");
            }
            // Here the document has already been parsed
            const document = request.document;
            const proof = document.proof;
            const verificationMethod = proof.verificationMethod;
            if (!validationHelper_1.default.did(verificationMethod)) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_DID, "Invalid DID");
            }
            const resolution = yield didService_1.default.resolveMethod(request.node, verificationMethod);
            if (resolution.type !== "Ed25519VerificationKey2018") {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_DID_METHOD, "Only 'Ed25519VerificationKey2018' verification methods are allowed");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVZlcmlmaWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2lvdGFWZXJpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsZ0RBQXdCO0FBQ3hCLCtDQUFpQztBQUNqQyx1Q0FBMEM7QUFDMUMsK0NBQWlDO0FBQ2pDLDJGQUFtRTtBQUNuRSxxR0FBNkU7QUFDN0UseUVBQXNFO0FBQ3RFLHNFQUE4QztBQUM5Qyx5REFBK0Q7QUFDL0Qsa0ZBQTBEO0FBSTFELHdEQUFxRDtBQUNyRCx1RUFBK0M7QUFFL0MsTUFBYSxZQUFZO0lBQ3JCOzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQU8sTUFBTSxDQUFDLE9BQTZCOztZQUNwRCxJQUFJLENBQUMsMEJBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDckMsTUFBTSxJQUFJLCtCQUFxQixDQUFDLG9DQUEwQixDQUFDLFlBQVksRUFDbkUsMEJBQTBCLENBQUMsQ0FBQzthQUNuQztZQUVELElBQUksQ0FBQywwQkFBZ0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEVBQUU7Z0JBQ25ELE1BQU0sSUFBSSwrQkFBcUIsQ0FBQyxvQ0FBMEIsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7YUFDMUY7WUFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLG9CQUFVLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQzFELE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRWhDLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyw0QkFBNEIsRUFBRTtnQkFDbEQsTUFBTSxJQUFJLCtCQUFxQixDQUFDLG9DQUEwQixDQUFDLGtCQUFrQixFQUN6RSxvRUFBb0UsQ0FBQyxDQUFDO2FBQzdFO1lBRUQsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxjQUFj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