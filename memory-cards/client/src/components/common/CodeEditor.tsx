import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust',
  'ruby', 'php', 'html', 'css', 'json', 'sql', 'bash', 'markdown'
];

interface CodeEditorProps {
  onInsert: (codeHtml: string) => void;
  onClose: () => void;
}

export default function CodeEditor({ onInsert, onClose }: CodeEditorProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  const handleInsert = () => {
    if (!code.trim()) return;
    
    const codeBlock = `
<div class="code-block" data-language="${language}" data-code="${encodeURIComponent(code)}">
<pre class="language-${language}"><code>${escapeHtml(code)}</code></pre>
</div>
    `.trim();
    
    onInsert(codeBlock);
    onClose();
  };

  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden" style={{ color: '#1f2937' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#e5e7eb' }}>
          <h3 className="text-lg font-semibold">插入代码块</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">选择语言</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#e5e7eb' }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">代码内容</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-48 px-4 py-3 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              style={{ borderColor: '#e5e7eb' }}
              placeholder="// 在此输入代码..."
            />
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              style={{ borderColor: '#e5e7eb' }}
            >
              取消
            </button>
            <button
              onClick={handleInsert}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              插入代码块
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  return (
    <div className="my-2 rounded-lg overflow-hidden border" style={{ borderColor: '#e5e7eb' }}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b" style={{ borderColor: '#e5e7eb' }}>
        <span className="text-xs font-medium text-gray-600 uppercase">{language}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">自动换行</span>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            复制
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{ margin: 0, padding: '16px', background: '#ffffff' }}
        showLineNumbers={true}
        wrapLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};