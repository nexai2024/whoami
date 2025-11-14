'use client';

import { useEffect } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import classNames from 'classnames';

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  minHeight?: number;
}

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder,
  className,
  readOnly = false,
  minHeight = 160,
}: RichTextEditorProps) {
  const editor = useEditor({
    editable: !readOnly,
    content: value || '',
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    editorProps: {
      attributes: {
        class: classNames(
          'prose max-w-none focus:outline-none',
          'px-3 py-2',
          readOnly ? 'bg-gray-50 text-gray-700' : 'bg-white text-gray-800',
          'leading-relaxed'
        ),
        style: `min-height: ${minHeight}px;`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html === '<p></p>' ? '' : html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || '';
    if (current !== next) {
      editor.commands.setContent(next || '', { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return (
      <div
        className={classNames(
          'border border-gray-300 rounded-lg bg-gray-50 animate-pulse',
          className
        )}
        style={{ minHeight }}
      />
    );
  }

  const toggleHeading = (level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const setParagraph = () => {
    editor.chain().focus().setParagraph().run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl || '');
    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const clearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  const toolbarButton = (
    label: ReactNode,
    action: () => void,
    isActive?: boolean,
    title?: string
  ) => {
    const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      action();
    };

    return (
      <button
        type="button"
        onMouseDown={handleMouseDown}
        className={classNames(
          'px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors',
          isActive ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
        )}
        aria-pressed={isActive}
        title={title}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={classNames(
        'border border-gray-300 rounded-lg bg-white',
        readOnly && 'bg-gray-50',
        className
      )}
    >
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 px-2 py-1 bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-1">
            {toolbarButton(
              'H1',
              () => toggleHeading(1),
              editor.isActive('heading', { level: 1 })
            )}
            {toolbarButton(
              'H2',
              () => toggleHeading(2),
              editor.isActive('heading', { level: 2 })
            )}
            {toolbarButton(
              'H3',
              () => toggleHeading(3),
              editor.isActive('heading', { level: 3 })
            )}
            {toolbarButton(
              'P',
              setParagraph,
              editor.isActive('paragraph') && !editor.isActive('heading')
            )}
          </div>
          <span className="mx-1 h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-1">
            {toolbarButton(
              <strong>B</strong>,
              () => editor.chain().focus().toggleBold().run(),
              editor.isActive('bold')
            )}
            {toolbarButton(
              <em>I</em>,
              () => editor.chain().focus().toggleItalic().run(),
              editor.isActive('italic')
            )}
            {toolbarButton(
              <span className="underline">U</span>,
              () => editor.chain().focus().toggleUnderline().run(),
              editor.isActive('underline')
            )}
          </div>
          <span className="mx-1 h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-1">
            {toolbarButton(
              '• List',
              () => editor.chain().focus().toggleBulletList().run(),
              editor.isActive('bulletList')
            )}
            {toolbarButton(
              '1. List',
              () => editor.chain().focus().toggleOrderedList().run(),
              editor.isActive('orderedList')
            )}
          </div>
          <span className="mx-1 h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-1">
            {toolbarButton(
              'Left',
              () => editor.chain().focus().setTextAlign('left').run(),
              editor.isActive({ textAlign: 'left' })
            )}
            {toolbarButton(
              'Center',
              () => editor.chain().focus().setTextAlign('center').run(),
              editor.isActive({ textAlign: 'center' })
            )}
            {toolbarButton(
              'Right',
              () => editor.chain().focus().setTextAlign('right').run(),
              editor.isActive({ textAlign: 'right' })
            )}
          </div>
          <span className="mx-1 h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-1">
            {toolbarButton('Link', setLink, editor.isActive('link'))}
            {toolbarButton('Clear', clearFormatting)}
          </div>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

