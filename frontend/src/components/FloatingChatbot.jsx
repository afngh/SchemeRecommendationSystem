import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, ChevronDown } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import MarkdownViewer from './MarkdownViewer';

export default function FloatingChatbot() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! 👋 I am your **SchemeLens Assistant** powered by Groq AI. Need help writing effective queries or resolving portal issues?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const quickPrompts = language === 'te' ? [
    'పథకాల శోధన ఎలా చేయాలి?',
    'నాకు కావలసిన ధృవపత్రాలు ఏమిటి?',
    'నా అర్హత ఎలా సరిచూసుకోవాలి?',
    'పోర్టల్ ఫిర్యాదు ఎలా నమోదు చేయాలి?'
  ] : [
    'How do I search for schemes?',
    'What documents do I need?',
    'How to check my eligibility?',
    'How to report a portal issue?'
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const data = await apiFetch('/api/help/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          conversation_history: messages.slice(-6),
          language: language || 'en'
        })
      });

      const botReply = data.reply || 'I am here to help! Try asking about search queries, eligibility, or document checklists.';
      setMessages((prev) => [...prev, { role: 'assistant', content: botReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I ran into a brief connection issue. You can try typing your search query directly in the search bar above!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-['Plus_Jakarta_Sans']">
      
      {/* Expanded Floating Chat Window */}
      {isOpen && (
        <div className="mb-4 w-84 sm:w-96 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] transition-all animate-slide-up">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <h4 className="font-['Outfit'] font-extrabold text-sm tracking-wide text-white">
                  {language === 'te' ? 'స్కీమ్‌లెన్స్ అసిస్టెంట్' : 'SchemeLens Assistant'}
                </h4>
                <p className="text-3xs text-emerald-200 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Groq AI Live Help ({language === 'te' ? 'తెలుగు' : 'English'})
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="bg-slate-100/90 border-b border-slate-200 p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-[#064e3b] text-3xs font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap transition-all shadow-2xs cursor-pointer shrink-0"
              >
                💡 {prompt}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-full bg-[#064e3b] text-amber-300 flex items-center justify-center text-3xs font-black shrink-0 mt-0.5 shadow-2xs">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-[#064e3b] text-white font-medium rounded-tr-none'
                      : 'bg-white border border-slate-200/90 text-slate-800 font-normal rounded-tl-none'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <MarkdownViewer content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start items-center">
                <div className="h-7 w-7 rounded-full bg-[#064e3b] text-amber-300 flex items-center justify-center text-3xs font-black shrink-0 shadow-2xs">
                  AI
                </div>
                <div className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl text-3xs text-slate-500 flex items-center gap-1.5 shadow-2xs">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span> Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={language === 'te' ? 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...' : 'Ask for query help or portal issues...'}
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-[#064e3b] focus:bg-white focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/20 transition-all font-['Plus_Jakarta_Sans']"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-[#064e3b] hover:bg-[#047857] disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Send className="h-4 w-4 text-amber-300" />
            </button>
          </form>

        </div>
      )}

      {/* Floating Toggle Bubble Button */}
      <button
        id="floating-chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-amber-300/30 flex items-center justify-center"
        title="SchemeLens AI Help Assistant"
      >
        {/* Glowing Badge Pulse */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 text-[9px] font-black text-[#064e3b] items-center justify-center">?</span>
        </span>

        {isOpen ? (
          <ChevronDown className="h-6 w-6 text-white group-hover:rotate-180 transition-transform" />
        ) : (
          <Bot className="h-6 w-6 text-amber-300 group-hover:scale-110 transition-transform" />
        )}
      </button>

    </div>
  );
}
