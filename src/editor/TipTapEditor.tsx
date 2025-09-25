import { useCallback } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

export default function TipTapEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: `
      <h2>👋 Hello Tiptap</h2>
      <p>Try <strong>bold</strong>, <em>italic</em>, <code>inline code</code>, links, lists, tasks, and tables.</p>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false"><p>Todo item</p></li>
        <li data-type="taskItem" data-checked="true"><p>Done item</p></li>
      </ul>
      <p>Click “Insert Table” to add a 3×3 table.</p>
    `,
  });

  const promptForLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | null;
    const url = window.prompt('URL', previousUrl ?? 'https://');
    if (url === null) return; // cancelled
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="editor-wrap">
      {/* Tiny toolbar just to prove things work */}
      <div className="toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Bold">
          Bold
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Italic">
          Italic
        </button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} aria-label="Strike">
          Strike
        </button>
        <button onClick={() => editor.chain().focus().toggleCode().run()} aria-label="Code">
          Code
        </button>

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>

        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </button>
        <button onClick={() => editor.chain().focus().toggleTaskList().run()}>
          ☑ Task List
        </button>

        <button onClick={promptForLink}>Link</button>
        <button onClick={() => editor.chain().focus().unsetLink().run()}>Unlink</button>

        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          Insert Table
        </button>
        <button onClick={() => editor.chain().focus().addColumnAfter().run()}>
          + Col
        </button>
        <button onClick={() => editor.chain().focus().addRowAfter().run()}>
          + Row
        </button>
      </div>

      <div className="editor-surface">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}