// Homepage content data: stats, skill groups, latest blog posts.
// Edit here to keep the homepage in sync without touching layout code.

import { translate } from '@docusaurus/Translate';

// Three numbers, each one defensible in conversation and each linking to the
// write-up that documents it. A metric a reader can click through to is worth
// more than four they have to take on faith.
//
// Dropped from the previous set: "200+ developers supported" (unsourced) and
// "10yr under-pressure track record" (not a quantity, and the count-up
// animated it as one). "15+ projects shipped" counts repositories, which is
// the kind of number engineers discount on sight.
// Labels are translated, values are not. The numbers are the claim; they have
// to read identically in both languages or the site has two truths.
export const stats = [
  {
    value: 80,
    suffix: '%',
    label: translate({
      id: 'homepage.stats.provisioning',
      message: 'GCP env provisioning: 4 h → 45 min',
    }),
    href: '/blog/terraform-golden-paths-gcp',
  },
  {
    value: 60,
    suffix: '%',
    label: translate({
      id: 'homepage.stats.response',
      message: 'Faster response on known failure classes',
    }),
    href: '/blog/agentic-runbooks-mcp-human-approval',
  },
  {
    value: 50,
    suffix: '%',
    label: translate({
      id: 'homepage.stats.cost',
      message: 'Lower compute cost per sandbox env',
    }),
    href: '/blog/ephemeral-aws-sandboxes-cost',
  },
];

// Group titles are translatable, the tool names are not: a badge reading
// "Beobachtbarkeit" would be a worse label than the term the field uses.
export const skillGroups = [
  {
    title: translate({
      id: 'homepage.skills.cloud',
      message: 'Cloud & Platform',
    }),
    skills: ['GCP', 'Cloud Run', 'Cloud SQL', 'AWS EC2', 'Terraform', 'Ansible'],
  },
  {
    title: translate({
      id: 'homepage.skills.devsecops',
      message: 'DevSecOps & CI/CD',
    }),
    skills: ['GitHub Actions', 'Argo CD', 'Bandit', 'Trivy', 'Semgrep', 'OWASP ZAP'],
  },
  {
    title: translate({
      id: 'homepage.skills.observability',
      message: 'Observability',
    }),
    skills: ['Prometheus', 'Grafana', 'OpenTelemetry', 'SLOs', 'Structured Logging'],
  },
  {
    title: translate({
      id: 'homepage.skills.development',
      message: 'Development',
    }),
    skills: ['Go', 'Python', 'Django', 'TypeScript', 'React', 'Next.js'],
  },
];

// Latest posts are no longer listed here. They come from the blog plugin at
// build time via plugins/latest-posts (see BlogPreview.js). Duplicating them
// meant the homepage drifted from blog/ and, worse, that re-slugging a post
// broke the build.
