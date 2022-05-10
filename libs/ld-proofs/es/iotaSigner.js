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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVNpZ25lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhU2lnbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsK0NBQWlDO0FBQ2pDLCtDQUFpQztBQUNqQyx5RUFBaUQ7QUFDakQsbUZBQTJEO0FBQzNELHlFQUFzRTtBQUN0RSxzRUFBOEM7QUFDOUMseURBQStEO0FBQy9ELGtGQUEwRDtBQU0xRCx3REFBcUQ7QUFDckQsNERBQXlEO0FBQ3pELHVFQUErQztBQUMvQywrRUFBdUQ7QUFFdkQ7Ozs7O0dBS0c7QUFDSCxNQUFhLFVBQVU7SUFLbkIsWUFBb0IsR0FBVyxFQUFFLFdBQXdCO1FBQ3JELElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxJQUFXLEdBQUc7UUFDVixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQU8sTUFBTSxDQUFDLEdBQVcsRUFBRSxJQUFhOztZQUNqRCxJQUFJLElBQUksSUFBSSxDQUFDLDBCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDckMsTUFBTSxJQUFJLHNCQUFZLENBQUMsMkJBQWlCLENBQUMsWUFBWSxFQUFFLG1CQUFtQixDQUFDLENBQUM7YUFDL0U7WUFFRCxJQUFJLENBQUMsMEJBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUM1QixNQUFNLElBQUksc0JBQVksQ0FBQywyQkFBaUIsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7YUFDeEU7WUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLG9CQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUVuRCxPQUFPLElB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