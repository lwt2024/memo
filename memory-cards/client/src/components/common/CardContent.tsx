import { useEffect, useRef } from 'react';

interface CardContentProps {
  content: string;
}

export default function CardContent({ content }: CardContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const processCodeBlocks = () => {
      const codeBlocks = containerRef.current?.querySelectorAll('.code-block');
      if (!codeBlocks) return;
      
      codeBlocks.forEach((block) => {
        const el = block as HTMLElement;
        if (el.dataset.processed) return;
        el.dataset.processed = 'true';
        
        const language = block.getAttribute('data-language') || 'javascript';
        const code = decodeURIComponent(block.getAttribute('data-code') || '');
        
        const wrapper = document.createElement('div');
        wrapper.className = 'my-2 rounded-lg overflow-hidden border bg-white';
        wrapper.style.borderColor = '#e5e7eb';
        
        const header = document.createElement('div');
        header.className = 'flex items-center justify-between px-4 py-2 bg-gray-100 border-b';
        header.style.borderColor = '#e5e7eb';
        
        const langSpan = document.createElement('span');
        langSpan.className = 'text-xs font-medium text-gray-600 uppercase';
        langSpan.textContent = language;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'text-xs text-gray-500 hover:text-gray-700 cursor-pointer px-2 py-1 rounded hover:bg-gray-200';
        copyBtn.textContent = '复制';
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(code);
        };
        
        header.appendChild(langSpan);
        header.appendChild(copyBtn);
        
        const codeWrapper = document.createElement('pre');
        codeWrapper.style.cssText = 'margin: 0; padding: 16px; overflow-x: auto; font-family: monospace; font-size: 14px;';
        
        const codeEl = document.createElement('code');
        codeEl.textContent = code;
        codeWrapper.appendChild(codeEl);
        
        wrapper.appendChild(header);
        wrapper.appendChild(codeWrapper);
        
        block.replaceWith(wrapper);
      });
    };

    processCodeBlocks();
    
    const observer = new MutationObserver(processCodeBlocks);
    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }
    
    return () => observer.disconnect();
  }, [content]);

  return (
    <div 
      ref={containerRef}
      className="whitespace-pre-wrap leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content || '' }}
    />
  );
};