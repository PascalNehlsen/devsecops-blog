/**
 * Generates Open Graph images into static/img/og/.
 *
 * Run manually: `npm run og`. Output is committed.
 *
 * Why not a build-time plugin: these assets change maybe twice a month, and
 * a plugin would spend CI minutes regenerating them on every push. Why not
 * Vercel OG or a Worker: this is a static site on GitHub Pages, there is no
 * runtime. Why not a design tool: fourteen images that must be reopened by
 * hand every time a title changes will drift within two months.
 *
 * Fonts are read from static/fonts/, the same files the site serves, so the
 * cards use the site's actual typefaces.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import matter from 'gray-matter';
import { decompress } from 'wawoff2';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONT_DIR = join(ROOT, 'static/fonts');
const OUT_DIR = join(ROOT, 'static/img/og');

// Straight from src/css/tokens.css. If the palette changes there, change it
// here. These cards are the site's face in every share.
const C = {
  bg: '#020617',
  surface: '#0E1223',
  border: '#1E293B',
  text: '#F8FAFC',
  muted: '#94A3B8',
  dim: '#64748B',
  accent: '#22C55E',
};

// satori cannot read woff2, and the site only ships woff2. Rather than
// vendoring a second set of TTFs that nothing else uses, decompress the
// served files in memory, so the cards provably use the same outlines
// the site does.
async function ttf(file) {
  return Buffer.from(await decompress(readFileSync(join(FONT_DIR, file))));
}

const fonts = [
  {
    name: 'JetBrains Mono',
    data: await ttf('jetbrains-mono-latin-700-normal.woff2'),
    weight: 700,
    style: 'normal',
  },
  {
    name: 'JetBrains Mono',
    data: await ttf('jetbrains-mono-latin-400-normal.woff2'),
    weight: 400,
    style: 'normal',
  },
  {
    name: 'IBM Plex Sans',
    data: await ttf('ibm-plex-sans-latin-400-normal.woff2'),
    weight: 400,
    style: 'normal',
  },
];

/** The card. One flat accent rule on top, no gradient, matching the site. */
function card({ title, description, tags = [] }) {
  return {
    type: 'div',
    props: {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        background: C.bg,
        borderTop: `6px solid ${C.accent}`,
        padding: 64,
        fontFamily: 'IBM Plex Sans',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontFamily: 'JetBrains Mono',
              fontSize: 28,
              color: C.accent,
              marginBottom: 40,
            },
            children: '$ _',
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontFamily: 'JetBrains Mono',
              fontWeight: 700,
              fontSize: title.length > 60 ? 52 : 60,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: C.text,
              flex: 1,
            },
            children: title,
          },
        },
        description
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontSize: 26,
                  lineHeight: 1.4,
                  color: C.muted,
                  marginTop: 16,
                  marginBottom: 24,
                },
                children:
                  description.length > 150
                    ? `${description.slice(0, 147)}…`
                    : description,
              },
            }
          : null,
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: `1px solid ${C.border}`,
              paddingTop: 24,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 22,
                    color: C.dim,
                  },
                  children: 'pascal-nehlsen.de',
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: 12 },
                  children: tags.slice(0, 3).map((tag) => ({
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        fontFamily: 'JetBrains Mono',
                        fontSize: 18,
                        color: C.accent,
                        border: `1px solid ${C.accent}`,
                        borderRadius: 2,
                        padding: '4px 12px',
                      },
                      children: String(tag),
                    },
                  })),
                },
              },
            ],
          },
        },
      ].filter(Boolean),
    },
  };
}

async function render(spec, outFile) {
  const svg = await satori(card(spec), { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  })
    .render()
    .asPng();
  writeFileSync(join(OUT_DIR, outFile), png);
  console.log(`  ${outFile}`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log('Generating OG images:');

  await render(
    {
      title: 'Pascal Nehlsen',
      description:
        'Platform and security engineering. Terraform golden paths on GCP, SLO-gated deploys, agentic runbooks with human approval.',
      tags: ['platform', 'security'],
    },
    'default.png'
  );

  const blogDir = join(ROOT, 'blog');
  const posts = readdirSync(blogDir).filter(
    (f) => f.endsWith('.md') || f.endsWith('.mdx')
  );

  for (const file of posts) {
    const { data } = matter(readFileSync(join(blogDir, file), 'utf8'));
    if (!data.title) continue;
    const slug = data.slug || basename(file).replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.mdx?$/, '');
    await render(
      {
        title: data.title,
        description: data.description ?? '',
        tags: Array.isArray(data.tags) ? data.tags : [],
      },
      `${slug}.png`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
