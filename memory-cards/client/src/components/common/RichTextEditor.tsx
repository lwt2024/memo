import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  height?: string;
  placeholder?: string;
}

const RichTextEditor = ({ content, onChange, height = '200px', placeholder = '请输入内容...' }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
        style: `min-height: ${height};`,
        placeholder: placeholder,
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      {/* 工具栏 */}
      <div className="flex flex-wrap gap-1 p-2 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('bold') 
              ? 'text-white bg-blue-500' 
              : 'hover:bg-gray-100'
          }`}
          style={{ color: editor.isActive('bold') ? 'white' : 'var(--color-text)' }}
          title="加粗"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('italic') 
              ? 'text-white bg-blue-500' 
              : 'hover:bg-gray-100'
          }`}
          style={{ color: editor.isActive('italic') ? 'white' : 'var(--color-text)' }}
          title="斜体"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('underline') 
              ? 'text-white bg-blue-500' 
              : 'hover:bg-gray-100'
          }`}
          style={{ color: editor.isActive('underline') ? 'white' : 'var(--color-text)' }}
          title="下划线"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('strike') 
              ? 'text-white bg-blue-500' 
              : 'hover:bg-gray-100'
          }`}
          style={{ color: editor.isActive('strike') ? 'white' : 'var(--color-text)' }}
          title="删除线"
        >
          <s>S</s>
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 1 }) 
              ? 'text-white bg-blue-500' 
              : 'hover:bg-gray-100'
          }`}
          style={{ color: editor.isActive('heading', { level: 1 }) ? 'white' : 'var(--color-text)' }}
          title="标题1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 2 }) 
              ? 'text-white bg-blue-500' 
              : 'hover:bg-gray-100'
          }`}
          style={{ color: editor.isActive('heading', { level: 2 }) ? 'white' : 'var(--color-text)' }}
          title="标题2"
        >
          H2
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('bulletList') 
              ? 'text-white bg-blue-500' 
              : 'hover:bg-gray-100'
          }`}
          style={{ color: editor.isActive('bulletList') ? 'white' : 'var(--color-text)' }}
          title="无序列表"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('orderedList') 
              ? 'text-white bg-blue-500' 
              : 'hover:bg-gray-100'
          }`}
          style={{ color: editor.isActive('orderedList') ? 'white' : 'var(--color-text)' }}
          title="有序列表"
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('codeBlock') 
              ? 'text-white bg-blue-500' 
              : 'hover:bg-gray-100'
          }`}
          style={{ color: editor.isActive('codeBlock') ? 'white' : 'var(--color-text)' }}
          title="代码块"
        >
          &lt;/&gt;
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('code') 
              ? 'text-white bg-blue-500' 
              : 'hover:bg-gray-100'
          }`}
          style={{ color: editor.isActive('code') ? 'white' : 'var(--color-text)' }}
          title="行内代码"
        >
          `Code`
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          style={{ color: 'var(--color-text)' }}
          title="分割线"
        >
          ─
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          style={{ color: 'var(--color-text)' }}
          title="撤销"
        >
          ↩
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          style={{ color: 'var(--color-text)' }}
          title="重做"
        >
          ↪
        </button>
      </div>
      
      {/* 编辑器内容区 */}
      <div className="p-4" style={{ backgroundColor: 'var(--color-background)' }}>
        <EditorContent 
          editor={editor} 
          className="focus:outline-none prose max-w-none"
          style={{ 
            color: 'var(--color-text)',
          }}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
