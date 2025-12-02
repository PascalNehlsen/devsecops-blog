---
title: Secrets Management Done Right - No More Hardcoded Passwords
slug: secrets-management-done-right
authors: pascal
tags: [secrets, security, vault, kubernetes]
date: 2024-04-12
---

# Secrets Management Done Right

Hardcoded secrets are a security nightmare. Here's how I implemented proper secrets management across development, staging, and production.

<!-- truncate -->

## The $50,000 Lesson

A developer accidentally committed AWS credentials to a public GitHub repo. Within **4 minutes**, attackers spun up EC2 instances for crypto mining. The bill: **$50,847** before we caught it.

This is why secrets management matters.

## The Problems We Faced

1. **Hardcoded secrets** in source code
2. **Secrets in environment variables** (visible in logs)
3. **Shared passwords** across team members
4. **No rotation policy**
5. **No audit trail** of secret access

## Solution 1: HashiCorp Vault

### Setup
```bash
# Install Vault
wget https://releases.hashicorp.com/vault/1.15.0/vault_1.15.0_linux_amd64.zip
unzip vault_1.15.0_linux_amd64.zip
sudo mv vault /usr/local/bin/

# Start Vault in dev mode (for testing)
vault server -dev

# Export Vault address
export VAULT_ADDR='http://127.0.0.1:8200'
```

### Store Secrets
```bash
# Store database credentials
vault kv put secret/database/prod \
  username="db_admin" \
  password="$(openssl rand -base64 32)" \
  host="prod-db.company.com" \
  port="5432"

# Store API keys
vault kv put secret/api/stripe \
  public_key="pk_live_xxx" \
  secret_key="sk_live_yyy"
```

### Retrieve Secrets in Python
```python
import hvac
import os

class SecretsManager:
    def __init__(self):
        self.client = hvac.Client(
            url=os.getenv('VAULT_ADDR'),
            token=os.getenv('VAULT_TOKEN')
        )

    def get_db_credentials(self, env='prod'):
        """Get database credentials from Vault"""
        try:
            secret = self.client.secrets.kv.v2.read_secret_version(
                path=f'database/{env}'
            )
            return secret['data']['data']
        except Exception as e:
            raise ValueError(f"Failed to retrieve secrets: {e}")

    def get_api_key(self, service):
        """Get API key for specific service"""
        secret = self.client.secrets.kv.v2.read_secret_version(
            path=f'api/{service}'
        )
        return secret['data']['data']['secret_key']

# Usage
secrets = SecretsManager()
db_creds = secrets.get_db_credentials('prod')
stripe_key = secrets.get_api_key('stripe')

# Connect to database
import psycopg2
conn = psycopg2.connect(
    host=db_creds['host'],
    port=db_creds['port'],
    user=db_creds['username'],
    password=db_creds['password']
)
```

## Solution 2: Kubernetes Secrets

### Create Secret from Literal
```bash
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password=$(openssl rand -base64 32) \
  --namespace=production
```

### Create Secret from File
```bash
# Create secret file
cat > db-secret.yaml <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: database-credentials
  namespace: production
type: Opaque
stringData:
  username: db_admin
  password: $(openssl rand -base64 32)
  connection-string: "postgresql://db_admin:password@prod-db:5432/myapp"
EOF

# Apply secret
kubectl apply -f db-secret.yaml
```

### Use Secrets in Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-app
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: myapp:latest
        env:
        # Environment variable from secret
        - name: DATABASE_USERNAME
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: username
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: password
        # Mount entire secret as files
        volumeMounts:
        - name: secret-volume
          mountPath: /etc/secrets
          readOnly: true
      volumes:
      - name: secret-volume
        secret:
          secretName: database-credentials
```

### Read Mounted Secrets in Python
```python
def read_secret_file(secret_name):
    """Read secret from mounted volume"""
    secret_path = f"/etc/secrets/{secret_name}"
    with open(secret_path, 'r') as f:
        return f.read().strip()

# Usage
db_username = read_secret_file('username')
db_password = read_secret_file('password')
```

## Solution 3: AWS Secrets Manager

### Store Secret
```bash
aws secretsmanager create-secret \
  --name prod/database/credentials \
  --secret-string '{"username":"admin","password":"secure_password","host":"prod-db.aws.com"}'
```

### Retrieve in Python
```python
import boto3
import json
from botocore.exceptions import ClientError

class AWSSecretsManager:
    def __init__(self, region='us-east-1'):
        self.client = boto3.client('secretsmanager', region_name=region)

    def get_secret(self, secret_name):
        """Retrieve secret from AWS Secrets Manager"""
        try:
            response = self.client.get_secret_value(SecretId=secret_name)
            return json.loads(response['SecretString'])
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                raise ValueError(f"Secret {secret_name} not found")
            raise

    def rotate_secret(self, secret_name):
        """Trigger secret rotation"""
        return self.client.rotate_secret(
            SecretId=secret_name,
            RotationLambdaARN='arn:aws:lambda:region:account:function:rotate-secret'
        )

# Usage
sm = AWSSecretsManager()
db_creds = sm.get_secret('prod/database/credentials')

print(f"Connecting to {db_creds['host']} as {db_creds['username']}")
```

## Solution 4: Environment-Specific .env Files

For local development:

### Project Structure
```
project/
├── .env.example        # Template (commit this)
├── .env.development    # Local dev (DO NOT COMMIT)
├── .env.staging        # Staging (DO NOT COMMIT)
└── .env.production     # Production (DO NOT COMMIT)
```

### .env.example
```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASE_POOL_SIZE=10

# API Keys
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# JWT Configuration
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Load Environment Variables
```python
from dotenv import load_dotenv
import os

# Load environment-specific config
env = os.getenv('APP_ENV', 'development')
load_dotenv(f'.env.{env}')

# Validate required variables
required_vars = [
    'DATABASE_URL',
    'JWT_SECRET_KEY',
    'STRIPE_SECRET_KEY'
]

missing_vars = [var for var in required_vars if not os.getenv(var)]
if missing_vars:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

# Access secrets
DATABASE_URL = os.getenv('DATABASE_URL')
JWT_SECRET = os.getenv('JWT_SECRET_KEY')
```

### .gitignore
```gitignore
# Never commit these
.env
.env.*
!.env.example

# Secrets
secrets/
*.key
*.pem
*.p12
*.pfx
```

## Secret Rotation Strategy

### Automatic Rotation (AWS)
```python
import boto3
from datetime import datetime, timedelta

def rotate_database_password(secret_name):
    """
    Rotate database password automatically
    Called by AWS Lambda on schedule
    """
    sm = boto3.client('secretsmanager')
    rds = boto3.client('rds')

    # Get current secret
    current = sm.get_secret_value(SecretId=secret_name)
    current_password = json.loads(current['SecretString'])['password']

    # Generate new password
    new_password = generate_secure_password()

    # Update database
    rds.modify_db_instance(
        DBInstanceIdentifier='prod-db',
        MasterUserPassword=new_password
    )

    # Update secret
    new_secret = json.loads(current['SecretString'])
    new_secret['password'] = new_password
    new_secret['rotated_at'] = datetime.now().isoformat()

    sm.put_secret_value(
        SecretId=secret_name,
        SecretString=json.dumps(new_secret)
    )

    return {"status": "success", "rotated_at": new_secret['rotated_at']}

def generate_secure_password(length=32):
    """Generate cryptographically secure password"""
    import secrets
    import string

    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))
```

## Detecting Leaked Secrets

### Pre-commit Hook with git-secrets
```bash
# Install git-secrets
brew install git-secrets  # macOS
sudo apt-get install git-secrets  # Linux

# Setup for repository
cd your-repo
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add 'password\s*=\s*["\']\S+["\']'
git secrets --add 'api[_-]key\s*=\s*["\']\S+["\']'
```

### Pre-commit Hook with detect-secrets
```bash
# Install
pip install detect-secrets

# Generate baseline
detect-secrets scan > .secrets.baseline

# Add to .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

## Best Practices Checklist

- [ ] **Never commit secrets** to version control
- [ ] Use **different secrets** for dev/staging/prod
- [ ] Implement **secret rotation** (every 90 days)
- [ ] Enable **audit logging** for secret access
- [ ] Use **short-lived tokens** when possible
- [ ] Encrypt secrets **at rest and in transit**
- [ ] Implement **least privilege access**
- [ ] Set up **secret scanning** in CI/CD
- [ ] Have an **incident response plan** for leaked secrets
- [ ] Use **managed services** (Vault, AWS Secrets Manager) in production

## Emergency Response: Secret Leaked

```bash
#!/bin/bash
# emergency-secret-rotation.sh

SECRET_NAME=$1

echo "EMERGENCY SECRET ROTATION for $SECRET_NAME"

# 1. Revoke compromised secret immediately
echo "[1/5] Revoking compromised secret..."
aws secretsmanager rotate-secret --secret-id $SECRET_NAME

# 2. Update all services
echo "[2/5] Updating Kubernetes secrets..."
kubectl delete secret $SECRET_NAME
kubectl create secret generic $SECRET_NAME --from-literal=key=$(generate_new_secret)

# 3. Rolling restart of all pods
echo "[3/5] Rolling restart..."
kubectl rollout restart deployment -n production

# 4. Audit access logs
echo "[4/5] Auditing access logs..."
aws cloudtrail lookup-events --lookup-attributes AttributeKey=ResourceName,AttributeValue=$SECRET_NAME

# 5. Notify security team
echo "[5/5] Notifying security team..."
curl -X POST $SLACK_WEBHOOK -d "{\"text\":\"Secret rotation completed for $SECRET_NAME\"}"

echo "Emergency rotation complete"
```

## Cost Comparison

| Solution | Cost/Month | Pros | Cons |
|----------|------------|------|------|
| **HashiCorp Vault** | Self-hosted: $0-500 | Full control, flexible | Complex setup |
| **AWS Secrets Manager** | $0.40/secret + API calls | Managed, auto-rotation | AWS-only |
| **Azure Key Vault** | $0.03/10k operations | Managed, cheap | Azure-only |
| **Kubernetes Secrets** | Free | Built-in, simple | Basic features only |
| **Environment Variables** | Free | Very simple | Insecure, no rotation |

## Resources

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [HashiCorp Vault Documentation](https://www.vaultproject.io/docs)
- [AWS Secrets Manager Best Practices](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html)

Next: **Implementing Zero Trust Architecture**

---

*Questions about secrets management? Let's discuss on [GitHub](https://github.com/PascalNehlsen)!*
