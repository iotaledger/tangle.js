"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customLdContextLoader = void 0;
const JSON = "application/json";
const JSON_LD = "application/ld+json";
/**
 * JSON-LD @context loader
 *
 * @param url The URL of the LD @context
 * @param options Options
 *
 * @returns the LD document and the final URL after following redirects
 *
 */
function customLdContextLoader(url, options) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const headers = new Headers();
        headers.append("accept", `${JSON},${JSON_LD}`);
        const response = yield fetch(url);
        let document;
        let documentUrl = url;
        if (response.ok) {
            const respMimeType = response.headers.get("content-type").toLowerCase();
            // If this is not a JSON-LD @context but there is an alternate representation
            // which MIME type is JSON-LD we follow our nose
            if (respMimeType !== JSON && respMimeType !== JSON_LD) {
                // Let's check if there is a Link alternate header
                const link = response.headers.get("link");
                const components = link.split(";");
                if ((_a = components[1]) === null || _a === void 0 ? void 0 : _a.includes("alternate")) {
                    if ((_b = components[2]) === null || _b === void 0 ? void 0 : _b.includes(JSON_LD)) {
                        const bracketsLinkPath = components[0];
                        // Remove link's brackets
                        const extraPath = components[0].slice(1, bracketsLinkPath.length - 1);
                        // This is the alternate representation
                        const contextUrl = `${url}${extraPath}`;
                        // Only the link is followed to the alternate representation if it is a different one
                        if (contextUrl !== url) {
                            return customLdContextLoader(contextUrl, {});
                        }
                    }
                }
            }
            else {
                document = yield response.json();
                if (response.redirected) {
                    documentUrl = response.url;
                }
            }
        }
        else {
            console.error(`The JSON-LD @context ${url} cannot be retrieved`);
        }
        return {
            document,
            documentUrl // this is the actual context URL after redirects
        };
    });
}
exports.customLdContextLoader = customLdContextLoader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkxkSGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvanNvbkxkSGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLE1BQU0sSUFBSSxHQUFHLGtCQUFrQixDQUFDO0FBQ2hDLE1BQU0sT0FBTyxHQUFHLHFCQUFxQixDQUFDO0FBRXRDOzs7Ozs7OztHQVFHO0FBQ0gsU0FBc0IscUJBQXFCLENBQUMsR0FBRyxFQUFFLE9BQU87OztRQUlwRCxNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQzlCLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxJQUFJLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFL0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFbEMsSUFBSSxRQUFpQyxDQUFDO1FBQ3RDLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQztRQUV0QixJQUFJLFFBQVEsQ0FBQyxFQUFFLEVBQUU7WUFDYixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUV4RSw2RUFBNkU7WUFDN0UsZ0RBQWdEO1lBQ2hELElBQUksWUFBWSxLQUFLLElBQUksSUFBSSxZQUFZLEtBQUssT0FBTyxFQUFFO2dCQUNuRCxrREFBa0Q7Z0JBQ2xELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMxQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUVuQyxJQUFJLE1BQUEsVUFBVSxDQUFDLENBQUMsQ0FBQywwQ0FBRSxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7b0JBQ3RDLElBQUksTUFBQSxVQUFVLENBQUMsQ0FBQyxDQUFDLDBDQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDbEMsTUFBTSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3ZDLHlCQUF5Qjt3QkFDekIsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUN0RSx1Q0FBdUM7d0JBQ3ZDLE1BQU0sVUFBVSxHQUFHLEdBQUcsR0FBRyxHQUFHLFNBQVMsRUFBRSxDQUFDO3dCQUN4QyxxRkFBcUY7d0JBQ3JGLElBQUksVUFBVSxLQUFLLEdBQUcsRUFBRTs0QkFDcEIsT0FBTyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7eUJBQ2hEO3FCQUNKO2lCQUNKO2FBQ0o7aUJBQU07Z0JBQ0gsUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNqQyxJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUU7b0JBQ3JCLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO2lCQUM5QjthQUNKO1NBQ0o7YUFBTTtZQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEdBQUcsc0JBQXNCLENBQUMsQ0FBQztTQUNwRTtRQUVELE9BQU87WUFDSCxRQUFRO1lBQ1IsV0FBVyxDQUFDLGlEQUFpRDtTQUNoRSxDQUFDOztDQUNMO0FBakRELHNEQWlEQyJ9