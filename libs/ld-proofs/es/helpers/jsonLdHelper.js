/* eslint-disable jsdoc/require-jsdoc */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkxkSGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hlbHBlcnMvanNvbkxkSGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdDQUF3QztBQUV4QyxNQUFNLElBQUksR0FBRyxrQkFBa0IsQ0FBQztBQUNoQyxNQUFNLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQztBQUV0Qzs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLHFCQUFxQixDQUFDLEdBQVcsRUFBRSxPQUFPO0lBSTVELE1BQU0sT0FBTyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7SUFDOUIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLElBQUksT0FBTyxFQUFFLENBQUMsQ0FBQztJQUUvQyxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVsQyxJQUFJLFFBQWlDLENBQUM7SUFDdEMsSUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDO0lBRXRCLElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRTtRQUNiLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXhFLDZFQUE2RTtRQUM3RSxnREFBZ0Q7UUFDaEQsSUFBSSxZQUFZLEtBQUssSUFBSSxJQUFJLFlBQVksS0FBSyxPQUFPLEVBQUU7WUFDbkQsa0RBQWtEO1lBQ2xELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFbkMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUN0QyxnREFBZ0Q7Z0JBQ2hELElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDbEMsTUFBTSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZDLHlCQUF5QjtvQkFDekIsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUN0RSx1Q0FBdUM7b0JBQ3ZDLE1BQU0sVUFBVSxHQUFHLEdBQUcsR0FBRyxHQUFHLFNBQVMsRUFBRSxDQUFDO29CQUN4QyxxRkFBcUY7b0JBQ3JGLElBQUksVUFBVSxLQUFLLEdBQUcsRUFBRTt3QkFDcEIsT0FBTyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7cUJBQ2hEO2lCQUNKO2FBQ0o7U0FDSjthQUFNO1lBQ0gsUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2pDLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRTtnQkFDckIsV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7YUFDOUI7U0FDSjtLQUNKO1NBQU07UUFDSCxzQ0FBc0M7UUFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDO0tBQ3BFO0lBRUQsT0FBTztRQUNILFFBQVE7UUFDUixXQUFXLENBQUMsaURBQWlEO0tBQ2hFLENBQUM7QUFDTixDQUFDIn0=