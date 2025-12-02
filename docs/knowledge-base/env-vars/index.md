# Using Environment Variables Securely

Environment variables provide a mechanism to configure applications without hardcoding values in source code. However, improper handling of environment variables can create serious security vulnerabilities.

## Environment Variables in Node.js

In Node.js applications, the dotenv package loads environment variables from .env files. This approach separates configuration from code and enables different configurations for different environments.

### Steps to Use .env in Node.js:

#### Install the dotenv package:

```bash
npm install dotenv
```

#### Create a .env file in the root of your project.

Example .env file:

```env title="example.env"
PORT=3000
DATABASE_URL=mongodb://localhost:27017/myapp
SECRET_KEY=mysecretkey
```

#### Load the .env file in your application:

In your entry file (e.g., app.js or index.js), load the environment variables using dotenv:

```js title="app.js"
require('dotenv').config();

const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;
const secretKey = process.env.SECRET_KEY;

console.log(`Server is running on port: ${port}`);
```

#### Access the environment variables:

```js title="app.js"
console.log(process.env.PORT);  // Output: 3000
```

## Security Best Practices for Environment Variables

**Never Commit .env Files**: Add .env files to .gitignore to prevent committing sensitive credentials to version control. Committed secrets can be discovered by scanning repository history, even after being removed.

```text title=".gitignore"
.env
.env.local
.env.*.local
```

**Use .env.example Templates**: Provide .env.example files that document required variables without including actual values:

```env title=".env.example"
PORT=
DATABASE_URL=
SECRET_KEY=
API_KEY=
```

**Validate Environment Variables**: Verify all required environment variables are present and valid at application startup. Fail fast if critical configuration is missing:

```js
const requiredEnvVars = ['DATABASE_URL', 'SECRET_KEY', 'API_KEY'];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
```

**Use Secrets Management Services**: For production environments, store sensitive values in dedicated secret management systems rather than environment variables:

- AWS Secrets Manager or Parameter Store
- Azure Key Vault
- Google Secret Manager
- HashiCorp Vault
- Kubernetes Secrets

**Rotate Secrets Regularly**: Implement secret rotation policies that periodically change credentials, API keys, and certificates. Automated rotation reduces the impact of potential credential exposure.

**Principle of Least Privilege**: Grant applications access only to the specific secrets they require. Avoid using shared credentials across multiple applications.

**Encrypt Secrets at Rest**: Ensure secret management systems encrypt stored values. Enable encryption for environment variable storage in container orchestration platforms.

**Audit Secret Access**: Log all access to secrets for security monitoring and compliance purposes. Review audit logs regularly for suspicious access patterns.

## Environment Variables in Containers

Containers can receive environment variables through multiple mechanisms:

**Docker Run Command**:
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

## Security Considerations for Different Environments

**Development**: Use .env files for local development convenience, but never commit them. Consider using dummy credentials that work only with local development services.

**Staging**: Use secrets management services even in non-production environments. Staging environments often contain production-like data that requires protection.

**Production**: Always use dedicated secrets management with encryption at rest, audit logging, and access controls. Implement secret rotation and monitor for unauthorized access.

**CI/CD Pipelines**: Store secrets in CI/CD platform secret stores (GitHub Secrets, GitLab CI/CD Variables, Jenkins Credentials). Never log secret values in build output.

## Common Security Mistakes

**Logging Secret Values**: Avoid logging environment variables or configuration objects that might contain secrets:

```js
// Dangerous
console.log('Config:', process.env);

// Safe
console.log('Port:', process.env.PORT);
```

**Exposing Through APIs**: Never expose environment variables through API endpoints or error messages:

```js
// Dangerous
app.get('/config', (req, res) => {
    res.json(process.env);
});
```

**Client-Side Exposure**: Do not expose server-side secrets to client applications. Use separate API keys with limited permissions for client-side usage.

**Insufficient Access Controls**: Restrict who can view and modify environment variables in deployment systems. Implement role-based access control for secret management.
