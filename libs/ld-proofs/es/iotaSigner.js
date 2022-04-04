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
exports.IotaSigner = void 0;
const crypto = __importStar(require("crypto"));
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
const signingService_1 = __importDefault(require("./services/signingService"));
/**
 *  It allows to sign and verify messages using a Verification Method provided by a DID
 *
 *  It generates and verifies EdDSA (Ed25519) signatures
 *
 */
class IotaSigner {
    constructor(did, didDocument) {
        this._did = did;
        this._didDocument = didDocument;
    }
    get did() {
        return this._did;
    }
    /**
     * Creates a new signer associating it with a particular decentralized identity
     *
     * @param did The DID that has the verification methods of the signer
     * @param node The node
     *
     * @returns The newly created signer
     */
    static create(did, node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (node && !validationHelper_1.default.url(node)) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_NODE, "Node is not a URL");
            }
            if (!validationHelper_1.default.did(did)) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_DID, "Invalid DID");
            }
            const didDoc = yield didService_1.default.resolve(node, did);
            return new IotaSigner(did, didDoc);
        });
    }
    /**
     *
     * Signs a string message using the Ed25519 signature algorithm
     *
     * @param message The message
     * @param options The signing options
     *
     * @returns The signature details including its value encoded in Base58
     *
     */
    sign(message, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                didDocument: this._didDocument,
                type: signatureTypes_1.SignatureTypes.ED25519_2018,
                method: options.verificationMethod,
                secret: options.secret,
                message
            };
            const result = yield signingService_1.default.sign(request);
            return result;
        });
    }
    /**
     * Signs a JSON(-LD) document
     *
     * @param doc The JSON(-LD) document as an object or as a string
     * @param options the parameters to use to generate the signature
     *
     * @returns The JSON document including its corresponding Linked Data Signature
     */
    signJson(doc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.signatureType === signatureTypes_1.SignatureTypes.JCS_ED25519_2020) {
                return this.doSignJson(doc, options);
            }
            if (options.signatureType === signatureTypes_1.SignatureTypes.ED25519_2018) {
                return this.doSignJsonLd(doc, options);
            }
            // Otherwise exception is thrown
            throw new ldProofError_1.default(ldProofErrorNames_1.default.NOT_SUPPORTED_SIGNATURE, `Only '${signatureTypes_1.SignatureTypes.JCS_ED25519_2020}' and '${signatureTypes_1.SignatureTypes.ED25519_2018}' are supported`);
        });
    }
    /**
     * Signs a JSON document
     *
     * @param doc The JSON document as an object or as a string
     * @param options the parameters to use to generate the signature
     *
     * @returns The JSON document including its corresponding Linked Data Signature
     */
    doSignJson(doc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const docToBeSigned = jsonHelper_1.default.getDocument(doc);
            if (options.signatureType !== signatureTypes_1.SignatureTypes.JCS_ED25519_2020) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.NOT_SUPPORTED_SIGNATURE, "Only the 'JcsEd25519Signature2020' is supported");
            }
            const proof = {
                type: signatureTypes_1.SignatureTypes.JCS_ED25519_2020,
                verificationMethod: `${this._didDocument.id}#${options.verificationMethod}`,
                proofPurpose: "dataVerification",
                created: new Date().toISOString()
            };
            // The canonicalization has to be performed over the whole object excluding the proof value
            docToBeSigned.proof = proof;
            // JSON Canonicalization Scheme
            const canonized = jsonCanonicalization_1.JsonCanonicalization.calculate(docToBeSigned);
            // We use SHA256 to calculate the digest as mandated by https://identity.foundation/JcsEd25519Signature2020/
            const digest = crypto.createHash("sha256").update(canonized)
                .digest();
            const signature = yield this.sign(digest, options);
            // Finally restore the original object
            delete docToBeSigned.proof;
            return Object.assign({ proofValue: signature.signatureValue }, proof);
        });
    }
    /**
     *  Signs a JSON-LD document
     *
     * @param doc The JSON-LD document as an object or as a string
     * @param options the parameters to use to generate the signature
     *
     * @returns The Linked Data Signature represented as a Linked Data Proof
     *
     */
    doSignJsonLd(doc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const docToBeSigned = jsonHelper_1.default.getJsonLdDocument(doc);
            if (options.signatureType !== signatureTypes_1.SignatureTypes.ED25519_2018) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.NOT_SUPPORTED_SIGNATURE, "Only the 'Ed25519Signature2018' is supported");
            }
            const canonizeOptions = {
                algorithm: "URDNA2015",
                format: "application/n-quads",
                documentLoader: jsonLdHelper_1.customLdContextLoader
            };
            // RDF canonization algorithm over the document
            const canonized = yield jsonld.canonize(docToBeSigned, canonizeOptions);
            const docHash = crypto
                .createHash("sha512").update(canonized)
                .digest();
            const proofOptionsLd = {
                "@context": ldContextURL_1.LdContextURL.W3C_SECURITY,
                verificationMethod: `${this._didDocument.id}#${options.verificationMethod}`,
                created: new Date().toISOString()
            };
            const proofOptionsCanonized = yield jsonld.canonize(proofOptionsLd, canonizeOptions);
            const proofOptionsHash = crypto
                .createHash("sha512").update(proofOptionsCanonized)
                .digest();
            const finalHash = Buffer.concat([docHash, proofOptionsHash]);
            const signature = yield this.sign(finalHash, options);
            return {
                type: signatureTypes_1.SignatureTypes.ED25519_2018,
                verificationMethod: proofOptionsLd.verificationMethod,
                proofValue: signature.signatureValue,
                proofPurpose: "dataVerification",
                created: proofOptionsLd.created
            };
        });
    }
}
exports.IotaSigner = IotaSigner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVNpZ25lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhU2lnbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQ0FBaUM7QUFDakMsK0NBQWlDO0FBQ2pDLHlFQUFpRDtBQUNqRCxtRkFBMkQ7QUFDM0QseUVBQXNFO0FBQ3RFLHNFQUE4QztBQUM5Qyx5REFBK0Q7QUFDL0Qsa0ZBQTBEO0FBTzFELHdEQUFxRDtBQUNyRCw0REFBeUQ7QUFDekQsdUVBQStDO0FBQy9DLCtFQUF1RDtBQUl2RDs7Ozs7R0FLRztBQUNILE1BQWEsVUFBVTtJQUtuQixZQUFvQixHQUFXLEVBQUUsV0FBd0I7UUFDckQsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDaEIsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7SUFDcEMsQ0FBQztJQUVELElBQVcsR0FBRztRQUNWLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBTyxNQUFNLENBQUMsR0FBVyxFQUFFLElBQWE7O1lBQ2pELElBQUksSUFBSSxJQUFJLENBQUMsMEJBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNyQyxNQUFNLElBQUksc0JBQVksQ0FBQywyQkFBaUIsQ0FBQyxZQUFZLEVBQUUsbUJBQW1CLENBQUMsQ0FBQzthQUMvRTtZQUVELElBQUksQ0FBQywwQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLE1BQU0sSUFBSSxzQkFBWSxDQUFDLDJCQUFpQixDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQzthQUN4RTtZQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sb0JBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRW5ELE9BQU8sSUFBSSxV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