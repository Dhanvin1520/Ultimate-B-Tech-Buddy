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
          contents: [{ parts: [{ text: message }] }],
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const aiText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Sorry, I had trouble understanding that.';

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
    <div className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[28rem] max-w-[30rem] bg-[#0f172a] text-white border border-blue-400 rounded-2xl shadow-lg z-50 overflow-hidden transition-all ${isExpanded ? 'h-[90vh]' : 'h-16'}`}>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full h-16 flex items-center justify-between px-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Bot className="text-blue-600 w-6 h-6" />
          </div>
          <span className="text-lg font-semibold">BTech Buddy AI</span>
        </div>
        <ChevronUp className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="flex flex-col h-[calc(100%-4rem)]">
   
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f172a]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${msg.isUser ? 'flex-row-reverse' : ''}`}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {msg.isUser ? (
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Bot className="w-5 h-5 text-blue-700" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed overflow-hidden break-words whitespace-pre-wrap ${
                    msg.isUser
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-100 text-black'
                  }`}
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-blue-100 text-black px-3 py-1 rounded-xl animate-pulse">
                  Typing...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>


          <form
            onSubmit={handleSubmit}
            className="p-3 bg-[#1e293b] border-t border-blue-400"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 rounded-xl bg-zinc-900 text-white border border-blue-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-400 to-sky-400 p-2 rounded-xl text-black hover:scale-105 transition"
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