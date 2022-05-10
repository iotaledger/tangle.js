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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2pzb25IZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxZQUFZLE1BQU0sd0JBQXdCLENBQUM7QUFDbEQsT0FBTyxpQkFBaUIsTUFBTSw2QkFBNkIsQ0FBQztBQUs1RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUV0RSxNQUFNLENBQUMsT0FBTyxPQUFPLFVBQVU7SUFDcEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFxQztRQUMzRCxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDNUUsTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFDdEQsNkRBQTZELENBQUMsQ0FBQztTQUN0RTtRQUVELElBQUksUUFBUSxDQUFDO1FBRWIsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDekIsSUFBSTtnQkFDQSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUM5QjtZQUFDLE1BQU07Z0JBQ0osTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFDdEQscUJBQXFCLENBQUMsQ0FBQzthQUM5QjtTQUNKO2FBQU07WUFDSCxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDOUM7UUFFRCxPQUFPLFFBQXlCLENBQUM7SUFDckMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFxQztRQUNqRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2YsTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFDeEQscUVBQXFFLENBQUMsQ0FBQztTQUM5RTtRQUVELE9BQU8sTUFBNkIsQ0FBQztJQUN6QyxDQUFDO0lBRU0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQXFDO1FBQ2pFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNyQixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLGlCQUFpQixFQUN0RCxnREFBZ0QsQ0FBQyxDQUFDO1NBQ3pEO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVNLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxHQUFxQztRQUN2RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDZixNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixFQUN4RCx3RUFBd0UsQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsT0FBTyxNQUE2QixDQUFDO0lBQ3pDLENBQUM7SUFFTSxNQUFNLENBQUMseUJBQXlCLENBQUMsR0FBcUM7UUFDekUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTNDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2YsTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFDeEQscURBQXFELENBQUMsQ0FBQztTQUM5RDtRQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxLQUF5QixDQUFDO1FBRXRELElBQUksWUFBWSxDQUFDLElBQUksS0FBSyxvQkFBb0IsQ0FBQyxrQkFBa0IsRUFBRTtZQUMvRCxNQUFNLElBQUksWUFBWSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixFQUN4RCx1RUFBdUUsQ0FBQyxDQUFDO1NBQ2hGO1FBRUQsT0FBTyxNQUErQixDQUFDO0lBQzNDLENBQUM7SUFFTSxNQUFNLENBQUMsbUJBQW1CLENBQUMsR0FBcUM7UUFDbkUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVyQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNmLE1BQU0sSUFBSSxZQUFZLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLEVBQ3hELHFEQUFxRCxDQUFDLENBQUM7U0FDOUQ7UUFFRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsS0FBeUIsQ0FBQztRQUV0RCxJQUFJLFlBQVksQ0FBQyxJQUFJLEtBQUssb0JBQW9CLENBQUMsa0JBQWtCLEVBQUU7WUFDL0QsTUFBTSxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFDeEQsdUVBQXVFLENBQUMsQ0FBQztTQUNoRjtRQUVELE9BQU8sTUFBK0IsQ0FBQztJQUMzQyxDQUFDO0NBQ0oifQ==