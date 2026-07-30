let saveQueue = Promise.resolve();
const stateEndpoint = `${import.meta.env.BASE_URL}api/state`;

async function getErrorMessage(response) {
    try {
        const payload = await response.json();
        return payload.error || `Datenbankanfrage fehlgeschlagen (${response.status})`;
    } catch {
        return `Datenbankanfrage fehlgeschlagen (${response.status})`;
    }
}

export async function loadAppState(signal) {
    const response = await fetch(stateEndpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal
    });

    if (response.status === 204) return null;
    if (!response.ok) throw new Error(await getErrorMessage(response));

    return response.json();
}

async function persistAppState(state) {
    const response = await fetch(stateEndpoint, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(state)
    });

    if (!response.ok) throw new Error(await getErrorMessage(response));
}

export function saveAppState(state) {
    const queuedRequest = saveQueue
        .catch(() => undefined)
        .then(() => persistAppState(state));

    saveQueue = queuedRequest;
    return queuedRequest;
}
