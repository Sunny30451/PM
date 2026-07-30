import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createDatabase } from './database.js';

test('speichert und lädt den vollständigen Anwendungszustand dauerhaft', () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'modulpro-'));
    const databasePath = join(temporaryDirectory, 'test.sqlite');
    const expectedState = {
        projects: [
            {
                id: 'project-1',
                name: 'Persistenztest',
                addonData: {
                    tasks: {
                        list: [{ id: 'task-1', text: 'SQLite prüfen', done: true }]
                    }
                }
            }
        ],
        globalSchema: [{ id: 'priority', type: 'select' }],
        globalAddons: [{ id: 'tasks', type: 'tasks' }],
        globalBaseTypes: [{ id: 'tasks', coreType: 'tasks' }]
    };

    const firstConnection = createDatabase(databasePath);
    assert.equal(firstConnection.isHealthy(), true);
    firstConnection.saveState(expectedState);
    firstConnection.close();

    const secondConnection = createDatabase(databasePath);
    assert.deepEqual(secondConnection.loadState(), expectedState);
    secondConnection.close();

    rmSync(temporaryDirectory, { recursive: true, force: true });
});

test('unterscheidet eine leere Datenbank von einem Zustand ohne Projekte', () => {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'modulpro-'));
    const databasePath = join(temporaryDirectory, 'test.sqlite');
    const database = createDatabase(databasePath);

    assert.equal(database.loadState(), null);

    const emptyState = {
        projects: [],
        globalSchema: [],
        globalAddons: [],
        globalBaseTypes: []
    };
    database.saveState(emptyState);
    assert.deepEqual(database.loadState(), emptyState);
    database.close();

    rmSync(temporaryDirectory, { recursive: true, force: true });
});
