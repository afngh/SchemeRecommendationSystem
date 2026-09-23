import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function MarkdownViewer({ content, className = '' }) {
  if (!content) return null;

  return (
    <div className={`prose prose-emerald max-w-none text-xs sm:text-sm font-['Plus_Jakarta_Sans'] leading-relaxed text-slate-700 space-y-2 ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="font-['Outfit'] font-extrabold text-base sm:text-lg text-[#064e3b] mt-3 mb-1.5">{children}</h1>,
          h2: ({ children }) => <h2 className="font-['Outfit'] font-bold text-sm sm:text-base text-[#064e3b] mt-2.5 mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="font-['Outfit'] font-bold text-xs sm:text-sm text-[#064e3b] mt-2 mb-1">{children}</h3>,
          p: ({ children }) => <p className="mb-2 last:mb-0 text-xs sm:text-sm leading-normal">{children}</p>,
          strong: ({ children }) => <strong className="font-extrabold text-[#064e3b]">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-800">{children}</em>,
          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2 text-xs sm:text-sm">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2 text-xs sm:text-sm">{children}</ol>,
          li: ({ children }) => <li className="leading-snug">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-emerald-600 bg-emerald-50/60 pl-3 py-1.5 my-2 text-xs text-emerald-900 rounded-r-lg font-medium">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 border border-slate-200 rounded-xl shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[#064e3b] text-white font-['Outfit'] font-bold text-3xs sm:text-2xs uppercase tracking-wider">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-slate-200 bg-white">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-slate-50/80 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="p-2.5 font-bold">{children}</th>,
          td: ({ children }) => <td className="p-2.5 text-slate-700">{children}</td>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="font-bold text-[#064e3b] hover:text-emerald-700 underline">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
