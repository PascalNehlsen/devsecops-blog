---
title: "Git Security - Protecting Your Source Code and Commits"
slug: git-security-practices
authors: pascal
tags: [git, security, version-control, devsecops]
date: "2024-05-20"
---

# Git Security - Beyond Just Commits

Your Git repository is more than code—it's credentials, API keys, intellectual property, and your company's crown jewels. Let's secure it properly.

<!-- truncate -->

## The GitHub Token Incident

Last week, an intern pushed a commit containing a GitHub Personal Access Token with full repo access. Within **minutes**, an automated bot found it and:

1. Cloned all our private repositories
2. Scraped secrets from commit history
3. Created backdoor accounts

This post is about preventing that.

## 1. Commit Signing with GPG

### Why Sign Commits?

Anyone can impersonate you with `git config user.name "Your Name"`. Signed commits prove authenticity.

### Setup GPG Key
```bash
# Generate GPG key
gpg --full-generate-key
# Choose: RSA and RSA, 4096 bits, no expiration

# List keys
gpg --list-secret-keys --keyid-format=long

# Export public key
gpg --armor --export YOUR_KEY_ID

# Add to GitHub: Settings > SSH and GPG keys > New GPG key
```

### Configure Git
```bash
# Set signing key
git config --global user.signingkey YOUR_KEY_ID

# Sign all commits by default
git config --global commit.gpgsign true

# Sign tags
git config --global tag.gpgSign true
```

### Verify Signed Commits
```bash
# Verify last commit
git verify-commit HEAD

# Show signature
git log --show-signature

# Verify tag
git verify-tag v1.0.0
```

## 2. Branch Protection Rules

### GitHub Branch Protection
```yaml
# .github/branch-protection.yml
protection:
  required_status_checks:
    strict: true
    contexts:
      - "security/sast"
      - "security/secrets-scan"
      - "tests/unit"
      - "tests/integration"
  required_pull_request_reviews:
    required_approving_review_count: 2
    dismiss_stale_reviews: true
    require_code_owner_reviews: true
  restrictions:
    users: []
    teams:
      - "security-team"
  enforce_admins: true
  required_linear_history: true
  allow_force_pushes: false
  allow_deletions: false
```

### GitLab Protected Branches
```ruby
# Via GitLab UI or API
POST /projects/:id/protected_branches
{
  "name": "main",
  "push_access_level": 0,  # No one
  "merge_access_level": 30, # Developers
  "unprotect_access_level": 40, # Maintainers
  "allow_force_push": false,
  "code_owner_approval_required": true
}
```

## 3. Pre-commit Hooks for Secret Detection

### Setup pre-commit Framework
```bash
# Install
pip install pre-commit

# Create .pre-commit-config.yaml
cat > .pre-commit-config.yaml <<EOF
repos:
  # Detect secrets
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']

  # Git-secrets
  - repo: https://github.com/awslabs/git-secrets
    rev: master
    hooks:
      - id: git-secrets

  # Check for large files
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: check-added-large-files
        args: ['--maxkb=500']
      - id: check-merge-conflict
      - id: check-yaml
      - id: check-json
      - id: trailing-whitespace
      - id: end-of-file-fixer

  # Gitleaks for secret scanning
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
EOF

# Install hooks
pre-commit install

# Run on all files
pre-commit run --all-files
```

### Custom Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running security checks..."

# Check for AWS credentials
if grep -r "AKIA[0-9A-Z]{16}" --exclude-dir=.git .; then
    echo "ERROR: AWS Access Key detected!"
    exit 1
fi

# Check for private keys
if grep -r "BEGIN.*PRIVATE KEY" --exclude-dir=.git .; then
    echo "ERROR: Private key detected!"
    exit 1
fi

# Check for common password patterns
if grep -ri "password\s*=\s*['\"]\w" --exclude-dir=.git .; then
    echo "ERROR: Hardcoded password detected!"
    exit 1
fi

# Check for Stripe keys
if grep -r "sk_live_[0-9a-zA-Z]{24}" --exclude-dir=.git .; then
    echo "ERROR: Stripe secret key detected!"
    exit 1
fi

echo "All security checks passed"
exit 0
```

## 4. Cleaning Git History

### Remove Sensitive File from History
```bash
# Using BFG Repo-Cleaner (faster than git filter-branch)
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Remove file
java -jar bfg-1.14.0.jar --delete-files secrets.env

# Remove passwords from all files
java -jar bfg-1.14.0.jar --replace-text passwords.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (coordinate with team!)
git push --force
```

### Using git-filter-repo
```bash
# Install
pip install git-filter-repo

# Remove specific file
git filter-repo --path secrets.env --invert-paths

# Remove by pattern
git filter-repo --path-glob '*.key' --invert-paths

# Replace text
echo 'password123==>***REMOVED***' > replacements.txt
git filter-repo --replace-text replacements.txt
```

## 5. Git Repository Scanning

### Using Gitleaks
```bash
# Install
brew install gitleaks  # macOS
# or
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz

# Scan current repository
gitleaks detect --verbose

# Scan specific commit range
gitleaks detect --log-opts="HEAD^..HEAD"

# Generate report
gitleaks detect --report-path gitleaks-report.json --report-format json
```

### Using TruffleHog
```bash
# Install
pip install truffleHog

# Scan repository
trufflehog git https://github.com/your-org/your-repo

# Scan local repo
trufflehog filesystem /path/to/repo

# Scan since specific commit
trufflehog git file:///path/to/repo --since-commit abcd1234
```

### CI/CD Integration
```yaml
# .gitlab-ci.yml
security:gitleaks:
  stage: security
  image: zricethezav/gitleaks:latest
  script:
    - gitleaks detect --verbose --report-path gitleaks-report.json
  artifacts:
    reports:
      secret_detection: gitleaks-report.json
    paths:
      - gitleaks-report.json
  allow_failure: false

security:trufflehog:
  stage: security
  image: python:3.11
  script:
    - pip install truffleHog
    - trufflehog filesystem . --json > trufflehog-report.json
  artifacts:
    paths:
      - trufflehog-report.json
```

## 6. Secure Git Workflows

### Gitflow with Security Gates
```
main (protected)
  ├── develop (protected)
  │   ├── feature/user-auth (requires: SAST, secrets scan)
  │   ├── feature/payment (requires: SAST, DAST, security review)
  │   └── bugfix/login-issue
  ├── release/v1.2.0 (requires: full security scan)
  └── hotfix/critical-vuln (emergency process)
```

### Security Checks Per Branch Type
```yaml
# .gitlab-ci.yml
workflow:
  rules:
    - if: '$CI_COMMIT_BRANCH =~ /^feature\/.*$/'
      variables:
        SECURITY_LEVEL: "standard"
    - if: '$CI_COMMIT_BRANCH =~ /^release\/.*$/'
      variables:
        SECURITY_LEVEL: "full"
    - if: '$CI_COMMIT_BRANCH == "main"'
      variables:
        SECURITY_LEVEL: "full"

security:scan:
  script:
    - |
      if [ "$SECURITY_LEVEL" == "full" ]; then
        echo "Running full security scan"
        gitleaks detect
        trivy fs . --severity HIGH,CRITICAL
        snyk test
      else
        echo "Running standard security scan"
        gitleaks detect
      fi
```

## 7. Access Control & Permissions

### GitHub Teams Structure
```
Organization
├── Admins (full access)
├── Security Team (all repos, branch protection)
├── Developers
│   ├── Backend Team (backend repos, write access)
│   ├── Frontend Team (frontend repos, write access)
│   └── DevOps Team (infra repos, write access)
└── External Contributors (read-only, can fork)
```

### CODEOWNERS File
```bash
# .github/CODEOWNERS

# Default owners for everything
* @org/developers

# Security-sensitive files require security team review
/security/ @org/security-team
/.github/ @org/security-team @org/devops
/Dockerfile @org/security-team @org/devops
/docker-compose.yml @org/security-team @org/devops

# Infrastructure code requires DevOps review
/terraform/ @org/devops @org/security-team
/kubernetes/ @org/devops @org/security-team
/.gitlab-ci.yml @org/devops

# Backend requires backend team
/backend/ @org/backend-team
/api/ @org/backend-team

# Frontend requires frontend team
/frontend/ @org/frontend-team
/web/ @org/frontend-team

# Database migrations require multiple approvals
/migrations/ @org/backend-team @org/database-admins

# Critical security files require admin approval
secrets.yml @org/admins @org/security-team
.env.* @org/admins @org/security-team
```

## 8. Git Audit Logging

### Monitor Git Operations
```python
# git_audit_logger.py
import git
import json
import logging
from datetime import datetime

class GitAuditLogger:
    def __init__(self, repo_path):
        self.repo = git.Repo(repo_path)
        self.setup_logging()

    def setup_logging(self):
        logging.basicConfig(
            filename='git-audit.log',
            level=logging.INFO,
            format='%(asctime)s - %(message)s'
        )

    def log_commit(self, commit):
        """Log commit details"""
        log_entry = {
            'action': 'commit',
            'sha': commit.hexsha,
            'author': commit.author.name,
            'email': commit.author.email,
            'message': commit.message,
            'timestamp': commit.committed_datetime.isoformat(),
            'files_changed': len(commit.stats.files),
            'insertions': commit.stats.total['insertions'],
            'deletions': commit.stats.total['deletions']
        }
        logging.info(json.dumps(log_entry))

    def audit_recent_commits(self, days=7):
        """Audit commits from last N days"""
        since = datetime.now() - timedelta(days=days)
        for commit in self.repo.iter_commits(since=since):
            self.log_commit(commit)

    def detect_suspicious_activity(self):
        """Detect suspicious patterns"""
        alerts = []

        for commit in self.repo.iter_commits(max_count=100):
            # Large deletions (potential data destruction)
            if commit.stats.total['deletions'] > 1000:
                alerts.append({
                    'severity': 'high',
                    'type': 'large_deletion',
                    'commit': commit.hexsha,
                    'author': commit.author.email
                })

            # Commits at unusual hours (potential compromise)
            hour = commit.committed_datetime.hour
            if hour < 6 or hour > 22:
                alerts.append({
                    'severity': 'medium',
                    'type': 'unusual_hour',
                    'commit': commit.hexsha,
                    'time': commit.committed_datetime.isoformat()
                })

        return alerts

# Usage
audit = GitAuditLogger('/path/to/repo')
audit.audit_recent_commits(days=30)
alerts = audit.detect_suspicious_activity()
for alert in alerts:
    print(f"WARNING: {alert['severity'].upper()}: {alert['type']} - {alert['commit']}")
```

## 9. Secure Git Configuration

### Global Security Settings
```bash
# Prevent accidental pushes to wrong remote
git config --global push.default simple

# Always use SSH instead of HTTPS
git config --global url."git@github.com:".insteadOf "https://github.com/"

# Enable credential helper (cached credentials)
git config --global credential.helper 'cache --timeout=3600'

# Auto-fetch with prune
git config --global fetch.prune true

# Show status in short format
git config --global status.short true

# Use rebase instead of merge for pulls
git config --global pull.rebase true

# Sign all tags by default
git config --global tag.gpgSign true
```

### Repository-Specific Settings
```bash
# Inside repository
cd your-repo

# Require signed commits
git config commit.gpgsign true

# Set up hooks directory
git config core.hooksPath .githooks

# Enable fsck on receive
git config receive.fsckObjects true
```

## Security Checklist

- [ ] Enable GPG commit signing
- [ ] Configure branch protection rules
- [ ] Set up pre-commit hooks for secret detection
- [ ] Add CODEOWNERS file
- [ ] Enable 2FA for all team members
- [ ] Regular repository scanning (gitleaks, trufflehog)
- [ ] Audit git access logs monthly
- [ ] Limit force push permissions
- [ ] Review and rotate SSH keys annually
- [ ] Train team on git security best practices
- [ ] Document incident response for leaked credentials
- [ ] Use SSH keys instead of passwords
- [ ] Implement security gates in CI/CD

## Emergency: Leaked Credentials

```bash
#!/bin/bash
# emergency-git-cleanup.sh

echo "EMERGENCY: Credential Leak Response"

# 1. Revoke compromised credentials immediately
echo "[1/5] Revoking credentials..."
# Call your secrets management API

# 2. Scan entire git history
echo "[2/5] Scanning git history..."
gitleaks detect --verbose --log-opts="--all"

# 3. Remove secrets from history
echo "[3/5] Cleaning git history..."
java -jar bfg.jar --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. Notify team
echo "[4/5] Notifying team..."
gh api /repos/:owner/:repo/issues \
  -X POST \
  -f title="Security Incident: Credentials Leaked" \
  -f body="Immediate action required. Check Slack for details."

# 5. Force push (DANGEROUS - coordinate first!)
echo "[5/5] Force pushing clean history..."
read -p "Are you sure you want to force push? (yes/no): " confirm
if [ "$confirm" == "yes" ]; then
    git push --force --all
    git push --force --tags
fi

echo "Emergency response complete"
```

Next week: **Kubernetes Security Deep Dive**

---

*Securing your Git workflows? Share your tips on [GitHub](https://github.com/PascalNehlsen)!*
