// Homepage content data: stats, skill groups, latest blog posts.
// Edit here to keep the homepage in sync without touching layout code.

export const stats = [
  { value: 80, suffix: '%', label: 'Provisioning time cut' },
  { value: 200, suffix: '+', label: 'Developers supported' },
  { value: 15, suffix: '+', label: 'Projects shipped' },
  { value: 10, suffix: 'yr', label: 'Under-pressure track record' },
];

export const skillGroups = [
  {
    title: 'Cloud & Platform',
    skills: ['GCP', 'Cloud Run', 'Cloud SQL', 'AWS EC2', 'Terraform', 'Ansible'],
  },
  {
    title: 'DevSecOps & CI/CD',
    skills: ['GitHub Actions', 'Argo CD', 'Bandit', 'Trivy', 'Semgrep', 'OWASP ZAP'],
  },
  {
    title: 'Observability',
    skills: ['Prometheus', 'Grafana', 'OpenTelemetry', 'SLOs', 'Structured Logging'],
  },
  {
    title: 'Development',
    skills: ['Go', 'Python', 'Django', 'TypeScript', 'React', 'Next.js'],
  },
];

// Curated newest posts (mirrors blog/ frontmatter). Update on new posts.
export const latestPosts = [
  {
    title: 'Ephemeral AWS Sandboxes: 80+ Isolated Environments at Half the Cost',
    date: '2026-04-28',
    description:
      'Per-user n8n sandboxes on AWS burstable EC2 with automated lifecycle management — isolated environments at 50% lower compute cost.',
    tags: ['AWS', 'Cost', 'Automation'],
    to: '/blog/2026/04/28/ephemeral-aws-sandboxes-cost',
  },
  {
    title: 'SLO-Driven Automated Rollback: Let the Metrics Pull the Cord',
    date: '2026-03-24',
    description:
      'Wiring Prometheus, Grafana and structured logging into the pipeline so an SLO breach triggers automatic rollback.',
    tags: ['Observability', 'SLO', 'Prometheus'],
    to: '/blog/2026/03/24/slo-driven-automated-rollback',
  },
  {
    title: 'Agentic DevOps Runbooks with a Human-Approval Layer',
    date: '2026-02-18',
    description:
      'An MCP-based runbook executor: the agent gathers context and proposes, a human approves every critical action.',
    tags: ['Agentic', 'MCP', 'Automation'],
    to: '/blog/2026/02/18/agentic-runbooks-mcp-human-approval',
  },
];
