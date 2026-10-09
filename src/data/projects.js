// Central project registry powering the homepage showcase.
// Edit this file to add / update / reorder projects. The homepage reads from here.
//
// category: 'work' | 'product' | 'recent'
// featured: 'selected' = one of the three cards on the homepage. Three, not
//           six: the homepage argues, the projects index enumerates.
// featured: true = surfaced by the projects docs page, not the homepage.
// Omit githubUrl for private repositories (only live/docs links render).
//
// Only the three 'selected' entries have their prose wrapped in translate().
// The rest is not rendered anywhere today, and an id in code.json that no page
// ever reads is a translation nobody can check.

import { translate } from '@docusaurus/Translate';

const projects = [
  // ── Work (Developer Akademie GmbH) ──────────────────────────────
  {
    title: 'Terraform Golden Paths on GCP',
    category: 'work',
    featured: true,
    description:
      'Every new service environment was a four-hour ticket: someone hand-clicked Cloud Run, Cloud SQL, a bucket and six IAM bindings, and got it subtly wrong about a third of the time. I modularised the GCP estate around one opinionated golden path per service shape, put the guardrails in the module instead of in a wiki, and gated every plan behind automated policy checks. A team now provisions its own environment in under 45 minutes without opening a ticket, and the drift that used to surface in production surfaces in terraform plan.',
    impact:
      'Provisioning 4 h → 45 min',
    tags: ['Terraform', 'GCP', 'Cloud Run', 'IAM', 'GitOps'],
    blogUrl: '/blog/terraform-golden-paths-gcp',
  },
  {
    title: 'Agentic Runbooks with a Human-Approval Gate',
    category: 'work',
    featured: true,
    description:
      'Known failure classes were eating on-call time not because the fix was hard, but because assembling the context (logs, Terraform state, recent deploys) took twenty minutes at 3 a.m. I built an MCP server that does the gathering and proposes a remediation, and then stops. A human approves or rejects every state-changing action, each one is logged with the reasoning that produced it, and each one is reversible. The agent is allowed to be wrong; it is not allowed to be wrong unsupervised.',
    impact:
      'Response time −60%',
    tags: ['Go', 'MCP', 'GCP', 'Terraform', 'On-Call'],
    blogUrl: '/blog/agentic-runbooks-mcp-human-approval',
  },
  {
    title: 'Ephemeral Per-User Sandboxes on AWS',
    category: 'work',
    featured: true,
    description:
      '80+ trainees each needed a production-like n8n environment, and a fixed t3.medium per person was both wasteful and, at cohort scale, expensive. The workloads are bursty by nature: idle for hours, then a spike. So I put them on burstable instances sized for the median rather than the peak, and wrote lifecycle automation that stops and reclaims anything idle past a threshold. Everyone gets a real isolated environment; compute costs about half of the fixed-size equivalent.',
    impact:
      '80+ envs, spend −50%',
    tags: ['AWS', 'EC2', 'Terraform', 'n8n', 'Cost'],
    blogUrl: '/blog/ephemeral-aws-sandboxes-cost',
  },
  {
    title: 'Security Pipeline Integration',
    category: 'work',
    featured: true,
    description:
      'SAST (Bandit, Semgrep) and DAST (OWASP ZAP) integrated into GitHub Actions with Docker image hardening before deployment. Automated rollback trigger on SLO breach cut the deployment error rate below 2%.',
    impact: 'Deploy error rate <2%',
    tags: ['GitHub Actions', 'SAST/DAST', 'Docker', 'OWASP ZAP'],
    blogUrl: '/blog/slo-driven-automated-rollback',
  },

  // ── Products (private) ──────────────────────────────────────────
  {
    title: 'Runnz',
    category: 'product',
    featured: true,
    description:
      'Multi-tenant SaaS for trade-fair construction scheduling. Deadlines are derived from the build date via reusable workflow blocks, so moving the date moves the whole chain. Secret scanning and dependency audit run pre-commit and in CI, not as advisory steps.',
    impact: 'Live product',
    tags: ['NestJS', 'TypeScript', 'PostgreSQL', 'Docker', 'Multi-Tenant'],
    liveUrl: 'https://runnz.de',
    docsUrl: '/docs/projects/runnz',
  },
  {
    title: 'Emavi',
    category: 'product',
    featured: true,
    description:
      'Barrier-free multi-tenant PWA for assisted-living facilities. Residents log daily mood; staff see well-being trends and generate reports. Web Push, containerised. Shipped as HepaAssist, now runs as Emavi.',
    impact: 'Case study',
    tags: ['Next.js', 'FastAPI', 'PostgreSQL', 'Docker', 'PWA'],
    docsUrl: '/docs/projects/hepa-assist',
  },
  {
    title: 'AI Chatbot Platform',
    category: 'product',
    featured: true,
    description:
      'Multi-tenant AI chatbot platform with appointment booking. Configurable per client, embedded via a script tag with Shadow DOM isolation so host CSS cannot reach it, and per-tenant CORS validation on every endpoint.',
    impact: 'Case study',
    tags: ['Next.js', 'OpenAI', 'Prisma', 'Multi-Tenant', 'TypeScript'],
    docsUrl: '/docs/projects/chatbot',
  },
  {
    title: 'CaptureDesk',
    category: 'product',
    description:
      'Electron desktop app for screen recording built on the Loom Record SDK, with a custom drawing overlay and a lightweight local Express backend. Linux-first.',
    impact: 'Desktop app',
    tags: ['Electron', 'Node.js', 'Express', 'Linux'],
  },
  {
    title: 'Agent Delivery Pipeline',
    category: 'product',
    featured: 'selected',
    description: translate({
      id: 'projects.agentDeliveryPipeline.description',
      message:
        'An AI agent writes n8n workflows that run against real calendars, mailboxes and spreadsheets, and after the fifth generated workflow nobody reads carefully any more. So the gate is not me: a machine-checkable contract, a builder agent that cannot run a shell and a reviewer that can run exactly one command, both enforced by hooks rather than prompts, and a forced failure before the real run. Counting the acceptance log for the first time found two holes in the gates.',
    }),
    impact: translate({
      id: 'projects.agentDeliveryPipeline.impact',
      message: '0 of 4 passed first review',
    }),
    tags: ['AI Agents', 'n8n', 'Python', 'Docker', 'Guardrails'],
    docsUrl: '/docs/projects/agent-delivery-pipeline',
    blogUrl: '/blog/agent-gate-it-cannot-open',
  },

  {
    title: 'Shift-Left Guard',
    category: 'product',
    featured: 'selected',
    description: translate({
      id: 'projects.shiftLeftGuard.description',
      message:
        'Claude Code noticed a script injection in a copied workflow template every time I asked it to copy one, and still left it on disk two times in ten; a cheaper model copied and committed it every time. I built a mod that blocks insecure workflows, Dockerfiles, Terraform and agent configs before they are written and refuses Claude\'s commits while a flagged file is still flagged. Then I measured it against its own README: the measurement disproved the README and found three holes, each fixed and measured again.',
    }),
    impact: translate({
      id: 'projects.shiftLeftGuard.impact',
      message: 'Injections committed 5/5 → 0/5',
    }),
    tags: ['Claude Code', 'TypeScript', 'GitHub Actions', 'MCP', 'Guardrails'],
    githubUrl: 'https://github.com/PascalNehlsen/shift-left-guard',
    docsUrl: '/docs/projects/shift-left-guard',
    blogUrl: '/blog/noticing-is-not-a-control',
  },


  {
    title: 'Falar',
    category: 'product',
    featured: 'selected',
    description: translate({
      id: 'projects.falar.description',
      message:
        'A voice AI tutor where the phone talks to OpenAI\'s Realtime API directly, so my server pays for every minute of a call it never hears. The backend owns the session, watches each call over a sideband connection, measures minutes by its own clock and fails closed when it cannot, with per-call, daily and monthly limits underneath. Cost per conversation minute went from about 14 to about 9.5 cents, measured; internal test on Google Play since October 2026.',
    }),
    impact: translate({
      id: 'projects.falar.impact',
      message: '14 → 9.5 cents per minute',
    }),
    tags: ['Realtime API', 'Django', 'React Native', 'GCP', 'Cost Control'],
    docsUrl: '/docs/projects/falar',
    blogUrl: '/blog/guard-the-call-you-never-hear',
  },

  // ── Recent (portfolio / learning projects) ──────────────────────
  {
    title: 'Conduit Pipeline & Container',
    category: 'recent',
    description:
      'GitHub Actions pipeline that clones, builds Docker images and deploys via Docker Compose to a remote server, plus the Compose setup for an Angular frontend with a Django backend.',
    tags: ['GitHub Actions', 'Docker Compose', 'Django', 'Angular'],
    githubUrl: 'https://github.com/PascalNehlsen/conduit',
    docsUrl: '/docs/projects/recent/conduit-pipeline',
  },
  {
    title: 'Truck Signs API',
    category: 'recent',
    description:
      'E-commerce store for customizable vinyl truck signs. Django + DRF backend, Stripe payments, Dockerised for deployment.',
    tags: ['Django', 'DRF', 'Stripe', 'Docker'],
    githubUrl: 'https://github.com/PascalNehlsen/truck_signs_api',
    docsUrl: '/docs/projects/recent/truck-signs-api',
  },
  {
    title: 'VM Setup & Hardening',
    category: 'recent',
    description:
      'Server hardening walkthrough: nginx, SSH key generation, disabling password auth, SSH aliases and managing multiple identities.',
    tags: ['Linux', 'nginx', 'SSH', 'Hardening'],
    githubUrl: 'https://github.com/PascalNehlsen/v-server-setup',
    docsUrl: '/docs/projects/recent/vm-setup',
  },
  {
    title: 'Python Pentest Tools',
    category: 'recent',
    description:
      'Pentesting tools in Python: network scanning, password cracking and exploitation scripts for ethical hacking and security testing.',
    tags: ['Python', 'Pentesting', 'Security'],
    githubUrl: 'https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/',
    docsUrl: '/docs/projects/recent/python-tools/intro',
  },
  {
    title: 'OWASP Juice Shop Challenges',
    category: 'recent',
    description:
      'Documented OWASP Juice Shop challenges: hands-on identification and mitigation of common web vulnerabilities in a safe environment.',
    tags: ['OWASP', 'Web Security', 'CTF'],
    githubUrl: 'https://github.com/PascalNehlsen/juice-shop-challenges',
    docsUrl: '/docs/projects/recent/juice-shop/intro',
  },
];

export default projects;
