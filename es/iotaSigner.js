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
const anchoringChannelError_1 = __importDefault(require("./errors/anchoringChannelError"));
const anchoringChannelErrorNames_1 = __importDefault(require("./errors/anchoringChannelErrorNames"));
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
     * @param node The node
     *
     * @param did The DID that has the verification methods of the signer
     *
     * @returns The newly created signer
     */
    static create(node, did) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validationHelper_1.default.url(node)) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_NODE, "Node is not a URL");
            }
            if (!validationHelper_1.default.did(did)) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_DID, "Invalid DID");
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
     * @param method The method used for signing (referred as a DID fragment identifier)
     * @param secret The secret
     *
     * @returns The signature details including its value encoded in Base58
     *
     */
    sign(message, method, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                didDocument: this._didDocument,
                type: signatureTypes_1.SignatureTypes.ED25519_2018,
                method,
                secret,
                message
            };
            const result = yield signingService_1.default.sign(request);
            return result;
        });
    }
    /**
     * Signs a JSON document
     *
     * @param doc The JSON document as an object or as a string
     * @param verificationMethod  Verification method
     * @param secret The secret
     * @param signatureType The type of signature to be generated
     *
     * @returns The JSON document including its corresponding Linked Data Signature
     */
    signJson(doc, verificationMethod, secret, signatureType = signatureTypes_1.SignatureTypes.JCS_ED25519_2020) {
        return __awaiter(this, void 0, void 0, function* () {
            const docToBeSigned = jsonHelper_1.default.getDocument(doc);
            if (signatureType !== signatureTypes_1.SignatureTypes.JCS_ED25519_2020) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.NOT_SUPPORTED_SIGNATURE, "Only the 'JcsEd25519Signature2020' is supported");
            }
            const proof = {
                type: signatureTypes_1.SignatureTypes.JCS_ED25519_2020,
                verificationMethod: `${this._didDocument.id}#${verificationMethod}`,
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
            const signature = yield this.sign(digest, verificationMethod, secret);
            // Finally restore the original object
            delete docToBeSigned.proof;
            return Object.assign({ proofValue: signature.signatureValue }, proof);
        });
    }
    /**
     *  Signs a JSON-LD document
     *
     * @param doc The JSON-LD document as an object or as a string
     * @param verificationMethod  Verification method
     * @param secret The secret
     * @param signatureType The type of signature to be generated (by default 'Ed25519Signature2018')
     *
     * @returns The Linked Data Signature represented as a Linked Data Proof
     *
     */
    signJsonLd(doc, verificationMethod, secret, signatureType = signatureTypes_1.SignatureTypes.ED25519_2018) {
        return __awaiter(this, void 0, void 0, function* () {
            const docToBeSigned = jsonHelper_1.default.getJsonLdDocument(doc);
            if (signatureType !== signatureTypes_1.SignatureTypes.ED25519_2018) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.NOT_SUPPORTED_SIGNATURE, "Only the 'Ed25519Signature2018' is supported");
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
                verificationMethod: `${this._didDocument.id}#${verificationMethod}`,
                created: new Date().toISOString()
            };
            const proofOptionsCanonized = yield jsonld.canonize(proofOptionsLd, canonizeOptions);
            const proofOptionsHash = crypto
                .createHash("sha512").update(proofOptionsCanonized)
                .digest();
            const finalHash = Buffer.concat([docHash, proofOptionsHash]);
            const signature = yield this.sign(finalHash, verificationMethod, secret);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVNpZ25lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pb3RhU2lnbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSwrQ0FBaUM7QUFDakMsK0NBQWlDO0FBQ2pDLDJGQUFtRTtBQUNuRSxxR0FBNkU7QUFDN0UseUVBQXNFO0FBQ3RFLHNFQUE4QztBQUM5Qyx5REFBK0Q7QUFDL0Qsa0ZBQTBEO0FBSTFELHdEQUFxRDtBQUNyRCw0REFBeUQ7QUFDekQsdUVBQStDO0FBQy9DLCtFQUF1RDtBQUV2RDs7Ozs7R0FLRztBQUNILE1BQWEsVUFBVTtJQUtuQixZQUFvQixHQUFXLEVBQUUsV0FBd0I7UUFDckQsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDaEIsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7SUFDcEMsQ0FBQztJQUVELElBQVcsR0FBRztRQUNWLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSSxNQUFNLENBQU8sTUFBTSxDQUFDLElBQVksRUFBRSxHQUFXOztZQUNoRCxJQUFJLENBQUMsMEJBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM3QixNQUFNLElBQUksK0JBQXFCLENBQUMsb0NBQTBCLENBQUMsWUFBWSxFQUFFLG1CQUFtQixDQUFDLENBQUM7YUFDakc7WUFFRCxJQUFJLENBQUMsMEJBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUM1QixNQUFNLElBQUksK0JBQXFCLENBQUMsb0NBQTBCLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2FBQzFGO1lBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxvQkFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFbkQsT0FBTyxJQUFJLFVBQVUsQ0FB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