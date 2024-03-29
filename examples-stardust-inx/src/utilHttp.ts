import fetch, { Headers } from "node-fetch";
import https from "node:https";
import http from "node:http";

function getAgent(endpoint: string): (http.Agent | https.Agent) {
    let agent: https.Agent | http.Agent = new http.Agent();

    if (endpoint.startsWith("https")) {
        agent = new https.Agent({
            rejectUnauthorized: false,
        });
    }

    return agent;
}

export async function post(endpoint: string, auth: string, payload: unknown): Promise<unknown> {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (auth) {
        headers.set("Authorization", `Bearer ${auth}`);
    }

    const requestOptions = {
        headers,
        method: "POST",
        body: JSON.stringify(payload),
        agent: getAgent(endpoint)
    };

    const response = await fetch(`${endpoint}`, requestOptions);
    const json = await response.json();

    if (response.status !== 200 && response.status !== 201) {
        console.error("Error payload: ", json);
        throw new Error(`Bad status: ${response.status}`);
    }

    return json;
}

export async function get(endpoint: string, auth: string): Promise<unknown> {
    const agent = getAgent(endpoint);

    const headers = new Headers();
    headers.set("Accept", "application/json");
    if (auth) {
        headers.set("Authorization", `Bearer ${auth}`);
    }

    const response = await fetch(`${endpoint}`, { headers, agent });
    const json = await response.json();

    if (response.status !== 200) {
        console.error("Error payload: ", json);
        throw new Error(`Bad status: ${response.status}`);
    }

    return json;
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function toUnixSeconds(iso8601Date: string): number {
    const date = new Date(iso8601Date);

    return Math.round(date.getTime() / 1000);
}

export type Doc = { [id: string]: unknown };
export type Meta = { [id: string]: unknown };

export type Signature = { publicKey: string; signature: string; };

export type FullDoc = { doc: Doc; meta: Meta; };

export type TrailRecord = { [id: string]: unknown };
export type TrailImmutable = { [id: string]: unknown };

export type Trail = {
    trail: { record: TrailRecord, immutable: TrailImmutable };
    meta: Meta
};
