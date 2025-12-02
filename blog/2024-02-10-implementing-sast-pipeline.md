---
title: Implementing SAST in Your CI/CD Pipeline - A Practical Guide
slug: implementing-sast-pipeline
authors: pascal
tags: [sast, cicd, security, automation]
date: 2024-02-10
---

# Implementing SAST in Your CI/CD Pipeline

Static Application Security Testing (SAST) is your first line of defense against vulnerabilities. Let me show you how I integrated it into production pipelines.

<!-- truncate -->

## Why SAST Matters

SAST tools analyze your source code **before runtime**, catching vulnerabilities like:
- SQL injection vulnerabilities
- Cross-site scripting (XSS) flaws
- Hardcoded secrets
- Insecure deserialization
- Path traversal issues

## Choosing the Right Tools

### For Python Projects
```yaml
# .gitlab-ci.yml
sast:python:
  stage: security
  image: python:3.11
  script:
    - pip install bandit safety
    - bandit -r . -f json -o bandit-report.json
    - safety check --json > safety-report.json
  artifacts:
    reports:
      sast: bandit-report.json
    paths:
      - bandit-report.json
      - safety-report.json
  allow_failure: false
```

### For JavaScript/TypeScript
```yaml
sast:javascript:
  stage: security
  image: node:18
  script:
    - npm install
    - npm audit --json > audit-report.json
    - npx eslint . --ext .js,.ts --format json -o eslint-report.json
  artifacts:
    reports:
      sast: eslint-report.json
```

## My SAST Strategy

### 1. Start with Low-Hanging Fruit
Don't try to fix everything at once:
- Focus on **high and critical** vulnerabilities first
- Create tickets for medium-severity issues
- Document false positives

### 2. Configure Baseline Rules
```python
# .bandit config
[bandit]
exclude_dirs = ['/test', '/tests', '/venv']
tests = ['B201', 'B301', 'B302', 'B303', 'B304', 'B305', 'B306']
skips = ['B101']  # Skip assert warnings in tests
```

### 3. Integrate with Code Review
- SAST runs on every merge request
- Block merges if critical issues found
- Add security champions as mandatory reviewers

## Real-World Example: Finding Hardcoded Secrets

### Before SAST
```python
# Bad practice - Hardcoded credentials
DATABASE_URL = "postgresql://admin:password123@localhost/db"
AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE"
```

### After SAST Detection
```python
# Good practice - Environment variables
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_KEY')

if not DATABASE_URL or not AWS_SECRET_KEY:
    raise ValueError("Missing required environment variables")
```

## Handling False Positives

SAST tools aren't perfect. Use inline comments to suppress false positives:

```python
# nosec B603 - subprocess call is safe, input is validated
result = subprocess.run(validated_command, shell=False)
```

## Measuring Success

Track these metrics:
- **Time to detect**: How quickly vulnerabilities are found
- **Time to remediate**: How fast they're fixed
- **False positive rate**: Aim for < 10%
- **Pipeline failure rate**: Should decrease over time

## Common Pitfalls

Don't run SAST only in production branches. Run on every branch and merge request.

Don't ignore all warnings. Triage and document decisions.

Don't block the entire pipeline for low-severity issues. Use severity-based failure thresholds.## Next Steps

1. Add SAST to at least one project this week
2. Set up automated notifications for security issues
3. Document your SAST baseline and exceptions
4. Train your team on common vulnerability patterns

In the next post, we'll explore **DAST (Dynamic Application Security Testing)** and how it complements SAST.

---

*Questions about SAST implementation? Let's discuss on [GitHub](https://github.com/PascalNehlsen)!*
