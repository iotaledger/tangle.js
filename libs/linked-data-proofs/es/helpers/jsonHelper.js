"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ldProofError_1 = __importDefault(require("../errors/ldProofError"));
const ldProofErrorNames_1 = __importDefault(require("../errors/ldProofErrorNames"));
const linkedDataProofTypes_1 = require("../models/linkedDataProofTypes");
class JsonHelper {
    static getDocument(doc) {
        if ((typeof doc !== "string" && typeof doc !== "object") || Array.isArray(doc)) {
            throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_DATA_TYPE, "Please provide a Javascript object or string in JSON format");
        }
        let document;
        if (typeof doc === "string") {
            try {
                document = JSON.parse(doc);
            }
            catch (_a) {
                throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_DATA_TYPE, "Invalid JSON Format");
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
            throw new ldProofError_1.default(ldProofErrorNames_1.default.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include a Linked Data Signature");
        }
        return result;
    }
    static getJsonLdDocument(doc) {
        const result = this.getDocument(doc);
        if (!result["@context"]) {
            throw new ldProofError_1.default(ldProofErrorNames_1.default.INVALID_DATA_TYPE, "Not a JSON-LD document. Use 'signJson' instead");
        }
        return result;
    }
    static getSignedJsonLdDocument(doc) {
        const result = this.getJsonLdDocument(doc);
        if (!result.proof) {
            throw new ldProofError_1.default(ldProofErrorNames_1.default.JSON_DOC_NOT_SIGNED, "The provided JSON-LD document does not include a Linked Data Signature");
        }
        return result;
    }
    static getAnchoredJsonLdDocument(doc) {
        const result = this.getJsonLdDocument(doc);
        if (!result.proof) {
            throw new ldProofError_1.default(ldProofErrorNames_1.default.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include a proof");
        }
        const proofDetails = result.proof;
        if (proofDetails.type !== linkedDataProofTypes_1.LinkedDataProofTypes.IOTA_LD_PROOF_2021) {
            throw new ldProofError_1.default(ldProofErrorNames_1.default.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include an IOTA Linked Data Proof");
        }
        return result;
    }
    static getAnchoredDocument(doc) {
        const result = this.getDocument(doc);
        if (!result.proof) {
            throw new ldProofError_1.default(ldProofErrorNames_1.default.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include a proof");
        }
        const proofDetails = result.proof;
        if (proofDetails.type !== linkedDataProofTypes_1.LinkedDataProofTypes.IOTA_LD_PROOF_2021) {
            throw new ldProofError_1.default(ldProofErrorNames_1.default.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include an IOTA Linked Data Proof");
        }
        return result;
    }
}
exports.default = JsonHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2pzb25IZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwwRUFBa0Q7QUFDbEQsb0ZBQTREO0FBSzVELHlFQUFzRTtBQUV0RSxNQUFxQixVQUFVO0lBQ3BCLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBcUM7UUFDM0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzVFLE1BQU0sSUFBSSxzQkFBWSxDQUFDLDJCQUFpQixDQUFDLGlCQUFpQixFQUN0RCw2REFBNkQsQ0FBQyxDQUFDO1NBQ3RFO1FBRUQsSUFBSSxRQUFRLENBQUM7UUFFYixJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtZQUN6QixJQUFJO2dCQUNBLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzlCO1lBQUMsV0FBTTtnQkFDSixNQUFNLElBQUksc0JBQVksQ0FBQywyQkFBaUIsQ0FBQyxpQkFBaUIsRUFDdEQscUJBQXFCLENBQUMsQ0FBQzthQUM5QjtTQUNKO2FBQU07WUFDSCxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDOUM7UUFFRCxPQUFPLFFBQXlCLENBQUM7SUFDckMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFxQztRQUNqRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2YsTUFBTSxJQUFJLHNCQUFZLENBQUMsMkJBQWlCLENBQUMsbUJBQW1CLEVBQ3hELHFFQUFxRSxDQUFDLENBQUM7U0FDOUU7UUFFRCxPQUFPLE1BQTZCLENBQUM7SUFDekMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFxQztRQUNqRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDckIsTUFBTSxJQUFJLHNCQUFZLENBQUMsMkJBQWlCLENBQUMsaUJBQWlCLEVBQ3RELGdEQUFnRCxDQUFDLENBQUM7U0FDekQ7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRU0sTUFBTSxDQUFDLHVCQUF1QixDQUFDLEdBQXFDO1FBQ3ZFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUzQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNmLE1BQU0sSUFBSSxzQkFBWSxDQUFDLDJCQUFpQixDQUFDLG1CQUFtQixFQUN4RCx3RUFBd0UsQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsT0FBTyxNQUE2QixDQUFDO0lBQ3pDLENBQUM7SUFFTSxNQUFNLENBQUMseUJBQXlCLENBQUMsR0FBcUM7UUFDekUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTNDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2YsTUFBTSxJQUFJLHNCQUFZLENBQUMsMkJBQWlCLENBQUMsbUJBQW1CLEVBQ3hELHFEQUFxRCxDQUFDLENBQUM7U0FDOUQ7UUFFRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsS0FBeUIsQ0FBQztRQUV0RCxJQUFJLFlBQVksQ0FBQyxJQUFJLEtBQUssMkNBQW9CLENBQUMsa0JBQWtCLEVBQUU7WUFDL0QsTUFBTSxJQUFJLHNCQUFZLENBQUMsMkJBQWlCLENBQUMsbUJBQW1CLEVBQ3hELHVFQUF1RSxDQUFDLENBQUM7U0FDaEY7UUFFRCxPQUFPLE1BQStCLENBQUM7SUFDM0MsQ0FBQztJQUVNLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxHQUFxQztRQUNuRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2YsTUFBTSxJQUFJLHNCQUFZLENBQUMsMkJBQWlCLENBQUMsbUJBQW1CLEVBQ3hELHFEQUFxRCxDQUFDLENBQUM7U0FDOUQ7UUFFRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsS0FBeUIsQ0FBQztRQUV0RCxJQUFJLFlBQVksQ0FBQyxJQUFJLEtBQUssMkNBQW9CLENBQUMsa0JBQWtCLEVBQUU7WUFDL0QsTUFBTSxJQUFJLHNCQUFZLENBQUMsMkJBQWlCLENBQUMsbUJBQW1CLEVBQ3hELHVFQUF1RSxDQUFDLENBQUM7U0FDaEY7UUFFRCxPQUFPLE1BQStCLENBQUM7SUFDM0MsQ0FBQztDQUNKO0FBM0ZELDZCQTJGQyJ9