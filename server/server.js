import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getServerConfig } from './config.js';
import { createDatabase } from './database.js';

const maximumRequestSize = 10 * 1024 * 1024;
const serverDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)));
const distributionDirectory = resolve(serverDirectory, '..', 'dist');
const database = createDatabase();

const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
};

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
    });
    response.end(payload === undefined ? undefined : JSON.stringify(payload));
}

async function readJsonBody(request) {
    let size = 0;
    const chunks = [];

    for await (const chunk of request) {
        size += chunk.length;
        if (size > maximumRequestSize) {
            const error = new Error('Anfrage ist größer als 10 MB.');
            error.statusCode = 413;
            throw error;
        }
        chunks.push(chunk);
    }

    try {
        return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
        const error = new Error('Ungültiger JSON-Inhalt.');
        error.statusCode = 400;
        throw error;
    }
}

function validateState(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw new TypeError('Der Datenzustand muss ein Objekt sein.');
    }

    const requiredArrays = [
        'projects',
        'globalSchema',
        'globalAddons',
        'globalBaseTypes'
    ];

    for (const property of requiredArrays) {
        if (!Array.isArray(payload[property])) {
            throw new TypeError(`"${property}" muss ein Array sein.`);
        }
    }

    const projectIds = new Set();
    for (const project of payload.projects) {
        if (!project || typeof project !== 'object' || Array.isArray(project)) {
            throw new TypeError('Jedes Projekt muss ein Objekt sein.');
        }
        if (typeof project.id !== 'string' || project.id.trim() === '') {
            throw new TypeError('Jedes Projekt benötigt eine nicht leere String-ID.');
        }
        if (projectIds.has(project.id)) {
            throw new TypeError(`Projekt-ID "${project.id}" ist doppelt vorhanden.`);
        }
        projectIds.add(project.id);
    }

    return {
        projects: payload.projects,
        globalSchema: payload.globalSchema,
        globalAddons: payload.globalAddons,
        globalBaseTypes: payload.globalBaseTypes
    };
}

async function serveStaticFile(request, response, pathname) {
    let decodedPath;
    try {
        decodedPath = decodeURIComponent(pathname);
    } catch {
        sendJson(response, 400, { error: 'Ungültiger URL-Pfad.' });
        return;
    }

    const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.slice(1);
    let filePath = resolve(distributionDirectory, relativePath);

    if (
        filePath !== distributionDirectory
        && !filePath.startsWith(`${distributionDirectory}${sep}`)
    ) {
        sendJson(response, 403, { error: 'Zugriff verweigert.' });
        return;
    }

    try {
        const fileStats = await stat(filePath);
        if (!fileStats.isFile()) throw new Error('Not a file');
    } catch {
        filePath = resolve(distributionDirectory, 'index.html');
        if (!existsSync(filePath)) {
            sendJson(response, 404, {
                error: 'Frontend-Build fehlt. Bitte zuerst "npm run build" ausführen.'
            });
            return;
        }
    }

    response.writeHead(200, {
        'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream',
        'Cache-Control': filePath.endsWith('index.html')
            ? 'no-cache'
            : 'public, max-age=31536000, immutable'
    });

    if (request.method === 'HEAD') {
        response.end();
        return;
    }

    createReadStream(filePath)
        .on('error', () => {
            if (!response.headersSent) {
                sendJson(response, 500, { error: 'Datei konnte nicht gelesen werden.' });
            } else {
                response.destroy();
            }
        })
        .pipe(response);
}

const server = createServer(async (request, response) => {
    const url = new URL(request.url || '/', 'http://localhost');

    try {
        if (url.pathname === '/api/health' && request.method === 'GET') {
            if (!database.isHealthy()) {
                throw new Error('SQLite-Verbindung ist nicht betriebsbereit.');
            }
            sendJson(response, 200, { status: 'ok' });
            return;
        }

        if (url.pathname === '/api/state' && request.method === 'GET') {
            const state = database.loadState();
            if (state === null) {
                response.writeHead(204, { 'Cache-Control': 'no-store' });
                response.end();
            } else {
                sendJson(response, 200, state);
            }
            return;
        }

        if (url.pathname === '/api/state' && request.method === 'PUT') {
            const payload = validateState(await readJsonBody(request));
            const updatedAt = database.saveState(payload);
            sendJson(response, 200, { updatedAt });
            return;
        }

        if (url.pathname.startsWith('/api/')) {
            sendJson(response, 404, { error: 'API-Endpunkt nicht gefunden.' });
            return;
        }

        if (request.method === 'GET' || request.method === 'HEAD') {
            await serveStaticFile(request, response, url.pathname);
            return;
        }

        sendJson(response, 405, { error: 'Methode nicht erlaubt.' });
    } catch (error) {
        const isValidationError = error instanceof TypeError;
        const statusCode = error.statusCode || (isValidationError ? 400 : 500);
        const message = statusCode >= 500
            ? 'Interner Datenbankfehler.'
            : error.message;

        if (statusCode >= 500) console.error(error);
        sendJson(response, statusCode, { error: message });
    }
});

const { host, port } = getServerConfig();

server.listen(port, host, () => {
    console.log(`ModulPro API läuft auf http://${host}:${port}`);
    console.log(`SQLite-Datenbank: ${database.path}`);
});

let isShuttingDown = false;

function shutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`Signal ${signal} empfangen, Server wird beendet.`);

    const forceShutdown = setTimeout(() => {
        console.error('Server konnte nicht innerhalb von 10 Sekunden beendet werden.');
        server.closeAllConnections();
        process.exit(1);
    }, 10_000);
    forceShutdown.unref();

    server.close(error => {
        clearTimeout(forceShutdown);

        try {
            database.close();
        } catch (databaseError) {
            console.error(databaseError);
            process.exitCode = 1;
        }

        if (error) {
            console.error(error);
            process.exitCode = 1;
        }
    });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
