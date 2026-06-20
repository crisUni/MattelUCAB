import {sql} from "bun";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

export async function fetchAll<T>(table: string): Promise<Response> {
    try {
        const found = await sql`SELECT * FROM ${sql(table)}` as T[];
        if (!found.length)
            return new Response('No resources found', { status: 404, headers: CORS_HEADERS })
        return Response.json(found, { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json"} })
    } catch (e) {
        return new Response(String(e), { status: 500, headers: CORS_HEADERS });
    }
}

export async function insertOne(table: string, data: Record<string, unknown>): Promise<Response> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`);
    try {
        const query = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
        const result = await sql.unsafe(query, values) as Record<string, unknown>[];
        return Response.json(result[0], { status: 201, headers: { ...CORS_HEADERS, "Content-Type": "application/json"} })
    } catch (e) {
        return new Response(String(e), { status: 500, headers: CORS_HEADERS });
    }
}

export async function listAll<T>(funcName: string): Promise<Response> {
    try {
        const found = await sql.unsafe(`SELECT * FROM ${funcName}()`) as T[];
        if (!found.length)
            return new Response('No resources found', { status: 404, headers: CORS_HEADERS })
        return Response.json(found, { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json"} })
    } catch (e) {
        return new Response(String(e), { status: 500, headers: CORS_HEADERS });
    }
}

export async function callProcedure(procName: string, params: unknown[]): Promise<Response> {
    try {
        const placeholders = params.map((_, i) => `$${i + 1}`).join(", ");
        await sql.unsafe(`CALL ${procName}(${placeholders})`, params);
        return new Response('Created', { status: 201, headers: CORS_HEADERS })
    } catch (e) {
        return new Response(String(e), { status: 500, headers: CORS_HEADERS });
    }
}

export async function callUpdate(procName: string, params: unknown[]): Promise<Response> {
    try {
        const placeholders = params.map((_, i) => `$${i + 1}`).join(", ");
        await sql.unsafe(`CALL ${procName}(${placeholders})`, params);
        return new Response('Updated', { status: 200, headers: CORS_HEADERS })
    } catch (e) {
        return new Response(String(e), { status: 500, headers: CORS_HEADERS });
    }
}
