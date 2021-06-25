"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchoringChannelError_1 = __importDefault(require("../errors/anchoringChannelError"));
const anchoringChannelErrorNames_1 = __importDefault(require("../errors/anchoringChannelErrorNames"));
const linkedDataProofTypes_1 = require("../models/linkedDataProofTypes");
class JsonHelper {
    static getDocument(doc) {
        if ((typeof doc !== "string" && typeof doc !== "object") || Array.isArray(doc)) {
            throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_DATA_TYPE, "Please provide a Javascript object or string in JSON format");
        }
        let document;
        if (typeof doc === "string") {
            try {
                document = JSON.parse(doc);
            }
            catch (_a) {
                throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_DATA_TYPE, "Invalid JSON Format");
            }
        }
        else {
            document = JSON.parse(JSON.stringify(doc));
        }
        return document;
    }
    static getSignedDocument(doc) {
        const result = this.getDocument(doc);
        if (!result.proof) {
            throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include a Linked Data Signature");
        }
        return result;
    }
    static getJsonLdDocument(doc) {
        const result = this.getDocument(doc);
        if (!result["@context"]) {
            throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.INVALID_DATA_TYPE, "Not a JSON-LD document. Use 'signJson' instead");
        }
        return result;
    }
    static getSignedJsonLdDocument(doc) {
        const result = this.getJsonLdDocument(doc);
        if (!result.proof) {
            throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.JSON_DOC_NOT_SIGNED, "The provided JSON-LD document does not include a Linked Data Signature");
        }
        return result;
    }
    static getAnchoredJsonLdDocument(doc) {
        const result = this.getJsonLdDocument(doc);
        if (!result.proof) {
            throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include a proof");
        }
        const proofDetails = result.proof;
        if (proofDetails.type !== linkedDataProofTypes_1.LinkedDataProofTypes.IOTA_LD_PROOF_2021) {
            throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include an IOTA Linked Data Proof");
        }
        return result;
    }
    static getAnchoredDocument(doc) {
        const result = this.getDocument(doc);
        if (!result.proof) {
            throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include a proof");
        }
        const proofDetails = result.proof;
        if (proofDetails.type !== linkedDataProofTypes_1.LinkedDataProofTypes.IOTA_LD_PROOF_2021) {
            throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include an IOTA Linked Data Proof");
        }
        return result;
    }
}
exports.default = JsonHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2pzb25IZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0RkFBb0U7QUFDcEUsc0dBQThFO0FBSzlFLHlFQUFzRTtBQUV0RSxNQUFxQixVQUFVO0lBQ3BCLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBcUM7UUFDM0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzVFLE1BQU0sSUFBSSwrQkFBcUIsQ0FBQyxvQ0FBMEIsQ0FBQyxpQkFBaUIsRUFDeEUsNkRBQTZELENBQUMsQ0FBQztTQUN0RTtRQUVELElBQUksUUFBUSxDQUFDO1FBRWIsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDekIsSUFBSTtnQkFDQSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUM5QjtZQUFDLFdBQU07Z0JBQ0osTUFBTSxJQUFJLCtCQUFxQixDQUFDLG9DQUEwQixDQUFDLGlCQUFpQixFQUN4RSxxQkFBcUIsQ0FBQyxDQUFDO2FBQzlCO1NBQ0o7YUFBTTtZQUNILFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUM5QztRQUVELE9BQU8sUUFBeUIsQ0FBQztJQUNyQyxDQUFDO0lBRU0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQXFDO1FBQ2pFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDZixNQUFNLElBQUksK0JBQXFCLENBQUMsb0NBQTBCLENBQUMsbUJBQW1CLEVBQzFFLHFFQUFxRSxDQUFDLENBQUM7U0FDOUU7UUFFRCxPQUFPLE1BQTZCLENBQUM7SUFDekMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFxQztRQUNqRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDckIsTUFBTSxJQUFJLCtCQUFxQixDQUFDLG9DQUEwQixDQUFDLGlCQUFpQixFQUN4RSxnREFBZ0QsQ0FBQyxDQUFDO1NBQ3pEO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVNLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxHQUFxQztRQUN2RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDZixNQUFNLElBQUksK0JBQXFCLENBQUMsb0NBQTBCLENBQUMsbUJBQW1CLEVBQzFFLHdFQUF3RSxDQUFDLENBQUM7U0FDakY7UUFFRCxPQUFPLE1BQTZCLENBQUM7SUFDekMsQ0FBQztJQUVNLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxHQUFxQztRQUN6RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDZixNQUFNLElBQUksK0JBQXFCLENBQUMsb0NBQTBCLENBQUMsbUJBQW1CLEVBQzFFLHFEQUFxRCxDQUFDLENBQUM7U0FDOUQ7UUFFRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsS0FBeUIsQ0FBQztRQUV0RCxJQUFJLFlBQVksQ0FBQyxJQUFJLEtBQUssMkNBQW9CLENBQUMsa0JBQWtCLEVBQUU7WUFDL0QsTUFBTSxJQUFJLCtCQUFxQixDQUFDLG9DQUEwQixDQUFDLG1CQUFtQixFQUMxRSx1RUFBdUUsQ0FBQyxDQUFDO1NBQ2hGO1FBRUQsT0FBTyxNQUErQixDQUFDO0lBQzNDLENBQUM7SUFFTSxNQUFNLENBQUMsbUJBQW1CLENBQUMsR0FBcUM7UUFDbkUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVyQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNmLE1BQU0sSUFBSSwrQkFBcUIsQ0FBQyxvQ0FBMEIsQ0FBQyxtQkFBbUIsRUFDMUUscURBQXFELENBQUMsQ0FBQztTQUM5RDtRQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxLQUF5QixDQUFDO1FBRXRELElBQUksWUFBWSxDQUFDLElBQUksS0FBSywyQ0FBb0IsQ0FBQyxrQkFBa0IsRUFBRTtZQUMvRCxNQUFNLElBQUksK0JBQXFCLENBQUMsb0NBQTBCLENBQUMsbUJBQW1CLEVBQzFFLHVFQUF1RSxDQUFDLENBQUM7U0FDaEY7UUFFRCxPQUFPLE1BQStCLENBQUM7SUFDM0MsQ0FBQztDQUNKO0FBM0ZELDZCQTJGQyJ9