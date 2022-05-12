/* eslint-disable jsdoc/require-jsdoc */
import LdProofError from "../errors/ldProofError";
import LdProofErrorNames from "../errors/ldProofErrorNames";
import { LinkedDataProofTypes } from "../models/linkedDataProofTypes";
export default class JsonHelper {
    static getDocument(doc) {
        if ((typeof doc !== "string" && typeof doc !== "object") || Array.isArray(doc)) {
            throw new LdProofError(LdProofErrorNames.INVALID_DATA_TYPE, "Please provide a Javascript object or string in JSON format");
        }
        let document;
        if (typeof doc === "string") {
            try {
                document = JSON.parse(doc);
            }
            catch {
                throw new LdProofError(LdProofErrorNames.INVALID_DATA_TYPE, "Invalid JSON Format");
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
            throw new LdProofError(LdProofErrorNames.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include a Linked Data Signature");
        }
        return result;
    }
    static getJsonLdDocument(doc) {
        const result = this.getDocument(doc);
        if (!result["@context"]) {
            throw new LdProofError(LdProofErrorNames.INVALID_DATA_TYPE, "Not a JSON-LD document. Use 'signJson' instead");
        }
        return result;
    }
    static getSignedJsonLdDocument(doc) {
        const result = this.getJsonLdDocument(doc);
        if (!result.proof) {
            throw new LdProofError(LdProofErrorNames.JSON_DOC_NOT_SIGNED, "The provided JSON-LD document does not include a Linked Data Signature");
        }
        return result;
    }
    static getAnchoredJsonLdDocument(doc) {
        const result = this.getJsonLdDocument(doc);
        if (!result.proof) {
            throw new LdProofError(LdProofErrorNames.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include a proof");
        }
        const proofDetails = result.proof;
        if (proofDetails.type !== LinkedDataProofTypes.IOTA_LD_PROOF_2021) {
            throw new LdProofError(LdProofErrorNames.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include an IOTA Linked Data Proof");
        }
        return result;
    }
    static getAnchoredDocument(doc) {
        const result = this.getDocument(doc);
        if (!result.proof) {
            throw new LdProofError(LdProofErrorNames.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include a proof");
        }
        const proofDetails = result.proof;
        if (proofDetails.type !== LinkedDataProofTypes.IOTA_LD_PROOF_2021) {
            throw new LdProofError(LdProofErrorNames.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include an IOTA Linked Data Proof");
        }
        return result;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2pzb25IZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsd0NBQXdDO0FBRXhDLE9BQU8sWUFBWSxNQUFNLHdCQUF3QixDQUFDO0FBQ2xELE9BQU8saUJBQWlCLE1BQU0sNkJBQTZCLENBQUM7QUFLNUQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFFdEUsTUFBTSxDQUFDLE9BQU8sT0FBTyxVQUFVO0lBQ3BCLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBcUM7UUFDM0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzVFLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLEVBQ3RELDZEQUE2RCxDQUFDLENBQUM7U0FDdEU7UUFFRCxJQUFJLFFBQVEsQ0FBQztRQUViLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO1lBQ3pCLElBQUk7Z0JBQ0EsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDOUI7WUFBQyxNQUFNO2dCQUNKLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLEVBQ3RELHFCQUFxQixDQUFDLENBQUM7YUFDOUI7U0FDSjthQUFNO1lBQ0gsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzlDO1FBRUQsT0FBTyxRQUF5QixDQUFDO0lBQ3JDLENBQUM7SUFFTSxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBcUM7UUFDakUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVyQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNmLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQ3hELHFFQUFxRSxDQUFDLENBQUM7U0FDOUU7UUFFRCxPQUFPLE1BQTZCLENBQUM7SUFDekMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFxQztRQUNqRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDckIsTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFDdEQsZ0RBQWdELENBQUMsQ0FBQztTQUN6RDtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTSxNQUFNLENBQUMsdUJBQXVCLENBQUMsR0FBcUM7UUFDdkUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTNDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2YsTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFDeEQsd0VBQXdFLENBQUMsQ0FBQztTQUNqRjtRQUVELE9BQU8sTUFBNkIsQ0FBQztJQUN6QyxDQUFDO0lBRU0sTUFBTSxDQUFDLHlCQUF5QixDQUFDLEdBQXFDO1FBQ3pFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUzQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNmLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQ3hELHFEQUFxRCxDQUFDLENBQUM7U0FDOUQ7UUFFRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsS0FBeUIsQ0FBQztRQUV0RCxJQUFJLFlBQVksQ0FBQyxJQUFJLEtBQUssb0JBQW9CLENBQUMsa0JBQWtCLEVBQUU7WUFDL0QsTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFDeEQsdUVBQXVFLENBQUMsQ0FBQztTQUNoRjtRQUVELE9BQU8sTUFBK0IsQ0FBQztJQUMzQyxDQUFDO0lBRU0sTUFBTSxDQUFDLG1CQUFtQixDQUFDLEdBQXFDO1FBQ25FLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDZixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixFQUN4RCxxREFBcUQsQ0FBQyxDQUFDO1NBQzlEO1FBRUQsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEtBQXlCLENBQUM7UUFFdEQsSUFBSSxZQUFZLENBQUMsSUFBSSxLQUFLLG9CQUFvQixDQUFDLGtCQUFrQixFQUFFO1lBQy9ELE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQ3hELHVFQUF1RSxDQUFDLENBQUM7U0FDaEY7UUFFRCxPQUFPLE1BQStCLENBQUM7SUFDM0MsQ0FBQztDQUNKIn0=