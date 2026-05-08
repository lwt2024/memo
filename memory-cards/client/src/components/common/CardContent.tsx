import { useEffect, useRef, useMemo } from 'react';

interface CardContentProps {
  content: string;
}

export default function CardContent({ content }: CardContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const cleanedContent = useMemo(() => {
    if (!content) return '';
    
    const doc = new DOMParser().parseFromString(content, 'text/html');
    
    doc.querySelectorAll('[data-lark-record-data], [data-lark-record-format], .lark-record-clipboard, [data-docx-has-block-data]').forEach(el => el.remove());
    
    doc.querySelectorAll('pre.ace-line').forEach(pre => {
      const text = pre.textContent || '';
      if (text) {
        const div = document.createElement('div');
        div.textContent = text;
        pre.replaceWith(div);
      } else {
        pre.remove();
      }
    });
    
    doc.querySelectorAll('[data-page-id]').forEach(el => {
      if (el.innerHTML.trim()) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = el.innerHTML;
        el.replaceWith(wrapper);
      } else {
        el.remove();
      }
    });
    
    return doc.body.innerHTML;
  }, [content]);

  useEffect(() => {
    if (!containerRef.current) return;

    const codeBlocks = containerRef.current.querySelectorAll('.code-block');
    codeBlocks.forEach((block) => {
      const language = block.getAttribute('data-language') || 'javascript';
      const code = decodeURIComponent(block.getAttribute('data-code') || '');
      
      const wrapper = document.createElement('div');
      wrapper.className = 'my-2 rounded-lg overflow-hidden border';
      wrapper.style.borderColor = '#e5e7eb';
      
      const header = document.createElement('div');
      header.className = 'flex items-center justify-between px-4 py-2 bg-gray-50 border-b';
      header.style.borderColor = '#e5e7eb';
      
      const langSpan = document.createElement('span');
      langSpan.className = 'text-xs font-medium text-gray-600 uppercase';
      langSpan.textContent = language;
      
      const actions = document.createElement('div');
      actions.className = 'flex items-center gap-2';
      
      const wrapSpan = document.createElement('span');
      wrapSpan.className = 'text-xs text-gray-400';
      wrapSpan.textContent = '自动换行';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'text-xs text-gray-500 hover:text-gray-700 cursor-pointer';
      copyBtn.textContent = '复制';
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(code);
      };
      
      actions.appendChild(wrapSpan);
      actions.appendChild(copyBtn);
      header.appendChild(langSpan);
      header.appendChild(actions);
      
      const codeWrapper = document.createElement('pre');
      codeWrapper.style.cssText = 'margin: 0; padding: 16px; background: #ffffff; overflow-x: auto;';
      
      const codeEl = document.createElement('code');
      codeEl.textContent = code;
      codeWrapper.appendChild(codeEl);
      
      wrapper.appendChild(header);
      wrapper.appendChild(codeWrapper);
      
      block.replaceWith(wrapper);
    });
  }, [cleanedContent]);

  return (
    <div 
      ref={containerRef}
      className="whitespace-pre-wrap leading-relaxed"
      dangerouslySetInnerHTML={{ __html: cleanedContent }}
    />
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