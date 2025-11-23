import { useEffect, useRef, useState } from 'react';
import { Bot, ChevronUp, Send, User as UserIcon } from 'lucide-react';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  text: `👋 Hey! I'm your BTech Buddy AI powered by Gemini.\nAsk me anything about tech, code, or career!`,
  isUser: false,
  timestamp: new Date(),
};

export default function Chatbot() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // New collapsed state
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-show collapsed header after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCollapsed(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-close collapsed header after 2 more seconds
  useEffect(() => {
    if (isCollapsed && !isExpanded) {
      const timer = setTimeout(() => {
        setIsCollapsed(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isCollapsed, isExpanded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: userMessage.text }] }],
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I had trouble understanding that.';

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: aiText.trim(),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Gemini API Error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: 'Oops! Gemini AI couldn’t respond. Please try again. ❌',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chatbot Container - Fixed position, expands in place */}
      <div
        role="dialog"
        aria-label="BTech Buddy chat"
        aria-expanded={isExpanded}
        className={`fixed bottom-6 right-6 z-50 transition-all duration-[800ms] ease-in-out ${isExpanded
            ? 'w-[450px] h-[650px]'
            : isCollapsed
              ? 'w-auto h-auto'
              : 'w-16 h-16'
          } bg-white rounded-xl border-2 border-gray-300 shadow-xl overflow-hidden`}
      >

        {/* Hidden state - Round button */}
        {!isExpanded && !isCollapsed && (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0020ff] to-[#00ccff] text-white hover:scale-110 transition-transform rounded-xl"
          >
            <Bot className="w-8 h-8" />
          </button>
        )}

        {/* Collapsed state - Just header bar */}
        {!isExpanded && isCollapsed && (
          <div className="flex items-center justify-between bg-gradient-to-r from-[#0020ff] to-[#00ccff] px-6 py-4 rounded-xl min-w-[280px] cursor-pointer" onClick={() => setIsExpanded(true)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <Bot className="text-[var(--accent-color)] w-6 h-6" />
              </div>
              <span className="text-white font-bold text-lg">BTech Buddy AI</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(false);
                setIsExpanded(false);
              }}
              className="p-2 hover:bg-white/20 transition-colors rounded-lg text-white ml-2"
            >
              <ChevronUp className="w-5 h-5 rotate-180" />
            </button>
          </div>
        )}

        {/* Fully Expanded */}
        {isExpanded && (
          <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="flex h-16 w-full items-center justify-between border-b-2 border-gray-200 bg-gradient-to-r from-[#0020ff] to-[#00ccff] px-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Bot className="text-[var(--accent-color)] w-6 h-6" />
                </div>
                <div className="flex flex-col text-left text-white">
                  <span className="text-lg font-bold leading-none">BTech Buddy AI</span>
                  <span className="text-[10px] font-mono uppercase tracking-wide opacity-90">Powered by Gemini</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsExpanded(false);
                  setIsCollapsed(false);
                }}
                className="p-2 hover:bg-white/20 transition-colors rounded-lg text-white"
              >
                <ChevronUp className="w-5 h-5 rotate-180" />
              </button>
            </div>

            {/* Chat Body with proper scrolling - DARK MODE */}
            <div className="flex-1 overflow-hidden bg-gray-900 flex flex-col min-h-0">
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#4b5563 #1f2937'
                }}
                onClick={() => inputRef.current?.focus()}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${msg.isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.isUser
                      ? 'bg-gradient-to-br from-[#0020ff] to-[#00ccff] text-white'
                      : 'bg-gray-800 border-2 border-gray-700 text-[var(--accent-color)]'
                      }`}>
                      {msg.isUser ? (
                        <UserIcon className="w-5 h-5" />
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] whitespace-pre-wrap break-words px-4 py-3 text-sm font-medium leading-relaxed rounded-lg ${msg.isUser
                        ? 'bg-gradient-to-br from-[#0020ff] to-[#00ccff] text-white'
                        : 'bg-gray-800 text-gray-100 border border-gray-700'
                        }`}
                      style={{ overflowWrap: 'anywhere' }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 items-center">
                    <div className="w-9 h-9 bg-gray-800 border-2 border-gray-700 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-[var(--accent-color)] animate-pulse" />
                    </div>
                    <div className="px-4 py-2 border border-gray-700 bg-gray-800 text-gray-300 text-xs font-bold uppercase tracking-wide animate-pulse rounded-lg">
                      Thinking...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form - Fixed at bottom - DARK MODE */}
              <form
                onSubmit={handleSubmit}
                className="border-t-2 border-gray-800 bg-gray-950 p-4 flex-shrink-0"
                aria-label="Send message"
              >
                <div className="flex gap-3 items-end">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 resize-none border-2 border-gray-700 rounded-lg bg-gray-800 px-4 py-3 text-gray-100 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 placeholder:text-gray-500 min-h-[44px] max-h-32 transition-all"
                    style={{ lineHeight: '1.5' }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !message.trim()}
                    className="h-[44px] w-[44px] flex items-center justify-center bg-gradient-to-br from-[#0020ff] to-[#00ccff] text-white rounded-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-transform flex-shrink-0"
                    aria-disabled={isLoading || !message.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}