import assert from 'node:assert/strict';
import test from 'node:test';
import { getServerConfig } from './config.js';

test('verwendet sichere lokale Standardwerte', () => {
    assert.deepEqual(getServerConfig({}), {
        host: '127.0.0.1',
        port: 3001,
        basePath: '/'
    });
});

test('liest die Container-Netzwerkkonfiguration aus der Umgebung', () => {
    assert.deepEqual(
        getServerConfig({
            API_HOST: '0.0.0.0',
            API_PORT: '3000',
            APP_BASE_PATH: '/modulpro/'
        }),
        {
            host: '0.0.0.0',
            port: 3000,
            basePath: '/modulpro'
        }
    );
});

test('weist ungültige Ports frühzeitig zurück', () => {
    assert.throws(
        () => getServerConfig({ API_PORT: 'not-a-port' }),
        /API_PORT muss eine ganze Zahl sein/
    );
    assert.throws(
        () => getServerConfig({ API_PORT: '70000' }),
        /API_PORT muss zwischen 1 und 65535 liegen/
    );
});

test('normalisiert und validiert den öffentlichen Anwendungspfad', () => {
    assert.equal(
        getServerConfig({ APP_BASE_PATH: 'tools/modulpro/' }).basePath,
        '/tools/modulpro'
    );
    assert.throws(
        () => getServerConfig({ APP_BASE_PATH: '/../admin' }),
        /APP_BASE_PATH muss ein sicherer URL-Pfad sein/
    );
    assert.throws(
        () => getServerConfig({ APP_BASE_PATH: '/modul pro' }),
        /APP_BASE_PATH muss ein sicherer URL-Pfad sein/
    );
});
