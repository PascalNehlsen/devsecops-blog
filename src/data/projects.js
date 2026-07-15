// Central project registry powering the homepage showcase.
// Edit this file to add / update / reorder projects — the homepage reads from here.
//
// category: 'work' | 'product' | 'recent'
// featured: bring the card into the top "Featured Work" grid
// Omit githubUrl for private repositories (only live/docs links render).

const projects = [
  // ── Work (Developer Akademie GmbH) ──────────────────────────────
  {
    title: 'Self-Service Cloud Platform',
    category: 'work',
    featured: true,
    description:
      'Full Terraform modularisation of a GCP environment (Cloud Run, Cloud SQL, GCS, IAM) with golden-path workflows, guardrails and automated test gates. Provisioning time cut from ~4h to under 45min.',
    impact: 'Provisioning time −80%',
    tags: ['Terraform', 'GCP', 'GitOps', 'Argo CD', 'IAM'],
  },
  {
    title: 'Agentic DevOps Runbook Automation',
    category: 'work',
    featured: true,
    description:
      'Secure runbook executor with a human-approval layer: an MCP-based remote server integrating GitHub, GCP Cloud Run/Logging and Terraform state. Every critical action is auditable, reversible and requires explicit approval.',
    impact: 'Incident response −60%',
    tags: ['Go', 'Python', 'MCP', 'GCP'],
  },
  {
    title: 'Security Pipeline Integration',
    category: 'work',
    featured: true,
    description:
      'SAST (Bandit, Semgrep) and DAST (OWASP ZAP) integrated into GitHub Actions with Docker image hardening before deployment. Automated rollback trigger on SLO breach cut the deployment error rate below 2%.',
    impact: 'Deploy error rate <2%',
    tags: ['GitHub Actions', 'SAST/DAST', 'Docker', 'OWASP ZAP'],
  },

  {
    title: 'Per-Student Cloud Sandboxes on AWS',
    category: 'work',
    featured: true,
    description:
      'Provisioned isolated, production-like n8n automation sandboxes on AWS burstable EC2 (t3/t4g) with automated lifecycle management — giving 80+ trainees their own environment while keeping compute costs 50% below fixed-size instances.',
    impact: 'Compute cost −50%',
    tags: ['AWS', 'EC2', 'Terraform', 'n8n', 'Automation'],
  },

  // ── Products (private) ──────────────────────────────────────────
  {
    title: 'HepaAssist',
    category: 'product',
    featured: true,
    description:
      'Barrier-free Progressive Web App for assisted-living facilities. Residents track daily mood; staff monitor well-being trends and generate reports. Multi-tenant, Web-Push, containerised.',
    impact: 'Case study',
    tags: ['Next.js', 'Django', 'Docker', 'PWA', 'PostgreSQL'],
    docsUrl: '/docs/projects/hepa-assist',
  },
  {
    title: 'AI Chatbot Platform',
    category: 'product',
    featured: true,
    description:
      'Production-ready, multi-tenant AI chatbot platform with appointment-booking. Configurable per client, embeddable widget, integrated into this site (bottom-right corner).',
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
