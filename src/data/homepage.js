// Homepage content data: stats, skill groups, latest blog posts.
// Edit here to keep the homepage in sync without touching layout code.

// Three numbers, each one defensible in conversation and each linking to the
// write-up that documents it. A metric a reader can click through to is worth
// more than four they have to take on faith.
//
// Dropped from the previous set: "200+ developers supported" (unsourced) and
// "10yr under-pressure track record" (not a quantity, and the count-up
// animated it as one). "15+ projects shipped" counts repositories, which is
// the kind of number engineers discount on sight.
export const stats = [
  {
    value: 80,
    suffix: '%',
    label: 'GCP env provisioning: 4 h → 45 min',
    href: '/blog/2026/01/20/terraform-golden-paths-gcp',
  },
  {
    value: 60,
    suffix: '%',
    label: 'Faster response on known failure classes',
    href: '/blog/2026/02/18/agentic-runbooks-mcp-human-approval',
  },
  {
    value: 50,
    suffix: '%',
    label: 'Lower compute cost per sandbox env',
    href: '/blog/2026/04/28/ephemeral-aws-sandboxes-cost',
  },
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

// Latest posts are no longer listed here. They come from the blog plugin at
// build time via plugins/latest-posts — see BlogPreview.js. Duplicating them
// meant the homepage drifted from blog/ and, worse, that re-slugging a post
// broke the build.
