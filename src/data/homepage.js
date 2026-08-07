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

// Latest posts are no longer listed here. They come from the blog plugin at
// build time via plugins/latest-posts — see BlogPreview.js. Duplicating them
// meant the homepage drifted from blog/ and, worse, that re-slugging a post
// broke the build.
