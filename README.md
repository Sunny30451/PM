# ModulPro

ModulPro wird als einzelner Produktionscontainer betrieben. Während des
Image-Builds kompiliert Vite das React-Frontend. Zur Laufzeit liefert ein
Node.js-Prozess das Frontend und die API aus und speichert den Zustand in
SQLite.

## Architektur

```text
Browser
   │ HTTPS
   ▼
Dokploy / Traefik
   │ interner Port 3000
   ▼
ModulPro-Container
   ├── dist/                         statisches React-Frontend
   ├── server/                       HTTP-API und Healthcheck
   └── /app/data/                    persistentes Named Volume
       ├── modulpro.sqlite
       ├── modulpro.sqlite-wal
       └── modulpro.sqlite-shm
```

Der Container läuft ohne Root-Rechte, mit schreibgeschütztem Root-Dateisystem
und ausschließlich beschreibbarem SQLite-Volume. Frontend und API verwenden
dieselbe Origin; eine separate CORS- oder API-URL-Konfiguration ist nicht
erforderlich.

## Lokale Entwicklung

Voraussetzung ist Node.js `>=22.13.0`.

```powershell
npm ci
npm run dev
```

- Frontend: `http://localhost:3300`
- API-Healthcheck: `http://localhost:3001/api/health`

## Lokaler Containerbetrieb

Docker Engine und Docker Compose müssen laufen.

```powershell
Copy-Item .env.example .env
npm run container:up
```

Die Anwendung ist anschließend unter `http://127.0.0.1:3000` erreichbar. Der
Port kann in `.env` über `APP_PORT` geändert werden. Mit einem gesetzten
`APP_BASE_PATH=/modulpro` lautet die lokale URL entsprechend
`http://127.0.0.1:3000/modulpro/`.

```powershell
npm run container:down
```

`container:down` entfernt den Container und das Netzwerk, aber nicht das
Named Volume. Das Volume wird nur bei einem ausdrücklich ausgeführten
`docker compose down --volumes` gelöscht.

## Deployment mit Dokploy

### 1. VPS und Repository vorbereiten

1. Dokploy auf dem VPS installieren.
2. Prüfen, dass der vorhandene Serverhostname auf die öffentliche VPS-IP zeigt.
   Eine zusätzlich registrierte Domain ist nicht zwingend erforderlich.
3. Das Repository über die GitHub-App oder einen Git-Provider mit Dokploy
   verbinden.

### 2. Compose-Anwendung anlegen

In Dokploy ein Projekt und darin einen Service vom Typ **Docker Compose**
anlegen:

- Compose-Typ: Standard Docker Compose, nicht Docker Stack
- Produktionsbranch: der gewünschte Release-Branch
- Compose-Pfad: `./docker-compose.yml`
- Isolated Deployment: aktiviert
- Replikate: genau `1`

`COMPOSE_PROJECT_NAME` und den Dokploy-`appName` nicht manuell ändern. An diesen
Namen ist das persistente Compose-Volume gekoppelt.

### 3. Domain konfigurieren

Der Container selbst benötigt kein HTTPS. Traefik nimmt die öffentliche
HTTPS-Verbindung entgegen, terminiert TLS und leitet die Anfrage intern per
HTTP an Port `3000` des Containers weiter.

Für den vorhandenen Dokploy-Hostname kann die Anwendung unter einem eigenen
Pfad betrieben werden:

`https://vmd200786.contaboserver.net/modulpro/`

Vor dem Deployment unter **Environment** setzen:

```dotenv
APP_BASE_PATH=/modulpro
```

`docker-compose.yml` reicht diesen Wert sowohl als Docker-Buildargument an Vite
als auch als Laufzeitvariable an den Node-Server weiter. Build- und
Laufzeitwert müssen identisch sein.

Anschließend unter **Domains** einen Eintrag mit diesen Zielwerten anlegen:

- Service: `app`
- Host: `vmd200786.contaboserver.net`
- Path: `/modulpro`
- Internal Path: leer
- Strip Path: deaktiviert
- Container-Port: `3000`
- HTTPS: aktiviert
- Zertifikat: Let's Encrypt

Der bestehende Dokploy-Zugriff bleibt damit auf `/`, während die längere
Pfadregel `/modulpro` zur Anwendung führt. Danach **Preview Compose**
kontrollieren und neu deployen. Änderungen an `APP_BASE_PATH` erfordern immer
einen vollständigen Neubau des Images.

Falls Dokploy auf der konkreten Installation keinen zweiten Router für
denselben Host akzeptiert, ist eine auf die Server-IP auflösende `sslip.io`-
Domain die robuste Alternative. Dafür `APP_BASE_PATH=/` verwenden und in
Dokploy keinen `Path` konfigurieren.

Der Service veröffentlicht absichtlich keinen Host-Port; externer Zugriff
erfolgt ausschließlich über Dokploy und Traefik.

### 4. SQLite persistent betreiben

Das Compose-Volume `app_data` wird auf `/app/data` gemountet. Die Hauptdatei,
WAL und SHM bleiben dadurch gemeinsam über Redeployments und Containerwechsel
erhalten.

Für Backups in Dokploy ein S3-Ziel und ein regelmäßiges **Volume Backup** für
`app_data` konfigurieren. Während des Backups den Container stoppen, damit der
SQLite-Stand einschließlich WAL konsistent bleibt. Einen Restore vor dem
Produktivbetrieb mindestens einmal testen.

## Laufzeitkonfiguration

| Variable | Containerwert | Zweck |
|---|---:|---|
| `NODE_ENV` | `production` | Produktionsmodus |
| `API_HOST` | `0.0.0.0` | Erreichbarkeit im Container-Netzwerk |
| `API_PORT` | `3000` | Interner Dokploy-Zielport |
| `APP_BASE_PATH` | `/` oder `/modulpro` | Öffentlicher URL-Pfad; wirkt beim Build und zur Laufzeit |
| `DATABASE_PATH` | `/app/data/modulpro.sqlite` | Datei im persistenten Volume |

Diese Werte sind als Betriebsvertrag in `docker-compose.yml` festgelegt.

## Betrieb und Sicherheit

- Healthcheck: `GET <APP_BASE_PATH>/api/health`; prüft Prozess und
  SQLite-Verbindung.
- SQLite ist für eine einzelne laufende Instanz vorgesehen. Keine horizontale
  Skalierung und keine parallelen schreibenden Replikate aktivieren.
- Die Anwendung besitzt derzeit keine Benutzeranmeldung. Eine öffentliche
  Domain darf daher erst nach Ergänzung einer Authentifizierung oder einem
  vorgeschalteten Zugriffsschutz für sensible Daten verwendet werden.
- Persistente Dateien niemals aus dem geklonten Repository mounten. Dokploy
  klont den Quellstand bei Auto-Deployments neu.
- Nach Änderungen an Domain oder Laufzeitvariablen immer neu deployen.
- Das Runtime-Image ist im `Dockerfile` auf Node.js `24.18.0` festgelegt.
  Sicherheits- und LTS-Aktualisierungen müssen kontrolliert nachgezogen und
  mit dem Container-Test validiert werden.

## Offizielle Dokploy-Dokumentation

- [Docker Compose](https://docs.dokploy.com/docs/core/docker-compose)
- [Compose-Domains](https://docs.dokploy.com/docs/core/docker-compose/domains)
- [GitHub-Integration](https://docs.dokploy.com/docs/core/github)
- [Volume-Backups](https://docs.dokploy.com/docs/core/volume-backups)
