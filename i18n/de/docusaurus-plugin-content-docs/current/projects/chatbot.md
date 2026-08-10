---
id: chatbot
title: "KI-Chatbot-Plattform"
sidebar_label: "KI-Chatbot-Plattform"
sidebar_position: 3
description: "Multi-Tenant-Chatbot-Plattform, per Script-Tag einbettbar: Shadow-DOM-Isolation, CORS-Prüfung pro Tenant, Terminbuchung."
keywords: [multi-tenant, shadow dom, chatbot, next.js, prisma, tenant isolation]
---

# KI-Chatbot-Plattform

:::info[Hier nicht eingebettet]
Das Widget lud früher auf jeder Seite dieser Site. Es ist entfernt: ein
Third-Party-Script mit vollem DOM-Zugriff auf vierzig Inhaltsseiten will ich auf
einer Seite über das Absichern von Delivery-Pipelines nicht verteidigen, und
diese Seite verkauft nichts. Es läuft unter
[start.chatbot-mit-pascal.de](https://start.chatbot-mit-pascal.de).
:::

## Kurzfassung

Eine produktionsreife Multi-Tenant-Plattform, die anpassbare KI-Chatbots mit Terminbuchung in E-Commerce-Websites einbettet. Gebaut mit einer modernen Full-Stack-Architektur, mit Schwerpunkt auf Sicherheit, Skalierbarkeit und bewährter DevSecOps-Praxis.

**Stack:** Next.js 13, React 18, TypeScript, Prisma ORM, PostgreSQL 17, OpenAI GPT-4, Docker, Node.js 20

## Architektur im Überblick

Die Plattform besteht aus Kundenseiten, die ein Widget per Script-Tag einbetten, einem Next.js-Server mit den API-Routen und einer PostgreSQL-Datenbank. Externe Dienste sind die OpenAI-API und SMTP für E-Mails.

### Aufbau

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Websites                          │
│  (Multiple domains embedding widget via <script> tag)      │
└─────────────┬───────────────────────────────────────────────┘
              │
              │ HTTPS (CORS-protected)
              ▼
┌─────────────────────────────────────────────────────────────┐
│               Next.js Application Server                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes (/api/*)                                  │  │
│  │  • Bot Configuration Management                       │  │
│  │  • Chat Interface (OpenAI Integration)                │  │
│  │  • Appointment Booking System                         │  │
│  │  • Authentication & Authorization                     │  │
│  │  • Password Reset Flow                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Widget Distribution (/dist/widget.iife.js)          │  │
│  │  • Shadow DOM isolated React component               │  │
│  │  • Self-contained styling                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────┬────────────────────────────────────────────────┘
              │
              │ Prisma ORM
              ▼
┌─────────────────────────────────────────────────────────────┐
│           PostgreSQL 17 Database                            │
│  • Bot configurations (multi-tenant)                        │
│  • Conversation history                                     │
│  • Appointment schedules                                    │
│  • Password reset tokens (bcrypt hashed)                    │
└─────────────────────────────────────────────────────────────┘

              External Services
              ┌──────────────────┐
              │  OpenAI API      │
              │  (GPT-4.1-mini)  │
              └──────────────────┘
              ┌──────────────────┐
              │  SMTP Server     │
              │  (Nodemailer)    │
              └──────────────────┘
```

## Technologie

### Frontend

| Technologie | Version | Zweck |
|------------|---------|---------|
| **React** | 18.2.0 | UI-Framework des Widgets, State über Hooks |
| **TypeScript** | 5.8.3 | Typsicherheit über Frontend und API-Schicht |
| **Vite** | 7.0.0 | Bundler des Widgets, IIFE-Ausgabe für die Einbettung per Script-Tag |
| **TailwindCSS** | 3.3.2 | Utility-First-CSS (nur zur Build-Zeit) |
| **Shadow DOM** | nativ | CSS- und JS-Isolation für die Einbettung |

### Backend

| Technologie | Version | Zweck |
|------------|---------|---------|
| **Next.js** | 13.4.12 | Full-Stack-React-Framework mit API-Routen |
| **Node.js** | 20 | Server-Laufzeit (LTS) |
| **Prisma** | 6.11.1 | typsicheres ORM mit Migrationssystem |
| **PostgreSQL** | 17.5 | primäre relationale Datenbank |
| **OpenAI SDK** | 4.18.0 | GPT-4-Anbindung für die Dialoge |

### Security und DevSecOps

| Technologie | Version | Zweck |
|------------|---------|---------|
| **bcryptjs** | 3.0.3 | Passwort-Hashing (12 Runden, gesalzen) |
| **jsonwebtoken** | 9.0.2 | JWT-Erzeugung für die Sitzungsverwaltung |
| **Nodemailer** | 7.0.4 | sicherer E-Mail-Versand (Passwort-Reset, Termine) |
| **CORS** | eingebaut | Origin-Prüfung pro Bot-Konfiguration |

### Infrastruktur

| Technologie | Version | Zweck |
|------------|---------|---------|
| **Docker** | aktuell | Containerisierung für gleiche Deployments |
| **Docker Compose** | v2 | Orchestrierung mehrerer Container |
| **PostgreSQL** | 17.5 | Datenbank-Container mit Health Checks |
| **Bash-Scripte** | - | automatisierte Datenbank-Backups |

---

## Security-Architektur (DevSecOps)

### Authentifizierung und Autorisierung

#### Passwortsicherheit

**Merkmale:**
- ✅ bcrypt mit 12 Runden für alle Passwörter
- ✅ automatisches Hashing beim Anlegen und Ändern eines Bots
- ✅ sicherer Reset-Ablauf mit zeitlich begrenzten Tokens (1 Stunde)
- ✅ Rate Limiting: höchstens 3 Reset-Anfragen pro Stunde und Nutzer
- ✅ Passwortregeln: mindestens 8 Zeichen, 1 Großbuchstabe, 1 Ziffer

#### Ablauf beim Passwort-Reset
```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Request   │      │   Validate   │      │  Send Email  │
│   Reset     │─────▶│   & Create   │─────▶│  with Token  │
│             │      │   Token      │      │  (1h expiry) │
└─────────────┘      └──────────────┘      └──────────────┘
                              │
                              │ Store bcrypt-hashed token
                              ▼
                     ┌──────────────────┐
                     │  Database        │
                     │  (PasswordReset) │
                     └──────────────────┘

User clicks link → Validate token → Update password (bcrypt) → Delete all tokens
```

#### CORS und Origin-Prüfung

**Merkmale:**
- ✅ Domain-Whitelist pro Bot (in `BotConfig.allowedHost`)
- ✅ strikte Origin-Prüfung an allen API-Endpunkten
- ✅ Behandlung von Preflight-Requests für komplexere CORS-Fälle
- ✅ das Widget prüft den Origin serverseitig, bevor es rendert
- ✅ Cache-Control- und Pragma-Header erlaubt, damit frische Daten geholt werden können

### Datenschutz in der Umsetzung

**Umgang mit sensiblen Daten:**
```typescript
// Never expose passwords in API responses
select: {
  id: true,
  email: true,
  // password: false (excluded)
}

// Environment variable isolation
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_PASS = process.env.EMAIL_PASS;
```

**E-Mail-Sicherheit:**
- ✅ SMTP-Authentifizierung mit eigenen Credentials
- ✅ TLS-Verschlüsselung beim Versand (Port 587)
- ✅ Bestätigungsmails für alle kritischen Vorgänge
- ✅ keine sensiblen Daten in Betreff oder Metadaten

### Bewährte DevSecOps-Praxis

**Container-Sicherheit:**
```dockerfile
# Multi-stage builds to minimize attack surface
FROM node:20 AS widget-builder
# ... build widget

FROM node:20 AS nextjs-builder
# ... build application

FROM node:20 AS runner
# Only copy production artifacts
COPY --from=nextjs-builder /app/.next ./.next
COPY --from=nextjs-builder /app/node_modules ./node_modules
```

**Checkliste:**
- ✅ keine festgeschriebenen Secrets (alles über Umgebungsvariablen)
- ✅ Prisma-Migrationen laufen automatisch beim Containerstart
- ✅ Health Checks für die Verfügbarkeit der Datenbank
- ✅ PostgreSQL nur auf localhost erreichbar (127.0.0.1)
- ✅ regelmäßige automatische Backups mit zeitgestempelten SQL-Dumps
- ✅ Rate Limiting an den Reset-Endpunkten
- ✅ Ablauf erzwungen für alle JWTs und Reset-Links

---

## Datenbankentwurf

### Prisma-Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### Beziehungen

```
┌─────────────────────────────────────────────────┐
│              BotConfig (Tenant)                 │
├─────────────────────────────────────────────────┤
│ id: String (CUID) PK                            │
│ client: String (Unique)                         │
│ name: String                                    │
│ password: String (bcrypt hashed)                │
│ email: String                                   │
│ allowedHost: String (comma-separated origins)   │
│ confirmed: Boolean                              │
│ appointmentsEnabled: Boolean                    │
│ position: String (bottom-right/left/center)     │
│ ... UI configuration fields ...                 │
└──┬──────────────────────────────────────────────┘
   │
   ├─────────────────┬──────────────────┬──────────────────┐
   │                 │                  │                  │
   ▼                 ▼                  ▼                  ▼
┌──────────┐  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│ Message  │  │ Appointment   │  │ Password     │  │   (Future)   │
│          │  │ Date          │  │ Reset        │  │              │
├──────────┤  ├───────────────┤  ├──────────────┤  └──────────────┘
│ id: PK   │  │ id: PK        │  │ id: PK       │
│ content  │  │ date: String  │  │ resetToken   │
│ role     │  │ time: String  │  │ expiresAt    │
│ userId   │  │ repeat: Enum  │  │ createdAt    │
│ botId FK │  │ booked: Bool  │  │ userId: FK   │
└──────────┘  │ botId: FK     │  └──────────────┘
              └───────────────┘
```

### Die Tabellen im Detail

#### BotConfig (Wurzel des Mandanten)
```typescript
model BotConfig {
  id                   String           @id @default(cuid())
  client               String           @unique
  name                 String           @default("")
  password             String           @default("") // bcrypt hashed
  title                String
  buttonEmoji          String
  logo                 String
  firstMessage         String
  fontFamily           String
  color                String           // Primary brand color
  hoverColor           String
  messageColor         String
  fontColor            String
  system               String           // AI system prompt
  email                String           // Contact email
  allowedHost          String           // CORS origins
  createdAt            DateTime         @default(now())
  confirmed            Boolean          @default(false)
  position             String           // Widget position
  appointmentsEnabled  Boolean          @default(false)
  availableDates       Json?            // Legacy field
  messages             Message[]
  appointmentDates     AppointmentDate[]
  passwordResets       PasswordReset[]

  @@map("bot_configs")
}
```

**Wichtige Felder:**
- `client`: eindeutiger Bezeichner für das Routing (`/api/bot/[clientId]`)
- `password`: immer als bcrypt-Hash gespeichert (12 Runden)
- `allowedHost`: kommaseparierte Liste für die CORS-Prüfung
- `confirmed`: verhindert, dass nicht freigegebene Bots aktiv sind
- `position`: steuert die Platzierung des Widgets (bottom-right/left/center)


#### AppointmentDate (Terminfenster)
```typescript
model AppointmentDate {
  id          String     @id @default(cuid())
  botConfig   BotConfig  @relation(fields: [botConfigId], references: [id])
  botConfigId String
  date        String     // "YYYY-MM-DD"
  time        String     // "HH:MM"
  repeat      String     // "einmalig" | "wöchentlich" | "täglich"
  booked      Boolean    @default(false)
}
```

**Merkmale:**
- einmalige und wiederkehrende Termine
- Doppelte werden über eine Prüfung auf `date_time` verhindert
- alle Doppelten werden gleichzeitig als gebucht markiert, damit keine Race Condition entsteht
- an das Widget gehen nur Fenster mit `booked: false`

#### PasswordReset (Token-Verwaltung)
```typescript
model PasswordReset {
  id         String    @id @default(cuid())
  user       BotConfig @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
  resetToken String    // bcrypt-hashed token
  expiresAt  DateTime  // 1-hour expiry
  createdAt  DateTime  @default(now())

  @@map("password_resets")
  @@index([userId])
}
```

**Sicherheit:**
- Tokens liegen als bcrypt-Hash, also nicht umkehrbar
- Ablauf nach einer Stunde, geprüft bei der Validierung
- Cascade-Delete, wenn das Konto entfernt wird
- alte Tokens werden nach erfolgreichem Reset gelöscht

### Migrationen

**Wie sie laufen:**
```bash
# Development: Create new migration
npx prisma migrate dev --name add_feature

# Production: Apply pending migrations
npx prisma migrate deploy
```

**Automatisch im Container:**
```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
```

**Historie:**
- `20250721125001_add_position_field`: Positionierung des Widgets ergänzt
- Migrationen sind in `prisma/migrations/migration_lock.toml` verzeichnet

---

## API-Architektur

### Routenaufbau

```
/api
├── chat.ts                    # OpenAI chat completions
├── login.ts                   # Authentication endpoint
├── bot/
│   ├── [clientId].ts         # Get bot configuration
│   ├── appointment.js        # Book appointment slot
│   ├── config.js             # Create new bot
│   ├── getConfig.js          # List all bot configs
│   ├── updateConfig.ts       # Update bot settings
│   └── confirm/
│       └── [id].js           # Confirm/cancel appointment
└── reset-password/
    ├── index.ts              # Request password reset
    ├── [token].ts            # Validate reset token
    └── confirm.ts            # Complete password reset
```

### Die wichtigsten Endpunkte

#### 1. Chat (`POST /api/chat`)

**Zweck:** Nachrichten verarbeiten und KI-Antworten zurückgeben

```typescript
// Request
{
  "id": "clxxx123",           // Bot ID
  "message": "Hello",
  "history": [                // Previous messages
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello!" }
  ],
  "userId": "session-uuid"
}

// Response
{
  "reply": "Hello! How can I help you today?"
}
```

**Umsetzung:**
```typescript
const messages = [
  { role: 'system', content: botConfig.system }, // AI personality
  ...history,                                     // Context
  { role: 'user', content: message }              // Current message
];

const completion = await openai.chat.completions.create({
  model: 'gpt-4.1-mini',
  messages,
});
```

**Merkmale:**
- ✅ speichert Nutzer- und KI-Nachrichten in der Datenbank
- ✅ hält den Gesprächskontext über das History-Array
- ✅ eigener System-Prompt pro Bot-Konfiguration
- ✅ CORS-Prüfung gegen die Origin-Whitelist

#### 2. Bot-Konfiguration (`GET /api/bot/[clientId]`)

**Zweck:** Einstellungen und freie Termine für den Start des Widgets holen

```typescript
// Request
GET /api/bot/clxxx123?t=1638360000000  // Cache-busting query param

// Response
{
  "id": "clxxx123",
  "title": "Support Bot",
  "firstMessage": "How can I help?",
  "color": "#4F46E5",
  "appointmentsEnabled": true,
  "appointmentDates": [
    {
      "id": "apt-001",
      "date": "2025-12-15",
      "time": "10:00",
      "repeat": "einmalig",
      "booked": false
    }
  ]
}
```

**Sicherheitsprüfungen:**
1. Format und Existenz der `clientId` prüfen
2. sicherstellen, dass der Bot freigegeben ist (`confirmed: true`)
3. Origin des Requests gegen `allowedHost` prüfen
4. gebuchte Termine herausfiltern (`booked: false`)
5. passende CORS-Header setzen

#### 3. Terminbuchung (`POST /api/bot/appointment`)

**Zweck:** Termin reservieren und Bestätigungsmails versenden

```typescript
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+49123456789",
  "slot": "2025-12-15 10:00",
  "notes": "Need help with product",
  "botId": "clxxx123"
}

// Response (Success)
{ "message": "Termin-Anfrage erfolgreich versendet." }

// Response (Conflict - Already Booked)
{ "error": "Dieser Termin wurde bereits gebucht" }
```

**Ablauf:**
```typescript
// 1. Validate slot exists and is available
const requestedSlot = await prisma.appointmentDate.findFirst({
  where: { botConfigId, date, time }
});

// 2. In-memory lock to prevent duplicate submissions
const lockKey = `${requestedSlot.id}:${email}`;
if (sendLocks.has(lockKey)) {
  return res.status(409).json({ error: 'Already processing' });
}

// 3. Mark ALL duplicate slots as booked (race condition prevention)
const updated = await prisma.appointmentDate.updateMany({
  where: {
    botConfigId,
    date,
    time,
    booked: false
  },
  data: { booked: true }
});

// 4. Send confirmation emails with .ics calendar attachments
await transporter.sendMail({
  to: clientEmail,
  subject: 'Neue Termin-Anfrage',
  html: `<p>Name: ${name}</p><p>Telefon: ${phone}</p>`,
  attachments: [{ filename: 'termin.ics', content: icsFile }]
});
```

**Sicherheitsmerkmale:**
- ✅ doppelte Anfragen über In-Memory-Locks abgefangen (verfallen nach 2 Minuten)
- ✅ atomare Datenbankänderung per `updateMany`, die alle Doppelten markiert
- ✅ Antwort 409 Conflict, wenn das Fenster schon weg ist
- ✅ E-Mail-Prüfung vor der Verarbeitung
- ✅ CORS-Prüfung gegen die erlaubten Origins des Bots

#### 4. Bot anlegen (`POST /api/bot/config`)

**Zweck:** neue Bot-Konfiguration samt Terminfenstern erzeugen

```typescript
// Request
{
  "client": "demo-shop",
  "name": "Shop Bot",
  "password": "SecurePass123",
  "email": "admin@demo-shop.com",
  "allowedHost": "https://demo-shop.com",
  "appointmentSlots": [
    {
      "date": "2025-12-15",
      "times": ["10:00", "14:00"],
      "repeat": "wöchentlich"
    }
  ]
}
```

**Umsetzung:**
```typescript
// Hash password with bcrypt (12 rounds)
const hashedPassword = await bcrypt.hash(password, 12);

// Deduplicate appointments using Set
const uniqueAppointments = Array.from(
  new Map(
    newAppointments.map(apt => [`${apt.date}_${apt.time}`, apt])
  ).values()
);

// Create bot and appointments in transaction
await prisma.botConfig.create({
  data: {
    ...botData,
    password: hashedPassword,
    appointmentDates: {
      createMany: { data: uniqueAppointments }
    }
  }
});
```

#### 5. Passwort-Reset

**5a. Reset anfordern (`POST /api/reset-password`)**
```typescript
// Request
{ "email": "user@example.com" }

// Response (Always 200 to prevent user enumeration)
{
  "success": true,
  "message": "Falls diese E-Mail-Adresse registriert ist, wurde ein Reset-Link gesendet"
}
```

**Serverseitig:**
```typescript
// Rate limiting: Max 3 requests per hour
const recentResets = await prisma.passwordReset.findMany({
  where: {
    userId: user.id,
    createdAt: { gte: oneHourAgo }
  }
});

if (recentResets.length >= 3) {
  // Still return 200 to prevent timing attacks
  return res.status(200).json({ success: true, message: "..." });
}

// Generate secure token and hash it
const rawToken = crypto.randomBytes(32).toString('hex');
const hashed = await bcrypt.hash(rawToken, 12);

// Store hashed token with 1-hour expiry
await prisma.passwordReset.create({
  data: {
    userId: user.id,
    resetToken: hashed,
    expiresAt: new Date(Date.now() + 3600000) // 1 hour
  }
});

// Send email with plaintext token in URL
await sendEmail({
  to: user.email,
  subject: 'Passwort zurücksetzen',
  html: `<a href="${FRONTEND_URL}/reset-password/${rawToken}">Reset Password</a>`
});
```

**5b. Token prüfen (`GET /api/reset-password/[token]`)**
```typescript
// Response (Valid)
{ "success": true }

// Response (Invalid/Expired)
{ "success": false, "message": "Token ungültig oder abgelaufen" }
```

**5c. Reset abschließen (`POST /api/reset-password/confirm`)**
```typescript
// Request
{
  "token": "abc123...",
  "password": "NewSecurePass123"
}

// Password policy enforcement
if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
  return res.status(400).json({ error: 'Password policy violation' });
}

// Update password and delete all tokens
const hashedPassword = await bcrypt.hash(password, 12);
await prisma.$transaction([
  prisma.botConfig.update({
    where: { id: userId },
    data: { password: hashedPassword }
  }),
  prisma.passwordReset.deleteMany({
    where: { userId }
  })
]);
```

---

## Das Widget

### Architektur

Das Widget ist eine vollständig eigenständige React-Anwendung, gebündelt als IIFE (Immediately Invoked Function Expression), die per einfachem `<script>`-Tag in jede Website eingebettet werden kann.

**Merkmale:**
- ✅ **Shadow-DOM-Isolation:** verhindert CSS- und JS-Konflikte mit der Gastseite
- ✅ **Keine Abhängigkeiten:** alle Styles und Logik in einer JS-Datei
- ✅ **Responsiv:** Mobile-first, auf Mobilgeräten im Vollbild
- ✅ **Position wählbar:** bottom-right, bottom-left, bottom-center
- ✅ **Anpassbares Theme:** Farbschema und Branding pro Bot

**Initialisierung:**
```typescript
// widget-src/index.tsx
const rootDiv = document.getElementById('widget-root');
const scriptTag = document.currentScript as HTMLScriptElement;
const clientId = scriptTag.getAttribute('data-client-id');
const apiBase = scriptTag.getAttribute('data-api-base');

// Create shadow root for isolation
const shadowRoot = rootDiv.attachShadow({ mode: 'open' });

// Inject styles into shadow DOM
const styleSheet = document.createElement('style');
styleSheet.textContent = styles; // Bundled CSS
shadowRoot.appendChild(styleSheet);

// Mount React app in shadow DOM
const container = document.createElement('div');
shadowRoot.appendChild(container);
ReactDOM.createRoot(container).render(
  <ChatWidget clientId={clientId} apiBase={apiBase} />
);
```

## Ausrollen und Infrastruktur

### Docker-Aufbau

**Mehrstufiges Dockerfile**

### Docker Compose

```yaml
services:
  db:
    image: postgres:17.5
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:${DB_PORT}:5432"  # Only localhost access
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    build: .
    restart: on-failure
    ports:
      - "${APP_PORT}:3000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
    depends_on:
      db:
        condition: service_healthy  # Wait for DB health check

volumes:
  postgres-data:
```

**Sicherheitsmerkmale:**
- ✅ Datenbank nur von localhost erreichbar
- ✅ Health Checks sorgen dafür, dass die Datenbank vor der App bereit ist
- ✅ benannte Volumes für den Datenerhalt
- ✅ Restart-Policies für Fehlertoleranz

### Umgebungsvariablen

**Erforderlich:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@db:5432/chatbot
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=chatbot
DB_PORT=5432

# Application
APP_PORT=3000
FRONTEND_URL=https://start.chatbot-mit-pascal.de

# OpenAI
OPENAI_API_KEY=sk-...

# Authentication
JWT_SECRET=your_secure_jwt_secret
ADMIN_PASSWORD=admin_password_hash

# Email (SMTP)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=bot@example.com
EMAIL_PASS=smtp_password
EMAIL_BOT=bot@example.com
```
---

### Codeaufbau

```
chatbot/
├── src/
│   ├── pages/
│   │   └── api/              # Next.js API routes
│   │       ├── chat.ts       # OpenAI integration
│   │       ├── login.ts      # Authentication
│   │       ├── bot/          # Bot management
│   │       └── reset-password/ # Password reset flow
│   ├── utils/
│   │   ├── cors.ts           # CORS validation utility
│   │   └── mailer.ts         # Email sending utility
│   ├── config/               # Per-client bot configurations
│   └── types/                # TypeScript definitions
├── widget-src/
│   ├── chatwidget.tsx        # Main widget component
│   ├── chatwidget.css        # Widget styles
│   ├── index.tsx             # Widget entry point
│   └── vite.config.ts        # Build configuration
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Migration history
├── public/
│   └── dist/                 # Compiled widget (auto-generated)
├── docker-compose.yml        # Container orchestration
├── Dockerfile                # Multi-stage build
└── package.json              # Dependencies & scripts
```

## Härtungs-Checkliste

### Anwendung

- [x] alle Passwörter mit bcrypt gehasht (12 Runden)
- [x] JWTs mit einer Stunde Gültigkeit
- [x] CORS-Prüfung an allen Endpunkten
- [x] Reset-Tokens verfallen nach einer Stunde
- [x] Rate Limiting beim Passwort-Reset (3 Anfragen pro Stunde)
- [x] keine sensiblen Daten in API-Antworten
- [x] Eingabevalidierung an allen Endpunkten
- [x] Schutz gegen SQL-Injection (parametrisierte Prisma-Queries)
- [x] Schutz gegen XSS (automatisches Escaping in React)
- [x] HTTPS in Produktion erzwungen
- [x] alle Secrets über Umgebungsvariablen

### Infrastruktur

- [x] Datenbank nur von localhost erreichbar
- [x] kein root-Nutzer in den Containern
- [x] minimale Angriffsfläche (Multi-Stage-Builds)
- [x] regelmäßige automatische Backups
- [x] Health Checks für alle Dienste
- [x] Restart-Policies der Container
- [x] Volume-Verschlüsselung (auf Host-Ebene)

### Was noch fehlt

- [ ] 2FA für Admin-Konten
- [ ] Rate-Limiting-Middleware für alle API-Routen
- [ ] automatisiertes Security-Scanning (Dependabot)
- [ ] Audit-Logging für alle Datenänderungen
- [ ] Webhook-Signaturen für externe Integrationen
- [ ] CSP-Header für die Widget-Einbettung
- [ ] automatische Erneuerung der SSL-Zertifikate

---

## Fazit

Diese Chatbot-Plattform zeigt Full-Stack-Entwicklung auf Produktionsniveau mit belastbarer DevSecOps-Praxis:

✅ **Security zuerst:** bcrypt-Hashing, JWT-Authentifizierung, CORS-Prüfung, Rate Limiting
✅ **Skalierbare Architektur:** Multi-Tenant-Entwurf, zustandslose APIs, containerisiertes Deployment
✅ **Entwicklungserfahrung:** Typsicherheit mit TypeScript, Prisma ORM, Hot Reload, automatische Migrationen
✅ **Produktionsreif:** Docker-Orchestrierung, automatische Backups, Health Checks, Fehlerbehandlung
✅ **Moderner Stack:** React 18, Next.js 13, PostgreSQL 17, OpenAI GPT-4

**Was es unterscheidet:**
- Shadow-DOM-Isolation des Widgets, damit die Einbettung konfliktfrei bleibt
- Schutz gegen Race Conditions bei der Terminbuchung
- durchdachter Passwort-Reset mit Token-Ablauf
- CORS-Whitelist pro Bot für die Sicherheit zwischen Mandanten
- Mobile-first-Design mit Vollbildmodus

---

*Letzte Aktualisierung: Dezember 2025*
