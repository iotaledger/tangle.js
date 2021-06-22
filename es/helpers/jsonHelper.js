"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchoringChannelError_1 = __importDefault(require("../errors/anchoringChannelError"));
const anchoringChannelErrorNames_1 = __importDefault(require("../errors/anchoringChannelErrorNames"));
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
            throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include a proof");
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
            throw new anchoringChannelError_1.default(anchoringChannelErrorNames_1.default.JSON_DOC_NOT_SIGNED, "The provided JSON document does not include a proof");
        }
        return result;
    }
}
exports.default = JsonHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2pzb25IZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0RkFBb0U7QUFDcEUsc0dBQThFO0FBRzlFLE1BQXFCLFVBQVU7SUFDcEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFxQztRQUMzRCxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDNUUsTUFBTSxJQUFJLCtCQUFxQixDQUFDLG9DQUEwQixDQUFDLGlCQUFpQixFQUN4RSw2REFBNkQsQ0FBQyxDQUFDO1NBQ3RFO1FBRUQsSUFBSSxRQUFRLENBQUM7UUFFYixJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtZQUN6QixJQUFJO2dCQUNBLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzlCO1lBQUMsV0FBTTtnQkFDSixNQUFNLElBQUksK0JBQXFCLENBQUMsb0NBQTBCLENBQUMsaUJBQWlCLEVBQ3hFLHFCQUFxQixDQUFDLENBQUM7YUFDOUI7U0FDSjthQUFNO1lBQ0gsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzlDO1FBRUQsT0FBTyxRQUFtQyxDQUFDO0lBQy9DLENBQUM7SUFFTSxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBcUM7UUFDakUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVyQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNmLE1BQU0sSUFBSSwrQkFBcUIsQ0FBQyxvQ0FBMEIsQ0FBQyxtQkFBbUIsRUFDMUUscURBQXFELENBQUMsQ0FBQztTQUM5RDtRQUVELE9BQU8sTUFBNkIsQ0FBQztJQUN6QyxDQUFDO0lBRU0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQXFDO1FBQ2pFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNyQixNQUFNLElBQUksK0JBQXFCLENBQUMsb0NBQTBCLENBQUMsaUJBQWlCLEVBQ3hFLGdEQUFnRCxDQUFDLENBQUM7U0FDekQ7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRU0sTUFBTSxDQUFDLHVCQUF1QixDQUFDLEdBQXFDO1FBQ3ZFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUzQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNmLE1BQU0sSUFBSSwrQkFBcUIsQ0FBQyxvQ0FBMEIsQ0FBQyxtQkFBbUIsRUFDMUUscURBQXFELENBQUMsQ0FBQztTQUM5RDtRQUVELE9BQU8sTUFBNkIsQ0FBQztJQUN6QyxDQUFDO0NBQ0o7QUF2REQsNkJBdURDIn0=