TipTap ↔ Markdown Converter (React + TypeScript)

Live demo: <ADD_DEPLOY_URL_HERE>
Repo: <THIS_REPO_URL>

A small, modular system that converts Markdown ⇄ TipTap JSON using a plugin registry. Built with React + Vite + TypeScript, TipTap, and remark/unified. The demo shows two editors side‑by‑side: a Markdown textarea and a live TipTap editor. Changing either side syncs the other via one‑way pipelines.

⸻

✨ Highlights
	•	Plugin‑based architecture: each Markdown feature (heading, bold, table…) is one file.
	•	Two one‑way pipelines with clear responsibilities:
	•	Markdown → remark AST → TipTap JSON → TipTap UI
	•	TipTap JSON → remark AST → Markdown text
	•	Round‑trip sanity: normalized Markdown style on the way out.
	•	DX helpers: dev panel to toggle plugins and view AST/JSON.

⸻

🧱 Stack
	•	React + Vite + TypeScript
	•	TipTap: @tiptap/react, @tiptap/starter-kit, plus extensions for link, table, task list
	•	Markdown engine: unified, remark-parse, remark-gfm, remark-stringify
	•	Tests: Vitest (or Jest)

⸻

🧭 How it works (architecture)

flowchart LR
  subgraph Left[Markdown side]
    A[Markdown text] --> B[remark-parse + remark-gfm]\n(AST)
    B --> C[md→TT converter]\n(plugin registry)
  end
  C --> D[Tiptap JSON]
  D --> E[<EditorContent />]

  subgraph Right[Tiptap side]
    E --> F[TT→md converter]\n(plugin registry)
    F --> G[remark AST]
    G --> H[remark-stringify]\n(Markdown text)
  end

Each feature plugin implements a tiny interface (name, supportsMd, toTiptap, fromTiptap, optional priority). Converters walk nodes and ask the registry which plugin can handle them.

⸻

📁 Project structure (suggested)

src/
  app/
    App.tsx
    main.tsx
  markdown-core/
    registry.ts
    md-to-tiptap.ts
    tiptap-to-md.ts
    walkers.ts
    types.ts
    plugins/
      bold.ts
      italic.ts
      strike.ts
      link.ts
      heading.ts
      text.ts
      list/
        bullet-list.ts
        ordered-list.ts
        list-item.ts
      code/
        code-inline.ts
        code-block.ts
      blockquote.ts
      table/
        table.ts
        table-row.ts
        table-cell.ts
        table-header.ts
      task/
        task-list.ts
        task-item.ts
  components/
    MarkdownPane.tsx
    TiptapPane.tsx
    DevPanel.tsx
  lib/
    debounce.ts


⸻

🚀 Getting started

Prerequisites
	•	Node 18+ (node -v)
	•	npm or pnpm or yarn

Install & run

# install deps
npm i

# start dev server (http://localhost:5173 by default)
npm run dev

# build production bundle into /dist
npm run build

# preview the built bundle locally
npm run preview

If you use absolute imports like @/…, make sure tsconfig.json has:

{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": { "@/*": ["src/*"] }
  }
}



⸻

🔌 Plugin interface (the heart of modularity)

Contract (TypeScript sketch):

export interface MdToTiptapPlugin {
  name: string
  // Does this plugin handle this remark AST node?
  supportsMd(node: MdNode): boolean
  // Convert remark node → TipTap JSON node/mark (or array)
  toTiptap(node: MdNode, ctx: Ctx): TiptapNode | TiptapNode[] | null
  // Convert TipTap node/mark → remark AST node
  fromTiptap(node: TiptapNode, ctx: Ctx): MdNode | MdNode[] | null
  // Optional ordering if two plugins overlap
  priority?: number
}

Minimal template to create a new feature plugin

// src/markdown-core/plugins/<feature>.ts
import { MdToTiptapPlugin } from "@/markdown-core/types"

export const FeaturePlugin: MdToTiptapPlugin = {
  name: "feature",
  supportsMd(node) {
    // example: return node.type === 'strong'  (for bold)
    return false
  },
  toTiptap(node, ctx) {
    // return TipTap JSON for this markdown node
    return null
  },
  fromTiptap(node, ctx) {
    // return remark AST for this TipTap node
    return null
  },
  priority: 0,
}

// then register it in src/markdown-core/registry.ts


⸻

🔁 Normalization choices (Markdown style)

We standardize on:
	•	Italic: *text* (not _text_)
	•	Bold: **text**
	•	Code fences: triple backticks ```
	•	Task list: - [ ] and - [x]
	•	Tables: GFM pipe tables with a header row

This ensures stable outputs even if inputs vary.

⸻

🧪 Tests

Write 3 small tests per plugin:
	1.	Markdown → TipTap: structure expectations of produced TipTap JSON
	2.	TipTap → Markdown: string expectations (normalized)
	3.	Round‑trip: md → tiptap → md' is equivalent or exactly equal post‑normalization

Run tests:

npm run test


⸻

🧰 Dev panel (optional but helpful)
	•	Toggle individual plugins on/off
	•	Show the current remark AST and TipTap JSON in a read‑only pane
	•	Log a warning when a node has no claiming plugin

⸻

🔧 Scripts (package.json)

Typical scripts:

{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview --port 4173",
    "test": "vitest"
  }
}


⸻

📦 Deployment

Choose one of the hosts below. All of them serve the static output from /dist.

Option A — Vercel (recommended for speed)
	1.	Push your repo to GitHub.
	2.	Go to vercel.com → Add New… → Project → Import GitHub Repo.
	3.	Framework preset: Vite. Build command: npm run build. Output: dist.
	4.	Click Deploy. Copy the URL and paste it at the top of this README.

Optional vercel.json (SPA fallback & clean URLs):

{
  "cleanUrls": true,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}

Option B — Netlify
	1.	Push your repo to GitHub.
	2.	Go to app.netlify.com → Add new site → Import an existing project.
	3.	Build command: npm run build. Publish directory: dist.
	4.	Deploy. Copy the URL and paste it at the top.

netlify.toml:

[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# SPA fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

Option C — GitHub Pages (via GitHub Actions)
	1.	If using a project site (no custom domain), set Vite base path:
	•	vite.config.ts:

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // change <REPO_NAME>
  base: '/<REPO_NAME>/'
})

	2.	Commit the workflow below at .github/workflows/deploy.yml:

name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4

	3.	In Repo → Settings → Pages: set Source = GitHub Actions. Wait for the workflow to turn green.
	4.	Your site will be available at https://<username>.github.io/<REPO_NAME>/.

Tip: In index.html, use %BASE_URL% for the root of assets so it works with a non‑root base path (Vite does this by default when using base).

⸻

🧩 How to add a new plugin (step‑by‑step)
	1.	Create a file in src/markdown-core/plugins/your-feature.ts from the template above.
	2.	Implement supportsMd to return true for the remark node(s) you want.
	3.	Implement toTiptap to return a valid TipTap JSON node or mark.
	4.	Implement fromTiptap to return the matching remark AST node.
	5.	Register it in src/markdown-core/registry.ts (add to plugins[]).
	6.	Test with three specs (md→tt, tt→md, round‑trip).
	7.	Try it in the demo (type the syntax on the Markdown side and see it render on the TipTap side).

⸻

✅ Submission checklist
	•	Public repo link
	•	Live demo link (Vercel/Netlify/GitHub Pages)
	•	README updated (stack, architecture, how to add a plugin, how to run, tests)
	•	All required features implemented as plugins (headings, bold, italic, inline code, links, lists, code blocks, blockquote, strike, tables, task lists)
	•	Round‑trip sanity confirmed

⸻

📝 License

MIT (or your choice)

⸻

🙌 Acknowledgements
	•	TipTap team and docs
	•	unified/remark ecosystem
	•	Vite & React communities