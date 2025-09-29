import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';

import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';

import { mdToTiptap } from '@/markdown-core/md-to-tiptap';
import { tiptapToMd } from '@/markdown-core/tiptap-to-md';
import './app.css';

import type { JSONContent, Content, Editor as TTEditor } from '@tiptap/core';

const INITIAL_MD = `# h1 Heading
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading

**This is bold text**
*This is italic text*
~~Strikethrough~~


### Blockquotes

> Blockquotes can also be nested...


### Lists

Unordered

* Ac tristique libero volutpat at
* Ac tristique libero volutpat at
* Ac tristique libero volutpat at
* Ac tristique libero volutpat at

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa

Task list
- [ ] Mercury
- [x] Venus
- [x] Earth (Orbit/Moon)
- [x] Mars
- [ ] Jupiter
- [ ] Saturn
- [ ] Uranus
- [ ] Neptune
- [ ] Comet Haley

### Tables

| Left columns  | Right columns |
| ------------- |---------------|
| left foo      | right foo     |
| left bar      | right bar     |
| left baz      | right baz     |


`
;

type TiptapDoc = JSONContent;


export default function App() {
  const lastChange = useRef<'md' | 'tt' | null>(null);
  const settingFromMd = useRef(false);

  // Left: Markdown text
  const [markdown, setMarkdown] = useState<string>(INITIAL_MD);

  // Right: toggle between tiptap / JSON
  const [viewMode, setViewMode] = useState<'tiptap' | 'json'>('tiptap');

  // Middle (now inside the same right pane): editable JSON text
  const [jsonView, setJsonView] = useState<string>(
    JSON.stringify(mdToTiptap(INITIAL_MD) as JSONContent, null, 2)
  );

  // Extensions
  const extensions = useMemo(
    () => [
      StarterKit,
      Link.configure({
        openOnClick: true,
        autolink: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: 'tiptap-table' },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: 'Type “/” for commands…',
        showOnlyWhenEditable: true,
        includeChildren: true,
      }),
    ],
    []
  );

  // Markdown → Tiptap JSON
  const convertMdToDoc = useCallback((md: string): TiptapDoc => {
    try {
      return mdToTiptap(md) as JSONContent;
    } catch {
      return { type: 'doc', content: [] };
    }
  }, []);

  // Editor
  const editor = useEditor({
    extensions,
    content: convertMdToDoc(INITIAL_MD),
    autofocus: false,
    editable: true,
    editorProps: {
      attributes: {
        class: 'tiptap-surface',
      },
    },
    onUpdate: ({ editor: view }: { editor: TTEditor }) => {
      if (settingFromMd.current) return;
      lastChange.current = 'tt';
      const json: TiptapDoc = view.getJSON();
      setJsonView(JSON.stringify(json, null, 2));
      const nextMd = tiptapToMd(json as Parameters<typeof tiptapToMd>[0]);
      setMarkdown(nextMd);
    },
  });

  // When Markdown changes, push to editor + JSON
  useEffect(() => {
    if (!editor) return;
    if (lastChange.current === 'tt') {
      lastChange.current = null;
      return;
    }
    lastChange.current = 'md';
    settingFromMd.current = true;

    const doc = convertMdToDoc(markdown);
    editor.commands.setContent(doc as Content);
    setJsonView(JSON.stringify(doc, null, 2));

    const t = setTimeout(() => {
      settingFromMd.current = false;
    }, 0);
    return () => clearTimeout(t);
  }, [markdown, editor, convertMdToDoc]);

  // JSON textarea → Tiptap + Markdown
  const onJsonChange = (raw: string) => {
    setJsonView(raw);
    try {
      const parsed = JSON.parse(raw) as TiptapDoc;
      lastChange.current = 'tt';
      settingFromMd.current = true;
      editor?.commands.setContent(parsed as Content);
      const nextMd = tiptapToMd(parsed as Parameters<typeof tiptapToMd>[0]);
      setMarkdown(nextMd);
      setTimeout(() => {
        settingFromMd.current = false;
      }, 0);
    } catch {
      // ignore until valid JSON
    }
  };

  // Toolbar helpers
  const withFocus = () => (editor ? editor.chain().focus() : null);

  const toggleBold = () => withFocus()?.toggleBold().run();
  const toggleItalic = () => withFocus()?.toggleItalic().run();
  const toggleStrike = () => withFocus()?.toggleStrike().run();
  const toggleCode = () => withFocus()?.toggleCode().run();
  const setH1 = () => withFocus()?.setHeading({ level: 1 }).run();
  const setH2 = () => withFocus()?.setHeading({ level: 2 }).run();
  const setH3 = () => withFocus()?.setHeading({ level: 3 }).run();
  const setH4 = () => withFocus()?.setHeading({ level: 4 }).run();
  const setH5 = () => withFocus()?.setHeading({ level: 5 }).run();
  const setH6 = () => withFocus()?.setHeading({ level: 6 }).run();
  const bulletList = () => withFocus()?.toggleBulletList().run();
  const orderedList = () => withFocus()?.toggleOrderedList().run();
  const taskList = () => withFocus()?.toggleTaskList().run();
  const blockquote = () => withFocus()?.toggleBlockquote().run();
  const codeBlock = () => withFocus()?.toggleCodeBlock().run();
  const addTable = () =>
    withFocus()?.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (!url) return;
    withFocus()?.setLink({ href: url }).run();
  };
  const unsetLink = () => withFocus()?.unsetLink().run();

  // Table tools
  const addRowBefore = () => withFocus()?.addRowBefore().run();
  const addRowAfter = () => withFocus()?.addRowAfter().run();
  const addColBefore = () => withFocus()?.addColumnBefore().run();
  const addColAfter = () => withFocus()?.addColumnAfter().run();
  const deleteRow = () => withFocus()?.deleteRow().run();
  const deleteCol = () => withFocus()?.deleteColumn().run();
  const deleteTable = () => withFocus()?.deleteTable().run();
  const toggleHeaderRow = () => withFocus()?.toggleHeaderRow().run();
  const mergeOrSplit = () => withFocus()?.mergeOrSplit().run();

  return (
    <div className="app-root">
      {/* Topbar */}
      <div className="topbar">
        <div className="container">
          <div className="brand">TipTap 👉 Markdown Converter</div>

          <div className="buttons-wrap">
            {/* Row 1: Headings + inline formatting */}
            <div className="btn-row">
              <button onClick={setH1} title="H1" aria-label="Heading 1"><i className="ri-h-1" /></button>
              <button onClick={setH2} title="H2" aria-label="Heading 2"><i className="ri-h-2" /></button>
              <button onClick={setH3} title="H3" aria-label="Heading 3"><i className="ri-h-3" /></button>
              <button onClick={setH4} title="H4" aria-label="Heading 4"><i className="ri-h-4" /></button>
              <button onClick={setH5} title="H5" aria-label="Heading 5"><i className="ri-h-5" /></button>
              <button onClick={setH6} title="H6" aria-label="Heading 6"><i className="ri-h-6" /></button>
              <span className="sep" />
              <button onClick={toggleBold} title="Bold" aria-label="Bold"><i className="ri-bold" /></button>
              <button onClick={toggleItalic} title="Italic" aria-label="Italic"><i className="ri-italic" /></button>
              <button onClick={toggleStrike} title="Strikethrough" aria-label="Strikethrough"><i className="ri-strikethrough" /></button>
              <button onClick={toggleCode} title="Inline code" aria-label="Inline code"><i className="ri-code-line" /></button>
              <span className="sep" />
              <button onClick={blockquote} title="Blockquote" aria-label="Blockquote"><i className="ri-double-quotes-l" /></button>
              <button onClick={codeBlock} title="Code block" aria-label="Code block"><i className="ri-code-box-line" /></button>
              <span className="sep" />
              <button onClick={addLink} title="Set link" aria-label="Set link"><i className="ri-link" /></button>
              <button onClick={unsetLink} title="Remove link" aria-label="Remove link"><i className="ri-link-unlink" /></button>
              <span className="sep" />
              <button onClick={bulletList} title="Bullet list" aria-label="Bullet list"><i className="ri-list-unordered" /></button>
              <button onClick={orderedList} title="Ordered list" aria-label="Ordered list"><i className="ri-list-ordered" /></button>
              <button onClick={taskList} title="Task list" aria-label="Task list"><i className="ri-checkbox-line" /></button>
            </div>

            {/* Row 2: Lists + Tables */}
            <div className="btn-row">
              <button onClick={addTable} title="Insert table" aria-label="Insert table"><i className="ri-table-line" />Insert table</button>
              <button onClick={deleteTable} title="Delete table" aria-label="Delete table"><i className="ri-delete-bin-line" />Delete table</button>
              <button onClick={addRowBefore} title="Add row before" aria-label="Add row before"><i className="ri-insert-row-top" />Insert top row</button>
              <button onClick={addRowAfter} title="Add row after" aria-label="Add row after"><i className="ri-insert-row-bottom" />Insert bottom row</button>
              <button onClick={deleteRow} title="Delete row" aria-label="Delete row"><i className="ri-delete-row" />Delete row</button>
              <button onClick={addColBefore} title="Add column before" aria-label="Add column before"><i className="ri-insert-column-left" />Insert left column</button>
              <button onClick={addColAfter} title="Add column after" aria-label="Add column after"><i className="ri-insert-column-right" />Insert right column</button>
              <button onClick={toggleHeaderRow} title="Toggle header row" aria-label="Toggle header row"><i className="ri-layout-top-line" />Insert header row</button>
              <button onClick={deleteCol} title="Delete column" aria-label="Delete column"><i className="ri-delete-column" />Delete column</button>
              <button onClick={mergeOrSplit} title="Merge / split cells" aria-label="Merge or split cells"><i className="ri-shape-line" />Merge cells</button>
            </div>
          </div>
        </div>
      </div>

      {/* Two panes: Markdown | (Tiptap/JSON) */}
      <div className="panes">
        {/* Left: Markdown */}
        <section className="pane">
          <header>Markdown</header>
          <textarea
            className="md-input"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            spellCheck={false}
          />
        </section>

        {/* Right: Combined editor with toggle */}
        <section className="pane pane-tiptap">
          <header>
            <span>Editor</span>
            <div className="toggle">
              <button
                className={viewMode === 'tiptap' ? 'active' : ''}
                onClick={() => setViewMode('tiptap')}
              >
                Tiptap
              </button>
              <button
                className={viewMode === 'json' ? 'active' : ''}
                onClick={() => setViewMode('json')}
              >
                JSON
              </button>
            </div>
          </header>

          {viewMode === 'tiptap' ? (
            <div className="editor-surface">
              {editor && (
                <>
                  <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }} className="bubble-menu">
                    <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''} aria-label="Bold"><i className="ri-bold" /></button>
                    <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''} aria-label="Italic"><i className="ri-italic" /></button>
                    <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''} aria-label="Strikethrough"><i className="ri-strikethrough" /></button>
                    <button onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'is-active' : ''} aria-label="Inline code"><i className="ri-code-line" /></button>
                    <button onClick={() => {
                      const url = window.prompt('Enter URL');
                      if (!url) return;
                      editor.chain().focus().setLink({ href: url }).run();
                    }} aria-label="Link"><i className="ri-link" /></button>
                  </BubbleMenu>

                  <FloatingMenu editor={editor} tippyOptions={{ duration: 150 }} className="floating-menu">
                    <button onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'is-active' : ''} aria-label="Paragraph">P</button>
                    <button onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''} aria-label="Heading 1"><i className="ri-h-1" /></button>
                    <button onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''} aria-label="Heading 2"><i className="ri-h-2" /></button>
                    <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''} aria-label="Bullet list"><i className="ri-list-unordered" /></button>
                    <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''} aria-label="Ordered list"><i className="ri-list-ordered" /></button>
                    <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={editor.isActive('taskList') ? 'is-active' : ''} aria-label="Task list"><i className="ri-checkbox-line" /></button>
                    <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''} aria-label="Blockquote"><i className="ri-double-quotes-l" /></button>
                    <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'is-active' : ''} aria-label="Code block"><i className="ri-code-box-line" /></button>
                    <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={editor.isActive('table') ? 'is-active' : ''} aria-label="Insert table"><i className="ri-table-line" /></button>
                  </FloatingMenu>
                </>
              )}
              <EditorContent editor={editor} />
            </div>
          ) : (
            <textarea
              className="json-input"
              spellCheck={false}
              value={jsonView}
              onChange={(e) => onJsonChange(e.target.value)}
            />
          )}
        </section>
      </div>
    </div>
  );
}