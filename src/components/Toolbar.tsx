import type { Editor } from "@tiptap/react";
import type { Level } from '@tiptap/extension-heading';

export function Toolbar({ editor }: { editor: Editor }) {
  // Run a command against the editor, focusing first
  const run = (fn: () => boolean) => {
    if (!editor) return;
    fn();
  };

  const withFocus = () => editor.chain().focus();

  const setLink = () => {
    const previous = (editor.getAttributes("link") as { href?: string })?.href ?? "";
    const url = window.prompt("Enter URL", previous);
    if (url === null) return; // cancel
    if (url === "") {
      run(() => withFocus().extendMarkRange("link").unsetLink().run());
    } else {
      run(() => withFocus().extendMarkRange("link").setLink({ href: url }).run());
    }
  };

  return (
    <div className="toolbar">
      <button
        aria-label="Bold"
        onClick={() => run(() => withFocus().toggleBold().run())}
        className={editor.isActive("bold") ? "active" : ""}
      >
        B
      </button>

      <button
        aria-label="Italic"
        onClick={() => run(() => withFocus().toggleItalic().run())}
        className={editor.isActive("italic") ? "active" : ""}
      >
        I
      </button>

      <button
        aria-label="Strike"
        onClick={() => run(() => withFocus().toggleStrike().run())}
        className={editor.isActive("strike") ? "active" : ""}
      >
        S
      </button>

      <button
        aria-label="Inline code"
        onClick={() => run(() => withFocus().toggleCode().run())}
        className={editor.isActive("code") ? "active" : ""}
      >
        {"</>"}
      </button>

      {/* Headings */}
      <select
        aria-label="Heading level"
        value={
          [1, 2, 3, 4, 5, 6].find((lvl) => editor.isActive("heading", { level: lvl }))
            ? String(
                [1, 2, 3, 4, 5, 6].find((lvl) => editor.isActive("heading", { level: lvl }))
              )
            : "p"
        }
        onChange={(e) => {
          const v = e.target.value;
          if (v === "p") {
            run(() => withFocus().setParagraph().run());
          } else {
            const level = Number(v) as Level;
            run(() => withFocus().toggleHeading({ level }).run());
          }
        }}
      >
        <option value="p">Paragraph</option>
        <option value="1">H1</option>
        <option value="2">H2</option>
        <option value="3">H3</option>
        <option value="4">H4</option>
        <option value="5">H5</option>
        <option value="6">H6</option>
      </select>

      {/* Lists */}
      <button
        aria-label="Bullet list"
        onClick={() => run(() => withFocus().toggleBulletList().run())}
        className={editor.isActive("bulletList") ? "active" : ""}
      >
        ••
      </button>
      <button
        aria-label="Ordered list"
        onClick={() => run(() => withFocus().toggleOrderedList().run())}
        className={editor.isActive("orderedList") ? "active" : ""}
      >
        1.
      </button>

      {/* Quote / Code block */}
      <button
        aria-label="Blockquote"
        onClick={() => run(() => withFocus().toggleBlockquote().run())}
        className={editor.isActive("blockquote") ? "active" : ""}
      >
        “”
      </button>
      <button
        aria-label="Code block"
        onClick={() => run(() => withFocus().toggleCodeBlock().run())}
        className={editor.isActive("codeBlock") ? "active" : ""}
      >
        {`{}`}
      </button>

      {/* Task list requires TaskList/TaskItem extensions */}
      <button
        aria-label="Task list"
        onClick={() => run(() => withFocus().toggleTaskList().run())}
        className={editor.isActive("taskList") ? "active" : ""}
      >
        ☑
      </button>

      {/* Link */}
      <button aria-label="Link" onClick={setLink}>
        🔗
      </button>

      {/* Simple table insert */}
      <button
        aria-label="Insert table"
        onClick={() =>
          run(() =>
            withFocus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          )
        }
      >
        ⌗
      </button>
    </div>
  );
}