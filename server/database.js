import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function getDefaultDatabasePath() {
    const configuredPath = process.env.DATABASE_PATH?.trim();
    return configuredPath
        ? resolve(configuredPath)
        : resolve(projectDirectory, 'data', 'modulpro.sqlite');
}

export function createDatabase(databasePath = getDefaultDatabasePath()) {
    const resolvedPath = resolve(databasePath);
    mkdirSync(dirname(resolvedPath), { recursive: true });

    const database = new DatabaseSync(resolvedPath);
    database.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA busy_timeout = 5000;

        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            position INTEGER NOT NULL,
            data TEXT NOT NULL,
            updated_at TEXT NOT NULL
        ) STRICT;

        CREATE TABLE IF NOT EXISTS app_settings (
            key TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            updated_at TEXT NOT NULL
        ) STRICT;
    `);

    const selectProjects = database.prepare(`
        SELECT data
        FROM projects
        ORDER BY position ASC
    `);
    const selectSettings = database.prepare(`
        SELECT key, data
        FROM app_settings
    `);
    const countSettings = database.prepare(`
        SELECT COUNT(*) AS count
        FROM app_settings
    `);
    const checkConnection = database.prepare('SELECT 1 AS healthy');
    const deleteProjects = database.prepare('DELETE FROM projects');
    const insertProject = database.prepare(`
        INSERT INTO projects (id, position, data, updated_at)
        VALUES (?, ?, ?, ?)
    `);
    const upsertSetting = database.prepare(`
        INSERT INTO app_settings (key, data, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
            data = excluded.data,
            updated_at = excluded.updated_at
    `);

    function loadState() {
        const settingCount = Number(countSettings.get().count);
        if (settingCount === 0) return null;

        const settings = Object.fromEntries(
            selectSettings.all().map(row => [row.key, JSON.parse(row.data)])
        );

        return {
            projects: selectProjects.all().map(row => JSON.parse(row.data)),
            globalSchema: settings.globalSchema ?? [],
            globalAddons: settings.globalAddons ?? [],
            globalBaseTypes: settings.globalBaseTypes ?? []
        };
    }

    function saveState(state) {
        const updatedAt = new Date().toISOString();

        database.exec('BEGIN IMMEDIATE');
        try {
            deleteProjects.run();
            state.projects.forEach((project, position) => {
                insertProject.run(
                    project.id,
                    position,
                    JSON.stringify(project),
                    updatedAt
                );
            });

            upsertSetting.run(
                'globalSchema',
                JSON.stringify(state.globalSchema),
                updatedAt
            );
            upsertSetting.run(
                'globalAddons',
                JSON.stringify(state.globalAddons),
                updatedAt
            );
            upsertSetting.run(
                'globalBaseTypes',
                JSON.stringify(state.globalBaseTypes),
                updatedAt
            );

            database.exec('COMMIT');
            return updatedAt;
        } catch (error) {
            database.exec('ROLLBACK');
            throw error;
        }
    }

    return {
        path: resolvedPath,
        isHealthy: () => checkConnection.get().healthy === 1,
        loadState,
        saveState,
        close: () => database.close()
    };
}
