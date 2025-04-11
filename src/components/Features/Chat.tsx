import { useState } from 'react';
import { Send, User as UserIcon } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  userName: string;
  timestamp: Date;
}

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to the community chat! stay tuned its coming soon!!',
      userName: 'System',
      timestamp: new Date(),
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text: message,
      userName: 'User',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl h-[calc(100vh-8rem)]">
      <h2 className="text-xl font-semibold mb-6 text-white">Community Chat</h2>
      
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400">{msg.userName}</span>
                <div className="max-w-[70%] p-3 rounded-lg bg-gray-700 text-white">
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}