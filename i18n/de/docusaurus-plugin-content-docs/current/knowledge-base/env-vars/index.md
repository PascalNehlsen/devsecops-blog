# Umgebungsvariablen sicher verwenden

Umgebungsvariablen erlauben es, Anwendungen zu konfigurieren, ohne Werte im Quellcode festzuschreiben. Falsch behandelt erzeugen sie allerdings ernste Sicherheitslücken.

## Umgebungsvariablen in Node.js

In Node.js-Anwendungen lädt das Paket dotenv Umgebungsvariablen aus `.env`-Dateien. Das trennt Konfiguration von Code und erlaubt je Umgebung eine eigene Konfiguration.

### Schritte, um .env in Node.js zu nutzen:

#### dotenv installieren:

```bash
npm install dotenv
```

#### Eine .env-Datei im Projektwurzelverzeichnis anlegen.

Beispiel:

```env title="example.env"
PORT=3000
DATABASE_URL=mongodb://localhost:27017/myapp
SECRET_KEY=mysecretkey
```

#### Die .env-Datei in der Anwendung laden:

Lade die Variablen in der Einstiegsdatei (etwa app.js oder index.js) über dotenv:

```js title="app.js"
require('dotenv').config();

const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;
const secretKey = process.env.SECRET_KEY;

console.log(`Server is running on port: ${port}`);
```

#### Auf die Variablen zugreifen:

```js title="app.js"
console.log(process.env.PORT);  // Output: 3000
```

## Bewährte Sicherheitspraxis für Umgebungsvariablen

**Niemals .env-Dateien committen**: Trage `.env` in `.gitignore` ein, damit keine Credentials in die Versionskontrolle wandern. Einmal committete Secrets lassen sich über die Repository-Historie finden, auch nachdem sie entfernt wurden.

```text title=".gitignore"
.env
.env.local
.env.*.local
```

**.env.example als Vorlage nutzen**: Liefere eine `.env.example`, die die nötigen Variablen dokumentiert, ohne echte Werte zu enthalten:

```env title=".env.example"
PORT=
DATABASE_URL=
SECRET_KEY=
API_KEY=
```

**Umgebungsvariablen validieren**: Prüfe beim Start, ob alle nötigen Variablen vorhanden und gültig sind. Brich sofort ab, wenn kritische Konfiguration fehlt:

```js
const requiredEnvVars = ['DATABASE_URL', 'SECRET_KEY', 'API_KEY'];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
```

**Secrets-Management-Dienste nutzen**: Lege sensible Werte in Produktion in dafür gebauten Systemen ab statt in Umgebungsvariablen:

- AWS Secrets Manager oder Parameter Store
- Azure Key Vault
- Google Secret Manager
- HashiCorp Vault
- Kubernetes Secrets

**Secrets regelmäßig rotieren**: Setze Rotationsregeln um, die Credentials, API-Keys und Zertifikate turnusmäßig wechseln. Automatische Rotation begrenzt den Schaden, wenn ein Credential doch offenliegt.

**Prinzip der geringsten Rechte**: Gib einer Anwendung nur Zugriff auf die Secrets, die sie braucht. Vermeide gemeinsame Credentials über mehrere Anwendungen hinweg.

**Secrets im Ruhezustand verschlüsseln**: Achte darauf, dass das Secret-Management gespeicherte Werte verschlüsselt. Aktiviere Verschlüsselung für die Speicherung von Umgebungsvariablen in Orchestrierungsplattformen.

**Zugriff auf Secrets prüfen**: Protokolliere jeden Zugriff für Monitoring und Compliance. Sieh die Audit-Logs regelmäßig auf auffällige Muster durch.

## Umgebungsvariablen in Containern

Container bekommen Umgebungsvariablen auf mehreren Wegen:

**Docker-run-Befehl**:
```bash
docker run -e DATABASE_URL=postgres://db:5432/app myapp
```

**Docker Compose**:
```yaml
services:
  app:
    image: myapp
    environment:
      - PORT=3000
      - DATABASE_URL=${DATABASE_URL}
    env_file:
      - .env
```

**Kubernetes Secrets**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  DATABASE_URL: postgres://db:5432/app
  SECRET_KEY: random-secret-value
---
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp
    env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: app-secrets
          key: DATABASE_URL
```

## Was je Umgebung zu beachten ist

**Entwicklung**: `.env`-Dateien sind lokal bequem, dürfen aber nie committet werden. Nimm möglichst Dummy-Credentials, die nur mit lokalen Diensten funktionieren.

**Staging**: Nutze Secret-Management auch außerhalb von Produktion. Staging enthält oft produktionsnahe Daten, die Schutz brauchen.

**Produktion**: Immer eigenes Secret-Management mit Verschlüsselung im Ruhezustand, Audit-Logging und Zugriffskontrolle. Rotiere Secrets und überwache unerlaubte Zugriffe.

**CI/CD-Pipelines**: Lege Secrets im Secret-Store der Plattform ab (GitHub Secrets, GitLab CI/CD Variables, Jenkins Credentials). Protokolliere Secret-Werte niemals in der Build-Ausgabe.

## Häufige Fehler

**Secret-Werte loggen**: Logge keine Umgebungsvariablen oder Konfigurationsobjekte, die Secrets enthalten können:

```js
// Dangerous
console.log('Config:', process.env);

// Safe
console.log('Port:', process.env.PORT);
```

**Über APIs preisgeben**: Gib Umgebungsvariablen nie über einen API-Endpunkt oder in Fehlermeldungen heraus:

```js
// Dangerous
app.get('/config', (req, res) => {
    res.json(process.env);
});
```

**Preisgabe im Client**: Serverseitige Secrets gehören nicht in Client-Anwendungen. Nutze für den Client eigene API-Keys mit eingeschränkten Rechten.

**Zu schwache Zugriffskontrolle**: Beschränke, wer Umgebungsvariablen in Deployment-Systemen sehen und ändern darf. Setze rollenbasierte Zugriffskontrolle für Secret-Management um.
