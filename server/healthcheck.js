import { getServerConfig } from './config.js';

const { port } = getServerConfig();
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 4000);

try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal
    });

    if (!response.ok) {
        throw new Error(`Healthcheck fehlgeschlagen: HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (payload.status !== 'ok') {
        throw new Error('Healthcheck meldet keinen betriebsbereiten Zustand.');
    }
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    clearTimeout(timeout);
}
