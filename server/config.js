const defaultHost = '127.0.0.1';
const defaultPort = 3001;

export function normalizeBasePath(value = '/') {
    const normalizedValue = String(value).trim();
    if (normalizedValue === '' || normalizedValue === '/') return '/';

    const segments = normalizedValue.split('/').filter(Boolean);
    const hasInvalidSegment = segments.some(segment => (
        segment === '.'
        || segment === '..'
        || !/^[A-Za-z0-9._~-]+$/.test(segment)
    ));

    if (segments.length === 0 || hasInvalidSegment) {
        throw new TypeError(
            `APP_BASE_PATH muss ein sicherer URL-Pfad sein: "${value}"`
        );
    }

    return `/${segments.join('/')}`;
}

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
        port: parsePort(environment.API_PORT || defaultPort),
        basePath: normalizeBasePath(environment.APP_BASE_PATH)
    };
}
