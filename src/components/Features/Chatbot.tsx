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
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div
      role="dialog"
      aria-label="BTech Buddy chat"
      aria-expanded={isExpanded}
      className={`fixed z-50 transition-all ${isExpanded ? 'inset-0 sm:inset-auto sm:right-4 sm:bottom-4 sm:w-[28rem] sm:h-[90vh] rounded-none sm:rounded-3xl' : 'right-4 bottom-4 max-w-[30rem] sm:right-4 sm:left-auto sm:w-[28rem] sm:h-16 rounded-3xl'} border border-white/15 bg-black/70 text-white shadow-aurora backdrop-blur-2xl`}
    >

      <div className={`flex h-16 w-full items-center justify-between rounded-t-3xl bg-brand-gradient px-4 ${isExpanded ? 'sm:rounded-t-3xl rounded-t-none' : 'rounded-t-3xl'}`}>
        <button
          onClick={() => setIsExpanded((v) => !v)}
          aria-controls="btech-chat-body"
          aria-expanded={isExpanded}
          className="flex items-center gap-3 focus:outline-none"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center neon-avatar">
            <Bot className="text-amber-600 w-6 h-6" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-lg font-semibold">BTech Buddy AI</span>
            <span className="text-xs text-white/70">Ask anything about tech and career</span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsExpanded(false)} className="p-2 rounded-full hover:bg-white/5 focus:outline-none">
            <ChevronUp className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div id="btech-chat-body" className="flex flex-col sm:h-[calc(100%-4rem)] h-[calc(100%-4rem)]">

          <div className="flex-1 space-y-4 overflow-y-auto bg-black/60 p-4 pb-28 sm:pb-6" onClick={() => inputRef.current?.focus()}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${msg.isUser ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.isUser ? 'bg-amber-600' : 'bg-white'}`}>
                  {msg.isUser ? (
                    <UserIcon className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-amber-700" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl p-3 text-sm leading-relaxed ${
                    msg.isUser
                      ? 'bg-amber-500/30 text-white'
                      : 'bg-white/90 text-black'
                  }`}
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-amber-600" />
                </div>
                <div className="rounded-xl bg-white/90 px-3 py-1 text-black animate-pulse">
                  Typing...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 bg-black/80 p-3 fixed bottom-0 left-0 right-0 z-50 sm:static sm:bg-black/60 sm:border-t-0"
            aria-label="Send message"
          >
            <div className="flex gap-2 items-end max-w-[1200px] mx-auto">
              <textarea
                ref={inputRef}
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="primary-btn flex items-center justify-center p-3"
                aria-disabled={isLoading || !message.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}