import { useEffect, useMemo, useRef } from 'react';
import type { JSONContent } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

type Props = {
  initialDoc: JSONContent;
  onUserUpdate: (doc: JSONContent) => void;
  externalDoc: JSONContent | null; // parent sets this when Markdown side changes
};

export default function TiptapPane({ initialDoc, onUserUpdate, externalDoc }: Props) {
  const isApplyingExternal = useRef(false);

  const extensions = useMemo(() => [
    StarterKit,
    Link.configure({ openOnClick: false }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
  ], []);

  const editor = useEditor({
    extensions,
    content: initialDoc,
    onUpdate: ({ editor }) => {
      if (isApplyingExternal.current) return; // ignore programmatic updates
      onUserUpdate(editor.getJSON());
    },
  });

  // When parent pushes new content from Markdown → set it without emitting update
  useEffect(() => {
    if (!editor || !externalDoc) return;
    isApplyingExternal.current = true;
    editor.commands.setContent(externalDoc, false);
    // release guard next tick
    setTimeout(() => { isApplyingExternal.current = false; }, 0);
  }, [externalDoc, editor]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', fontSize: 12, color: '#6b7280' }}>
        Tiptap (right) — edit here too
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {editor && <EditorContent editor={editor} />}
      </div>
    </div>
  );
}