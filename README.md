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

Die produktive Instanz läuft auf dem CONTABO-VPS mit folgenden Endpunkten:

- Serverhostname: `vmd200786.contaboserver.net`
- Öffentliche IPv4: `173.212.201.249`
- Dokploy: `https://vmd200786.contaboserver.net/`
- ModulPro: `https://vmd200786.contaboserver.net/modulpro/`

Der vorhandene CONTABO-Hostname zeigt bereits auf den VPS. Eine zusätzliche
registrierte Domain oder `sslip.io`-Domain ist für diese Konfiguration nicht
erforderlich.

### 2. Compose-Anwendung anlegen

Im Dokploy-Projekt wird ein Service vom Typ **Docker Compose** mit der
GitHub-Quelle konfiguriert:

- Provider: GitHub
- GitHub Account: `vmd200786-Dokploy-2026-07-11`
- Repository: `PM`
- Branch: `docker`
- Compose-Pfad: `./docker-compose.yml`
- Trigger Type: `On Push`
- Watch Paths: leer
- Submodules: deaktiviert
- Compose-Typ: Standard Docker Compose, nicht Docker Stack
- Isolated Deployment: aktiviert
- Replikate: genau `1`

Jeder Push auf den Branch `docker` löst damit ein Deployment aus. Änderungen
an Domain oder Environment müssen zusätzlich gespeichert und durch ein
Redeployment des Compose-Service aktiviert werden.

`COMPOSE_PROJECT_NAME` und den Dokploy-`appName` nicht manuell ändern. An diesen
Namen ist das persistente Compose-Volume gekoppelt.

### 3. Domain konfigurieren

Der Container selbst benötigt kein HTTPS. Traefik nimmt die öffentliche
HTTPS-Verbindung entgegen, terminiert TLS und leitet die Anfrage intern per
HTTP an Port `3000` des Containers weiter.

Für den vorhandenen Dokploy-Hostname kann die Anwendung unter einem eigenen
Pfad betrieben werden:

`https://vmd200786.contaboserver.net/modulpro/`

Unter **Environment** ist exakt folgende Variable gesetzt:

```dotenv
APP_BASE_PATH=/modulpro
```

`docker-compose.yml` reicht diesen Wert sowohl als Docker-Buildargument an Vite
als auch als Laufzeitvariable an den Node-Server weiter. Build- und
Laufzeitwert müssen identisch sein.

Der funktionierende Domain-Eintrag verwendet exakt diese Werte:

- Service: `app`
- Host: `vmd200786.contaboserver.net`
- Path: `/modulpro`
- Internal Path: `/modulpro`
- Strip Path: aktiviert
- Container-Port: `3000`
- Custom Entrypoint: deaktiviert
- HTTPS: aktiviert
- Zertifikat: Let's Encrypt
- Middlewares: keine

`Strip Path` und `Internal Path` bilden hier eine zusammengehörige
Transformation. Traefik entfernt zunächst den öffentlichen Präfix
`/modulpro` und fügt anschließend den internen Präfix `/modulpro` wieder hinzu.
Dadurch erhält der Container alle Frontend-, Asset- und API-Anfragen unter dem
Pfad, den `APP_BASE_PATH` vorgibt. Diese drei Einstellungen nicht unabhängig
voneinander ändern.

Der bestehende Dokploy-Zugriff bleibt auf `/`, während `/modulpro` zur
Anwendung führt. Änderungen an Domain oder `APP_BASE_PATH` erfordern ein
Redeployment mit neuem Image-Build; ein einfacher Container-Restart genügt
nicht.

Kontrollaufruf nach dem Deployment:

```powershell
curl.exe -i https://vmd200786.contaboserver.net/modulpro/api/health
```

Erwartet werden `HTTP/1.1 200`, `Content-Type: application/json` und:

```json
{"status":"ok"}
```

Wenn stattdessen eine HTML-Seite mit dem Titel `Dokploy` zurückkommt, verarbeitet
weiterhin der Panel-Router die Anfrage. Dann Domain-Pfad, Service, Port und
Redeployment prüfen. Ein JavaScript-Asset mit `Content-Type: text/html` ist
dieselbe Fehlkonfiguration und kein Browser- oder MIME-Problem.

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

| Variable | Produktivwert | Zweck |
|---|---:|---|
| `NODE_ENV` | `production` | Produktionsmodus |
| `API_HOST` | `0.0.0.0` | Erreichbarkeit im Container-Netzwerk |
| `API_PORT` | `3000` | Interner Dokploy-Zielport |
| `APP_BASE_PATH` | `/modulpro` | Öffentlicher URL-Pfad; wirkt beim Build und zur Laufzeit |
| `DATABASE_PATH` | `/app/data/modulpro.sqlite` | Datei im persistenten Volume |

`docker-compose.yml` verwendet aktuell zusätzlich folgende
Betriebseinstellungen:

| Bereich | Einstellung |
|---|---|
| Build | Multi-Stage-`Dockerfile`, Target `runtime` |
| Netzwerk | Nur `expose: 3000`; keine öffentliche Host-Portbindung |
| Lokaler Port | Ausschließlich über `docker-compose.local.yml`: `127.0.0.1:3000` |
| Persistenz | Named Volume `app_data` auf `/app/data` |
| Root-Dateisystem | `read_only: true` |
| Temporärer Speicher | `/tmp` als 16-MB-`tmpfs` |
| Prozessrechte | Benutzer `node`, alle Linux-Capabilities entfernt |
| Privilegien | `no-new-privileges:true` |
| Neustart | `unless-stopped` |
| Shutdown | `SIGTERM`, Grace Period 15 Sekunden |
| Healthcheck | alle 30 Sekunden, 5 Sekunden Timeout, 3 Versuche |

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
