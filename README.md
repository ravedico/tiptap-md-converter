# TipTap ↔ Markdown Converter

A custom parser that converts between **Markdown** and **TipTap JSON** using a plugin-based architecture.  
Built with **React + TypeScript + Vite** for the demo UI, and **Remark (unified)** for parsing/serializing Markdown.

---

## 🚀 Framework and Markdown Library Used

- **React (with Vite + TypeScript)** → lightweight, fast dev environment and typed safety.
- **TipTap** → rich text editor framework that works with ProseMirror, extensible with plugins.
- **Remark (unified ecosystem)**:
  - `remark-parse` → converts Markdown text into an AST (Abstract Syntax Tree).
  - `remark-gfm` → GitHub Flavored Markdown (tables, task lists, strikethrough).
  - `remark-stringify` → serializes AST back into Markdown text.

Why this stack?  
Remark provides a **structured AST pipeline** that’s easy to walk and extend, while Tiptap gives us a **rich, modular editor**. Combined with a plugin registry, it allows simple “round-trip” conversions (Markdown ↔ TipTap JSON).

---

## 🏗️ Architecture Explanation

The system is built around **two one-way pipelines**:

### Key pieces:
- **Plugin Interface**: each feature (bold, italic, heading, list, etc.) is its own module with functions:
  - `supportsMd(node)` → does this plugin handle a given Markdown AST node?
  - `toTiptap(node, ctx)` → convert Markdown AST node → TipTap JSON.
  - `fromTiptap(node, ctx)` → convert TipTap JSON → Markdown AST node.
- **Registry (`registry.ts`)**: central list of all plugins.  
  Converters loop through the registry and ask: *“Who supports this node?”*
- **Converters**:
  - `mdToTiptap(markdown: string): TiptapDoc`
  - `tiptapToMd(doc: TiptapDoc): string`

This ensures the **core stays dumb**: no Markdown-specific logic inside the converter, only inside plugins.

---

## ➕ How to Add a New Plugin

Adding support for a new Markdown feature is simple:

1. **Create a file** in `src/markdown-core/plugins/` (e.g., `underline.ts`).
2. Implement the plugin interface:

   ```ts
   import { MdNode, TiptapNode } from '../types';
   import { Plugin } from '../types';

   export const underlinePlugin: Plugin = {
     name: 'underline',

     supportsMd(node) {
       return node.type === 'underline'; // adjust to real AST type
     },

     toTiptap(node, ctx) {
       return {
         type: 'text',
         marks: [{ type: 'underline' }],
         text: node.value,
       };
     },

     fromTiptap(node, ctx) {
       return {
         type: 'underline',
         value: node.text ?? '',
       };
     },
   };
   ```

3. **Register the plugin** by adding it to the plugin registry in `src/markdown-core/registry.ts`:

   ```ts
   import { underlinePlugin } from './plugins/underline';

   export const plugins = [
     // ...other plugins
     underlinePlugin,
   ];
   ```

4. **Test your plugin** by running the existing test suite or adding new tests:

   - Add unit tests for your plugin's `supportsMd`, `toTiptap`, and `fromTiptap` functions.
   - Run all tests with `npm test` or `yarn test` to ensure everything works as expected.

---

## 🛠️ Development

To get started with local development:

1. Clone the repository:

   ```bash
   git clone https://github.com/ravedico/tiptap-md-converter.git
   cd tiptap-md-converter
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   This will start the Vite-powered React app where you can test the converter UI.

4. Run tests:

   ```bash
   npm test
   # or
   yarn test
   ```

---

## 🚀 Deployment

This project can be deployed easily to various static hosting providers:

### Vercel

- Connect your GitHub repository to Vercel.
- Vercel will automatically detect the project and use the default build command:
  
  ```bash
  npm run build
  ```
  
- The output directory is `dist` by default for Vite.

### Netlify

- Connect your repo to Netlify.
- Set the build command to:

  ```bash
  npm run build
  ```

- Set the publish directory to:

  ```
  dist
  ```

### GitHub Pages

- Build the project locally:

  ```bash
  npm run build
  ```

- Commit and push the contents of the `dist` folder to the `gh-pages` branch.
- Configure GitHub Pages in repository settings to serve from the `gh-pages` branch.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).  
Feel free to use, modify, and distribute it as you wish.