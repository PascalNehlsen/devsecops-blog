// Central project registry powering the homepage showcase.
// Edit this file to add / update / reorder projects — the homepage reads from here.
//
// category: 'work' | 'product' | 'recent'
// featured: 'selected' — one of the three cards on the homepage. Three, not
//           six: the homepage argues, the projects index enumerates.
// featured: true — surfaced by the projects docs page, not the homepage.
// Omit githubUrl for private repositories (only live/docs links render).

const projects = [
  // ── Work (Developer Akademie GmbH) ──────────────────────────────
  {
    title: 'Terraform Golden Paths on GCP',
    category: 'work',
    featured: 'selected',
    description:
      'Every new service environment was a four-hour ticket: someone hand-clicked Cloud Run, Cloud SQL, a bucket and six IAM bindings, and got it subtly wrong about a third of the time. I modularised the GCP estate around one opinionated golden path per service shape, put the guardrails in the module instead of in a wiki, and gated every plan behind automated policy checks. A team now provisions its own environment in under 45 minutes without opening a ticket, and the drift that used to surface in production surfaces in terraform plan.',
    impact: 'Provisioning 4 h → 45 min',
    tags: ['Terraform', 'GCP', 'Cloud Run', 'IAM', 'GitOps'],
    blogUrl: '/blog/terraform-golden-paths-gcp',
  },
  {
    title: 'Agentic Runbooks with a Human-Approval Gate',
    category: 'work',
    featured: 'selected',
    description:
      'Known failure classes were eating on-call time not because the fix was hard, but because assembling the context — logs, Terraform state, recent deploys — took twenty minutes at 3 a.m. I built an MCP server that does the gathering and proposes a remediation, and then stops. A human approves or rejects every state-changing action, each one is logged with the reasoning that produced it, and each one is reversible. The agent is allowed to be wrong; it is not allowed to be wrong unsupervised.',
    impact: 'Response time −60%',
    tags: ['Go', 'MCP', 'GCP', 'Terraform', 'On-Call'],
    blogUrl: '/blog/agentic-runbooks-mcp-human-approval',
  },
  {
    title: 'Ephemeral Per-User Sandboxes on AWS',
    category: 'work',
    featured: 'selected',
    description:
      '80+ trainees each needed a production-like n8n environment, and a fixed t3.medium per person was both wasteful and, at cohort scale, expensive. The workloads are bursty by nature — idle for hours, then a spike — so I put them on burstable instances sized for the median rather than the peak, and wrote lifecycle automation that stops and reclaims anything idle past a threshold. Everyone gets a real isolated environment; compute costs about half of the fixed-size equivalent.',
    impact: '80+ envs, spend −50%',
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
    title: 'Emavi',
    category: 'product',
    featured: true,
    description:
      'Barrier-free multi-tenant PWA for assisted-living facilities. Residents log daily mood; staff see well-being trends and generate reports. Web Push, containerised. Shipped as HepaAssist, now runs as Emavi.',
    impact: 'Case study',
    tags: ['Next.js', 'Django', 'Docker', 'PWA', 'PostgreSQL'],
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
    title: 'Standly',
    category: 'product',
    description:
      'AI trade-fair-stand designer SaaS for exhibition builders: prompt/RFQ → buildable, editable, quotable 3D booth. Parametric catalog core with diffusion hero-renders, RFQ → BOM → quote workflow.',
    impact: 'In development',
    tags: ['SaaS', 'AI', '3D', 'Monorepo', 'TypeScript'],
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
    title: 'n8n Workflow Workspace',
    category: 'product',
    description:
      'Versioned workspace for n8n automations — personal and per-client. Strict client separation via tags and name prefixes, secrets kept out of git, template-driven onboarding.',
    impact: 'Client automation',
    tags: ['n8n', 'Automation', 'Workflows'],
  },

  // ── Recent (portfolio / learning projects) ──────────────────────
  {
    title: 'Conduit Pipeline & Container',
    category: 'recent',
    description:
      'GitHub Actions pipeline that clones, builds Docker images and deploys via Docker Compose to a remote server — plus the Compose setup for an Angular frontend with a Django backend.',
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
    title: 'Baby Tools Shop',
    category: 'recent',
    description:
      'Django e-commerce store for baby tools, containerised with Docker and deployed to a VM.',
    tags: ['Django', 'Docker', 'E-Commerce'],
    githubUrl: 'https://github.com/PascalNehlsen/baby-tools-shop',
    docsUrl: '/docs/projects/recent/baby-tools-shop',
  },
  {
    title: 'WordPress Container',
    category: 'recent',
    description:
      'Docker Compose setup for launching a WordPress instance backed by MariaDB — reproducible setup and maintenance.',
    tags: ['Docker Compose', 'WordPress', 'MariaDB'],
    githubUrl: 'https://github.com/PascalNehlsen/wordpress-container',
    docsUrl: '/docs/projects/recent/wordpress',
  },
  {
    title: 'Minecraft Server',
    category: 'recent',
    description:
      'Customizable Minecraft server via Docker Compose, deployable locally or to a VM with minimal effort.',
    tags: ['Docker Compose', 'Self-Hosting'],
    githubUrl: 'https://github.com/PascalNehlsen/minecraft-server',
    docsUrl: '/docs/projects/recent/minecraft',
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
      'Pentesting tools in Python — network scanning, password cracking and exploitation scripts for ethical hacking and security testing.',
    tags: ['Python', 'Pentesting', 'Security'],
    githubUrl: 'https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/',
    docsUrl: '/docs/projects/recent/python-tools/intro',
  },
  {
    title: 'OWASP Juice Shop Challenges',
    category: 'recent',
    description:
      'Documented OWASP Juice Shop challenges — hands-on identification and mitigation of common web vulnerabilities in a safe environment.',
    tags: ['OWASP', 'Web Security', 'CTF'],
    githubUrl: 'https://github.com/PascalNehlsen/juice-shop-challenges',
    docsUrl: '/docs/projects/recent/juice-shop/intro',
  },
];

export default projects;
