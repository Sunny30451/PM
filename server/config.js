const defaultHost = '127.0.0.1';
const defaultPort = 3001;

function parsePort(value) {
    const normalizedValue = String(value).trim();
    if (!/^\d+$/.test(normalizedValue)) {
        throw new TypeError(`API_PORT muss eine ganze Zahl sein: "${value}"`);
    }

    const port = Number.parseInt(normalizedValue, 10);
    if (port < 1 || port > 65535) {
        throw new RangeError(`API_PORT muss zwischen 1 und 65535 liegen: ${port}`);
    }

    return port;
}

export function getServerConfig(environment = process.env) {
    return {
        host: environment.API_HOST?.trim() || defaultHost,
        port: parsePort(environment.API_PORT || defaultPort)
    };
}
