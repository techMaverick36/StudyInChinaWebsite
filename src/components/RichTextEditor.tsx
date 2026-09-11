import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { EditorContent, Node, useEditor, useEditorState } from '@tiptap/react'
import type { Editor, JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  Link,
  Link2Off,
  List,
  ListOrdered,
  Redo2,
  Underline,
  Undo2,
} from 'lucide-react'
import { escapeHtml, toEditorHtml } from '../lib/richText'

/* Editors for the scholarship form in the admin panel, built on Tiptap.

   RichTextField is for paragraphs: bold, italic, underline, lists and links,
   stored as HTML and sanitised again when a public page renders it.

   BulletListField is for majors and requirements. Those are lists in the
   database, used as lists across the site (the Study by subject index, the
   course suggestions on the application form, the "15 to choose from"
   count), so this editor only ever holds one bullet list and hands back an
   array of plain strings. Enter starts a new bullet.

   Both editors own their text while you type and only read `value` again when
   it changes from outside, such as opening a different programme. That is
   what the old text areas got wrong: they rebuilt the text from the saved
   list on every keystroke, so a new empty line or a trailing space was
   removed the moment you typed it. */

const ICON = { size: 16, strokeWidth: 2.25, 'aria-hidden': true } as const

function ToolButton({
  label,
  active,
  disabled,
  onRun,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onRun: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={`rte-btn${active ? ' is-active' : ''}`}
      title={label}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      disabled={disabled}
      /* Keep the text selection when a button is clicked. */
      onMouseDown={(e) => e.preventDefault()}
      onClick={onRun}
    >
      {children}
    </button>
  )
}

function promptForLink(editor: Editor) {
  const previous = (editor.getAttributes('link').href as string | undefined) ?? ''
  const answer = window.prompt('Link address. Leave it empty to remove the link.', previous || 'https://')
  if (answer === null) return
  const href = answer.trim()
  const chain = editor.chain().focus().extendMarkRange('link')
  if (!href || href === 'https://') {
    chain.unsetLink().run()
    return
  }
  chain.setLink({ href: /^(https?:|mailto:|tel:)/i.test(href) ? href : `https://${href}` }).run()
}

const contentAttributes = (label: string, minHeight: number) => ({
  class: 'rte-content',
  role: 'textbox',
  'aria-multiline': 'true',
  'aria-label': label,
  style: `min-height:${minHeight}px`,
})

/* ---------- Paragraph editor ---------- */

interface RichTextFieldProps {
  label: string
  value: string
  onChange: (html: string) => void
  minHeight?: number
}

export function RichTextField({ label, value, onChange, minHeight = 110 }: RichTextFieldProps) {
  const lastEmitted = useRef(value)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
    ],
    content: toEditorHtml(value),
    editorProps: { attributes: contentAttributes(label, minHeight) },
    onUpdate: ({ editor: e }) => {
      const html = e.isEmpty ? '' : e.getHTML()
      lastEmitted.current = html
      onChangeRef.current(html)
    },
  })

  useEffect(() => {
    if (!editor || value === lastEmitted.current) return
    lastEmitted.current = value
    editor.commands.setContent(toEditorHtml(value), { emitUpdate: false })
  }, [editor, value])

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive('bold') ?? false,
      italic: e?.isActive('italic') ?? false,
      underline: e?.isActive('underline') ?? false,
      bulletList: e?.isActive('bulletList') ?? false,
      orderedList: e?.isActive('orderedList') ?? false,
      link: e?.isActive('link') ?? false,
      canUndo: e?.can().undo() ?? false,
      canRedo: e?.can().redo() ?? false,
    }),
  })

  return (
    <div className="rte">
      {editor && state && (
        <div className="rte-toolbar" role="toolbar" aria-label={`${label} formatting`}>
          <ToolButton label="Bold" active={state.bold} onRun={() => editor.chain().focus().toggleBold().run()}>
            <Bold {...ICON} />
          </ToolButton>
          <ToolButton label="Italic" active={state.italic} onRun={() => editor.chain().focus().toggleItalic().run()}>
            <Italic {...ICON} />
          </ToolButton>
          <ToolButton
            label="Underline"
            active={state.underline}
            onRun={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Underline {...ICON} />
          </ToolButton>
          <span className="rte-sep" aria-hidden="true" />
          <ToolButton
            label="Bulleted list"
            active={state.bulletList}
            onRun={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List {...ICON} />
          </ToolButton>
          <ToolButton
            label="Numbered list"
            active={state.orderedList}
            onRun={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered {...ICON} />
          </ToolButton>
          <span className="rte-sep" aria-hidden="true" />
          <ToolButton label={state.link ? 'Edit link' : 'Add link'} active={state.link} onRun={() => promptForLink(editor)}>
            <Link {...ICON} />
          </ToolButton>
          {state.link && (
            <ToolButton
              label="Remove link"
              onRun={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
            >
              <Link2Off {...ICON} />
            </ToolButton>
          )}
          <span className="rte-sep" aria-hidden="true" />
          <ToolButton label="Undo" disabled={!state.canUndo} onRun={() => editor.chain().focus().undo().run()}>
            <Undo2 {...ICON} />
          </ToolButton>
          <ToolButton label="Redo" disabled={!state.canRedo} onRun={() => editor.chain().focus().redo().run()}>
            <Redo2 {...ICON} />
          </ToolButton>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}

/* ---------- Bullet list editor ---------- */

/* The whole document is exactly one bullet list, so every line typed is a
   bullet and the list can never be broken into loose paragraphs. */
const BulletListDocument = Node.create({
  name: 'doc',
  topNode: true,
  content: 'bulletList',
})

const listToHtml = (items: string[]): string =>
  `<ul>${(items.length ? items : ['']).map((i) => `<li><p>${escapeHtml(i)}</p></li>`).join('')}</ul>`

const inlineText = (n: JSONContent): string => {
  if (n.type === 'text') return n.text ?? ''
  if (n.type === 'hardBreak') return ' '
  return (n.content ?? []).map(inlineText).join('')
}

/* Each bullet becomes one string. Nested bullets, if pasted in, become their
   own items rather than being lost. Empty bullets are dropped. */
function itemsOf(doc: JSONContent): string[] {
  const out: string[] = []
  const visit = (n: JSONContent) => {
    const children = n.content ?? []
    if (n.type === 'listItem') {
      out.push(children.filter((c) => c.type === 'paragraph').map(inlineText).join(' '))
      children.filter((c) => c.type === 'bulletList' || c.type === 'orderedList').forEach(visit)
      return
    }
    if (n.type === 'paragraph') {
      out.push(inlineText(n))
      return
    }
    children.forEach(visit)
  }
  visit(doc)
  return out.map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

interface BulletListFieldProps {
  label: string
  value: string[]
  onChange: (items: string[]) => void
  minHeight?: number
}

export function BulletListField({ label, value, onChange, minHeight = 120 }: BulletListFieldProps) {
  const lastEmitted = useRef(JSON.stringify(value))
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  const editor = useEditor({
    extensions: [
      BulletListDocument,
      StarterKit.configure({
        document: false,
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        orderedList: false,
        hardBreak: false,
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        link: false,
        /* It would add a paragraph after the list, which this document does not allow. */
        trailingNode: false,
      }),
    ],
    content: listToHtml(value),
    editorProps: { attributes: contentAttributes(label, minHeight) },
    onUpdate: ({ editor: e }) => {
      const items = itemsOf(e.getJSON())
      lastEmitted.current = JSON.stringify(items)
      onChangeRef.current(items)
    },
  })

  useEffect(() => {
    const incoming = JSON.stringify(value)
    if (!editor || incoming === lastEmitted.current) return
    lastEmitted.current = incoming
    editor.commands.setContent(listToHtml(value), { emitUpdate: false })
  }, [editor, value])

  return (
    <div className="rte is-list">
      <EditorContent editor={editor} />
    </div>
  )
}
