import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const projectDirectory = resolve(import.meta.dirname, '..');
const processes = [
    spawn(process.execPath, ['server/server.js'], {
        cwd: projectDirectory,
        stdio: 'inherit'
    }),
    spawn(
        process.execPath,
        ['node_modules/vite/bin/vite.js', '--host', '--port', '3300'],
        {
            cwd: projectDirectory,
            stdio: 'inherit'
        }
    )
];

let isShuttingDown = false;

function shutdown(exitCode = 0) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    for (const child of processes) {
        if (!child.killed) child.kill();
    }

    process.exitCode = exitCode;
}

for (const child of processes) {
    child.on('error', error => {
        console.error(error);
        shutdown(1);
    });

    child.on('exit', (code, signal) => {
        if (!isShuttingDown) {
            const exitCode = signal ? 1 : (code ?? 1);
            shutdown(exitCode);
        }
    });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
