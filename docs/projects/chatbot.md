---
id: chatbot
title: AI Chatbot
sidebar_label: AI Chatbot
sidebar_position: 2
---

:::info[Try out the chatbot at the bottom right]
**Reach me out via** [LinkedIn](https://www.linkedin.com/in/pascal-nehlsen)**,** [Portfolio Contact Form](https://pascal-nehlsen.de/#contact) **or** [mail@pascal-nehlsen.de](mailto:mail@pascal-nehlsen.de)

**Book an appointment directly using the AI Chatbot** (bottom-right corner) - just type "Termin" or "appointment"
:::

# AI Chatbot - Technical Documentation

## Executive Summary

This is a production-ready, multi-tenant platform for embedding customizable AI chatbots with appointment booking capabilities into e-commerce websites. Built with a modern fullstack architecture emphasizing security, scalability, and DevSecOps best practices.

**Tech Stack:** Next.js 13, React 18, TypeScript, Prisma ORM, PostgreSQL 17, OpenAI GPT-4, Docker, Node.js 20

## Architecture Overview

The platform consists of client websites embedding a widget via script tag, a Next.js server handling API routes, and a PostgreSQL database. External services include OpenAI API and SMTP for emails.

### High-Level Architecture

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

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | Widget UI framework with hooks-based state management |
| **TypeScript** | 5.8.3 | Type safety across frontend and API layers |
| **Vite** | 7.0.0 | Widget bundler with IIFE output for script tag embedding |
| **TailwindCSS** | 3.3.2 | Utility-first CSS framework (build-time only) |
| **Shadow DOM** | Native | CSS/JS isolation for widget embedding |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 13.4.12 | Full-stack React framework with API routes |
| **Node.js** | 20 | Server runtime (LTS version) |
| **Prisma** | 6.11.1 | Type-safe ORM with migration system |
| **PostgreSQL** | 17.5 | Primary relational database |
| **OpenAI SDK** | 4.18.0 | GPT-4 integration for conversational AI |

### Security & Infrastructure

| Technology | Version | Purpose |
|------------|---------|---------|
| **bcryptjs** | 3.0.3 | Password hashing (12 rounds, salted) |
| **jsonwebtoken** | 9.0.2 | JWT token generation for session management |
| **Nodemailer** | 7.0.4 | Secure email delivery (password resets, appointments) |
| **CORS** | Built-in | Origin validation per bot configuration |
| **Docker** | Latest | Containerization for consistent deployments |
| **Docker Compose** | v2 | Multi-container orchestration |

## Security Architecture

The platform implements comprehensive DevSecOps practices with multi-layered security.

### Authentication & Authorization

- 12-round bcrypt hashing for all passwords
- Secure password reset flow with time-limited tokens (1 hour expiry)
- Rate limiting: Max 3 reset requests per hour per user
- Password policy enforcement: Min 8 chars, 1 uppercase, 1 number

### Data Protection

Sensitive data handling ensures passwords are never exposed in API responses. Environment variables isolate secrets like OPENAI_API_KEY, JWT_SECRET, and EMAIL_PASS. Email security includes SMTP authentication, TLS encryption, and no sensitive data in subjects.

### DevSecOps Best Practices

Container security uses multi-stage builds to minimize attack surface. Automated Prisma migrations run on container start. Health checks ensure database availability. PostgreSQL is exposed only to localhost. Regular automated backups with timestamped SQL dumps. Rate limiting on password reset endpoints. Token expiration enforced on all JWTs and reset links.

## Database Design

The database uses Prisma ORM with PostgreSQL 17. The schema includes BotConfig (multi-tenant root), Message, AppointmentDate, and PasswordReset entities.

### Entity Relationship

BotConfig is the central entity with relationships to messages, appointment dates, and password resets. It includes fields for client identification, hashed passwords, email, allowed hosts, and UI configurations.

### Key Tables

- **BotConfig**: Stores bot settings, passwords (bcrypt hashed), CORS origins, and tenant-specific configurations.
- **AppointmentDate**: Manages booking slots with support for recurring appointments and race condition prevention.
- **PasswordReset**: Handles secure token management with bcrypt-hashed tokens and 1-hour expiry.
- **Message**: Stores conversation history between users and AI.

Migrations are automated in Docker, with history tracked in prisma/migrations.

## API Architecture

The API follows RESTful principles with Next.js API routes.

### Route Structure

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
│   └── confirm/[id].js       # Confirm/cancel appointment
└── reset-password/
    ├── index.ts              # Request password reset
    ├── [token].ts            # Validate reset token
    └── confirm.ts            # Complete password reset
```

### Core Endpoints

- **Chat Interface**: Processes messages using OpenAI GPT-4, maintains context, stores conversations.
- **Bot Configuration**: Retrieves settings and appointments for widget initialization with CORS validation.
- **Appointment Booking**: Reserves slots with race condition prevention, sends confirmation emails with .ics attachments.
- **Bot Creation**: Creates new bots with hashed passwords and deduplicated appointments.
- **Password Reset**: Secure flow with rate limiting, token hashing, and email delivery.

All endpoints include CORS validation, input sanitization, and security checks.

## Widget System

The widget is a self-contained React app bundled as IIFE for script tag embedding.

### Key Features

- Shadow DOM isolation prevents CSS/JS conflicts
- Zero dependencies, all bundled in single JS file
- Responsive design with mobile fullscreen mode
- Position flexibility (bottom-right/left/center)
- Theme customization per bot

### Initialization

The widget reads attributes from the script tag, creates a shadow root, injects styles, and mounts the React component.

## Deployment & Infrastructure

### Docker Setup

Multi-stage Dockerfile minimizes attack surface. Docker Compose orchestrates PostgreSQL and app containers with health checks and volume persistence.

### Environment Configuration

Required variables include database credentials, OpenAI key, JWT secret, and SMTP settings. All secrets are environment-based, no hardcoding.

## Code Structure

```
chatbot/
├── src/
│   ├── pages/api/             # Next.js API routes
│   ├── utils/                 # CORS, mailer utilities
│   ├── config/                # Bot configurations
│   └── types/                 # TypeScript definitions
├── widget-src/                # Widget source
├── prisma/                    # Schema and migrations
├── public/dist/               # Compiled widget
├── docker-compose.yml         # Orchestration
├── Dockerfile                 # Build definition
└── package.json               # Dependencies
```

## Security Checklist

### Application Security

- [x] Bcrypt password hashing (12 rounds)
- [x] JWT tokens with expiration
- [x] CORS validation on all endpoints
- [x] Password reset token expiry
- [x] Rate limiting on resets
- [x] No sensitive data in responses
- [x] Input validation and SQL injection prevention
- [x] XSS prevention via React escaping
- [x] HTTPS enforcement
- [x] Environment variable secrets

### Infrastructure Security

- [x] Database localhost-only access
- [x] No root containers
- [x] Multi-stage builds
- [x] Automated backups
- [x] Health checks
- [x] Restart policies
- [x] Volume encryption

### Future Improvements

- Implement 2FA for admin accounts
- Add rate limiting middleware
- Automated security scanning
- Audit logging
- Webhook signatures
- CSP headers
- SSL certificate renewal

## Conclusion

This chatbot platform demonstrates production-grade fullstack development with strong DevSecOps practices: security-first approach, scalable multi-tenant architecture, modern tech stack, and comprehensive security measures.

**Key Differentiators:**
- Shadow DOM widget isolation
- Race condition prevention in booking
- Comprehensive password reset flow
- Per-bot CORS whitelisting
- Mobile-first responsive design

---

*Last Updated: December 2025*

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 13.4.12 | Full-stack React framework with API routes |
| **Node.js** | 20 | Server runtime (LTS version) |
| **Prisma** | 6.11.1 | Type-safe ORM with migration system |
| **PostgreSQL** | 17.5 | Primary relational database |
| **OpenAI SDK** | 4.18.0 | GPT-4 integration for conversational AI |

### Security & DevSecOps

| Technology | Version | Purpose |
|------------|---------|---------|
| **bcryptjs** | 3.0.3 | Password hashing (12 rounds, salted) |
| **jsonwebtoken** | 9.0.2 | JWT token generation for session management |
| **Nodemailer** | 7.0.4 | Secure email delivery (password resets, appointments) |
| **CORS** | Built-in | Origin validation per bot configuration |

### Infrastructure

| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | Latest | Containerization for consistent deployments |
| **Docker Compose** | v2 | Multi-container orchestration |
| **PostgreSQL** | 17.5 | Database container with health checks |
| **Bash Scripts** | - | Automated database backups |

---

## Security Architecture (DevSecOps)

### 1. Authentication & Authorization

#### Password Security

**Features:**
- ✅ 12-round bcrypt hashing for all passwords
- ✅ Automatic hashing on bot creation and updates
- ✅ Secure password reset flow with time-limited tokens (1 hour expiry)
- ✅ Rate limiting: Max 3 reset requests per hour per user
- ✅ Password policy enforcement: Min 8 chars, 1 uppercase, 1 number

#### Password Reset Flow
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

**Security Features:**
- ✅ Per-bot domain whitelisting (stored in `BotConfig.allowedHost`)
- ✅ Strict origin validation on all API endpoints
- ✅ Preflight request handling for complex CORS scenarios
- ✅ Widget validates origin server-side before rendering
- ✅ Cache-Control and Pragma headers allowed for fresh data fetches

### 4. Data Protection

**Sensitive Data Handling:**
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

**Email Security:**
- ✅ SMTP authentication with secure credentials
- ✅ TLS encryption for email transmission (port 587)
- ✅ Confirmation emails for all critical actions
- ✅ No sensitive data in email subjects or metadata

### 6. DevSecOps Best Practices

**Container Security:**
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

**Security Checklist:**
- ✅ No hardcoded secrets (all via environment variables)
- ✅ Prisma migrations run automatically on container start
- ✅ Health checks for database availability
- ✅ PostgreSQL exposed only to localhost (127.0.0.1)
- ✅ Regular automated backups with timestamped SQL dumps
- ✅ Rate limiting on password reset endpoints
- ✅ Token expiration enforced on all JWTs and reset links

---

## Database Design

### Prisma Schema Overview

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### Entity Relationship Diagram

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

### Table Details

#### BotConfig (Multi-Tenant Root Entity)
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

**Key Features:**
- `client`: Unique identifier for URL routing (`/api/bot/[clientId]`)
- `password`: Always stored as bcrypt hash (12 rounds)
- `allowedHost`: Comma-separated list for CORS validation
- `confirmed`: Prevents unauthorized bots from being active
- `position`: Controls widget placement (bottom-right/left/center)


#### AppointmentDate (Booking Slots)
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

**Features:**
- Supports one-time and recurring appointments
- Duplicate prevention via `date_time` uniqueness check
- All duplicates marked as booked simultaneously to prevent race conditions
- Only `booked: false` slots returned to widget

#### PasswordReset (Secure Token Management)
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

**Security:**
- Tokens stored as bcrypt hashes (not reversible)
- 1-hour expiration enforced at validation time
- Cascade delete when user account removed
- Old tokens deleted on successful password reset

### Database Migrations

**Migration System:**
```bash
# Development: Create new migration
npx prisma migrate dev --name add_feature

# Production: Apply pending migrations
npx prisma migrate deploy
```

**Automated in Docker:**
```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
```

**Migration History:**
- `20250721125001_add_position_field`: Added widget positioning
- Migrations tracked in `prisma/migrations/migration_lock.toml`

---

## API Architecture

### API Route Structure

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

### Core API Endpoints

#### 1. Chat Interface (`POST /api/chat`)

**Purpose:** Process user messages and return AI-generated responses

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

**Implementation:**
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

**Features:**
- ✅ Stores both user and AI messages in database
- ✅ Maintains conversation context via history array
- ✅ Custom system prompts per bot configuration
- ✅ CORS validation with origin whitelisting

#### 2. Bot Configuration (`GET /api/bot/[clientId]`)

**Purpose:** Retrieve bot settings and available appointments for widget initialization

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

**Security Checks:**
1. Validate `clientId` format and existence
2. Ensure bot is confirmed (`confirmed: true`)
3. Verify request origin against `allowedHost`
4. Filter out booked appointments (`booked: false`)
5. Set appropriate CORS headers

#### 3. Appointment Booking (`POST /api/bot/appointment`)

**Purpose:** Reserve appointment slot and send confirmation emails

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

**Booking Flow:**
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

**Security Features:**
- ✅ Duplicate request prevention via in-memory locks (2-minute auto-expire)
- ✅ Atomic database updates with `updateMany` to mark all duplicates
- ✅ 409 Conflict response when slot already taken
- ✅ Email validation before processing
- ✅ CORS validation against bot's allowed origins

#### 4. Bot Creation (`POST /api/bot/config`)

**Purpose:** Create new bot configuration with appointment slots

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

**Implementation:**
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

#### 5. Password Reset Flow

**5a. Request Reset (`POST /api/reset-password`)**
```typescript
// Request
{ "email": "user@example.com" }

// Response (Always 200 to prevent user enumeration)
{
  "success": true,
  "message": "Falls diese E-Mail-Adresse registriert ist, wurde ein Reset-Link gesendet"
}
```

**Backend Logic:**
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

**5b. Validate Token (`GET /api/reset-password/[token]`)**
```typescript
// Response (Valid)
{ "success": true }

// Response (Invalid/Expired)
{ "success": false, "message": "Token ungültig oder abgelaufen" }
```

**5c. Complete Reset (`POST /api/reset-password/confirm`)**
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

## Widget System

### Architecture

The widget is a fully self-contained React application bundled as an IIFE (Immediately Invoked Function Expression) that can be embedded into any website via a simple `<script>` tag.

**Key Features:**
- ✅ **Shadow DOM Isolation:** Prevents CSS/JS conflicts with host page
- ✅ **Zero Dependencies:** All styles and logic bundled in single JS file
- ✅ **Responsive Design:** Mobile-first with fullscreen mode on mobile devices
- ✅ **Position Flexibility:** bottom-right, bottom-left, bottom-center
- ✅ **Theme Customization:** Per-bot color schemes and branding

**Widget Initialization:**
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

## Deployment & Infrastructure

### Docker Architecture

**Multi-Stage Dockerfile**

### Docker Compose Setup

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

**Security Features:**
- ✅ Database only accessible from localhost
- ✅ Health checks ensure database ready before app starts
- ✅ Named volumes for data persistence
- ✅ Restart policies for fault tolerance

### Environment Configuration

**Required Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@db:5432/chatbot
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=chatbot
DB_PORT=5432

# Application
APP_PORT=3000
FRONTEND_URL=https://chatbot-mit-pascal.de

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

### Code Structure

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

## Security Hardening Checklist

### Application Security

- [x] All passwords hashed with bcrypt (12 rounds)
- [x] JWT tokens with 1-hour expiration
- [x] CORS validation on all endpoints
- [x] Password reset tokens expire after 1 hour
- [x] Rate limiting on password reset (3 requests/hour)
- [x] No sensitive data in API responses
- [x] Input validation on all endpoints
- [x] SQL injection prevention (Prisma parameterized queries)
- [x] XSS prevention (React auto-escaping)
- [x] HTTPS enforced in production
- [x] Environment variables for all secrets

### Infrastructure Security

- [x] Database only accessible from localhost
- [x] No root user in Docker containers
- [x] Minimal attack surface (multi-stage builds)
- [x] Regular automated backups
- [x] Health checks for all services
- [x] Container restart policies
- [x] Volume encryption (host-level)

### Future Security Improvements

- [ ] Implement 2FA for admin accounts
- [ ] Add rate limiting middleware for all API routes
- [ ] Set up automated security scanning (Dependabot)
- [ ] Implement audit logging for all data modifications
- [ ] Add webhook signatures for external integrations
- [ ] CSP headers for widget embedding
- [ ] Automated SSL certificate renewal

---

## Conclusion

This chatbot platform demonstrates production-grade fullstack development with strong DevSecOps practices:

✅ **Security-First:** Bcrypt hashing, JWT authentication, CORS validation, rate limiting
✅ **Scalable Architecture:** Multi-tenant design, stateless APIs, containerized deployment
✅ **Developer Experience:** TypeScript type safety, Prisma ORM, hot reloading, automated migrations
✅ **Production-Ready:** Docker orchestration, automated backups, health checks, error handling
✅ **Modern Stack:** React 18, Next.js 13, PostgreSQL 17, OpenAI GPT-4

**Key Differentiators:**
- Shadow DOM widget isolation for zero conflict embedding
- Race condition prevention in appointment booking system
- Comprehensive password reset flow with token expiration
- Per-bot CORS whitelisting for multi-tenant security
- Mobile-first responsive design with fullscreen mode

---

*Last Updated: December 2025*
