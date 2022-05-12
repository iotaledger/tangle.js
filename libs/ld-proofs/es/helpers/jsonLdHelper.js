const JSON = "application/json";
const JSON_LD = "application/ld+json";
/**
 * JSON-LD @context loader
 *
 * @param url The URL of the LD @context
 * @param options Options
 * @returns the LD document and the final URL after following redirects
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
        console.error(`The JSON-LD @context ${url} cannot be retrieved`);
    }
    return {
        document,
        documentUrl // this is the actual context URL after redirects
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkxkSGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvanNvbkxkSGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sSUFBSSxHQUFHLGtCQUFrQixDQUFDO0FBQ2hDLE1BQU0sT0FBTyxHQUFHLHFCQUFxQixDQUFDO0FBRXRDOzs7Ozs7R0FNRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUscUJBQXFCLENBQUMsR0FBVyxFQUFFLE9BQU87SUFJNUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztJQUM5QixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBRS9DLE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWxDLElBQUksUUFBaUMsQ0FBQztJQUN0QyxJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUM7SUFFdEIsSUFBSSxRQUFRLENBQUMsRUFBRSxFQUFFO1FBQ2IsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFeEUsNkVBQTZFO1FBQzdFLGdEQUFnRDtRQUNoRCxJQUFJLFlBQVksS0FBSyxJQUFJLElBQUksWUFBWSxLQUFLLE9BQU8sRUFBRTtZQUNuRCxrREFBa0Q7WUFDbEQsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVuQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ3RDLGdEQUFnRDtnQkFDaEQsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNsQyxNQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkMseUJBQXlCO29CQUN6QixNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3RFLHVDQUF1QztvQkFDdkMsTUFBTSxVQUFVLEdBQUcsR0FBRyxHQUFHLEdBQUcsU0FBUyxFQUFFLENBQUM7b0JBQ3hDLHFGQUFxRjtvQkFDckYsSUFBSSxVQUFVLEtBQUssR0FBRyxFQUFFO3dCQUNwQixPQUFPLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztxQkFDaEQ7aUJBQ0o7YUFDSjtTQUNKO2FBQU07WUFDSCxRQUFRLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakMsSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFO2dCQUNyQixXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQzthQUM5QjtTQUNKO0tBQ0o7U0FBTTtRQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEdBQUcsc0JBQXNCLENBQUMsQ0FBQztLQUNwRTtJQUVELE9BQU87UUFDSCxRQUFRO1FBQ1IsV0FBVyxDQUFDLGlEQUFpRDtLQUNoRSxDQUFDO0FBQ04sQ0FBQyJ9