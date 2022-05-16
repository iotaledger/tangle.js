/* eslint-disable jsdoc/require-jsdoc */
import fetch from "node-fetch";
const JSON = "application/json";
const JSON_LD = "application/ld+json";
/**
 * JSON-LD @context loader.
 *
 * @param url The URL of the LD @context.
 * @param options Options.
 * @returns The LD document and the final URL after following redirects.
 */
export async function customLdContextLoader(url, options) {
    const headers = new Headers();
    headers.append("accept", `${JSON},${JSON_LD}`);
    const response = await fetch(url);
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
            if (components[1]?.includes("alternate")) {
                // eslint-disable-next-line unicorn/no-lonely-if
                if (components[2]?.includes(JSON_LD)) {
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
            document = await response.json();
            if (response.redirected) {
                documentUrl = response.url;
            }
        }
    }
    else {
        // eslint-disable-next-line no-console
        console.error(`The JSON-LD @context ${url} cannot be retrieved`);
    }
    return {
        document,
        documentUrl // this is the actual context URL after redirects
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkxkSGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvanNvbkxkSGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdDQUF3QztBQUN4QyxPQUFPLEtBQUssTUFBTSxZQUFZLENBQUM7QUFFL0IsTUFBTSxJQUFJLEdBQUcsa0JBQWtCLENBQUM7QUFDaEMsTUFBTSxPQUFPLEdBQUcscUJBQXFCLENBQUM7QUFFdEM7Ozs7OztHQU1HO0FBQ0gsTUFBTSxDQUFDLEtBQUssVUFBVSxxQkFBcUIsQ0FBQyxHQUFXLEVBQUUsT0FBTztJQUk1RCxNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBQzlCLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEdBQUcsSUFBSSxJQUFJLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFFL0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFbEMsSUFBSSxRQUFpQyxDQUFDO0lBQ3RDLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQztJQUV0QixJQUFJLFFBQVEsQ0FBQyxFQUFFLEVBQUU7UUFDYixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUV4RSw2RUFBNkU7UUFDN0UsZ0RBQWdEO1FBQ2hELElBQUksWUFBWSxLQUFLLElBQUksSUFBSSxZQUFZLEtBQUssT0FBTyxFQUFFO1lBQ25ELGtEQUFrRDtZQUNsRCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRW5DLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDdEMsZ0RBQWdEO2dCQUNoRCxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ2xDLE1BQU0sZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2Qyx5QkFBeUI7b0JBQ3pCLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDdEUsdUNBQXVDO29CQUN2QyxNQUFNLFVBQVUsR0FBRyxHQUFHLEdBQUcsR0FBRyxTQUFTLEVBQUUsQ0FBQztvQkFDeEMscUZBQXFGO29CQUNyRixJQUFJLFVBQVUsS0FBSyxHQUFHLEVBQUU7d0JBQ3BCLE9BQU8scUJBQXFCLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO3FCQUNoRDtpQkFDSjthQUNKO1NBQ0o7YUFBTTtZQUNILFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNqQyxJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3JCLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO2FBQzlCO1NBQ0o7S0FDSjtTQUFNO1FBQ0gsc0NBQXNDO1FBQ3RDLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEdBQUcsc0JBQXNCLENBQUMsQ0FBQztLQUNwRTtJQUVELE9BQU87UUFDSCxRQUFRO1FBQ1IsV0FBVyxDQUFDLGlEQUFpRDtLQUNoRSxDQUFDO0FBQ04sQ0FBQyJ9