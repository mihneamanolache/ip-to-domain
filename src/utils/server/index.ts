// server.ts
import type { Server } from 'bun';
import { database } from '../..';

const server: Server = Bun.serve({
    fetch: async (req: Request): Promise<Response> => {
        const url: URL = new URL(req.url);
        const ip: string = url.pathname.slice(1);
        const ipRegex: RegExp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipRegex.test(ip)) {
            return new Response(JSON.stringify({ error: 'Invalid IP address' }), { status: 400 });
        }
        try {
            const domains: Array<string> = await database.getDomainsByIP(ip);
            const json: string | null = url.searchParams.get('json');
            if (json && json === 'true') {
                return new Response(JSON.stringify({ domains, count: domains.length }), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 200,
                });
            } 
            return new Response(domains.join('\n'), { status: 200 });
        } catch (error) {
            return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
        } 
    },
    port: Bun.env.PORT ?? 3000, 
});

export default server;
