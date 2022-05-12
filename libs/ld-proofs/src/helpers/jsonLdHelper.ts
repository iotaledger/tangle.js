const JSON = "application/json";
const JSON_LD = "application/ld+json";

/**
 * JSON-LD @context loader
 *
 * @param url The URL of the LD @context
 * @param options Options
 * @returns the LD document and the final URL after following redirects
 */
export async function customLdContextLoader(url: string, options): Promise<{
    document: Record<string, unknown>;
    documentUrl: string;
}> {
    const headers = new Headers();
    headers.append("accept", `${JSON},${JSON_LD}`);

    const response = await fetch(url);

    let document: Record<string, unknown>;
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
        } else {
            document = await response.json();
            if (response.redirected) {
                documentUrl = response.url;
            }
        }
    } else {
        console.error(`The JSON-LD @context ${url} cannot be retrieved`);
    }

    return {
        document, // this is the actual document that was loaded
        documentUrl // this is the actual context URL after redirects
    };
}
