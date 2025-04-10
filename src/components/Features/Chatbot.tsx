// import { useState } from 'react';
// import { ChevronUp, Send, Bot, User as UserIcon } from 'lucide-react';

// interface Message {
//   id: string;
//   text: string;
//   isUser: boolean;
//   timestamp: Date;
// }

// const INITIAL_MESSAGE: Message = {
//   id: '1',
//   text: "🧡 Hey! I'm your BTech Buddy AI.\nAsk me anything about tech, code, or career!",
//   isUser: false,
//   timestamp: new Date(),
// };

// export default function Chatbot() {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!message.trim() || isLoading) return;

//     const userMessage: Message = {
//       id: crypto.randomUUID(),
//       text: message,
//       isUser: true,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setMessage('');
//     setIsLoading(true);

//     setTimeout(() => {
//       const responses = [
//         "Here’s a great explanation just for you! 🧠",
//         "Let’s solve it step by step! 🛠️",
//         "Boom! There’s your answer. 🚀",
//         "Got you covered. Check this out! 💡",
//       ];

//       const aiMessage: Message = {
//         id: crypto.randomUUID(),

//         isUser: false,
//         timestamp: new Date(),
//       };

//       setMessages((prev) => [...prev, aiMessage]);
//       setIsLoading(false);
//     }, 1000);
//   };

//   return (
//     <div className={`fixed bottom-6 right-10 w-[30rem] bg-[#111827]/95 backdrop-blur-md border border-orange-300 rounded-2xl shadow-lg transition-all duration-300 transform ${isExpanded ? 'h-[42rem] scale-[1.02]' : 'h-16'} hover:scale-[1.02]`}>
//       <button
//         onClick={() => setIsExpanded(!isExpanded)}
//         className="w-full h-16 px-6 flex items-center justify-between bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 text-white rounded-t-2xl"
//       >
//         <div className="flex items-center gap-4">
//           <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
//             <Bot className="text-orange-600 w-6 h-6" />
//           </div>
//           <span className="text-xl font-semibold tracking-wide">BTech Buddy AI</span>
//         </div>
//         <ChevronUp className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
//       </button>

//       {isExpanded && (
//         <div className="h-[calc(100%-4rem)] flex flex-col">
//           <div className="flex-1 p-5 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent">
//             {messages.map((msg) => (
//               <div key={msg.id} className={`flex items-start gap-3 ${msg.isUser ? 'flex-row-reverse' : ''}`}>
//                 <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
//                   {msg.isUser ? (
//                     <UserIcon className="w-5 h-5 text-orange-400" />
//                   ) : (
//                     <Bot className="w-5 h-5 text-orange-500" />
//                   )}
//                 </div>
//                 <div
//                   className={`max-w-[70%] p-3 rounded-xl transition-all duration-300 ${
//                     msg.isUser
//                       ? 'bg-zinc-800 text-white'
//                       : 'bg-gradient-to-br from-orange-100 to-amber-200 text-black'
//                   }`}
//                 >
//                   {msg.text}
//                 </div>
//               </div>
//             ))}
//             {isLoading && (
//               <div className="flex items-center gap-2">
//                 <div className="w-9 h-9 rounded-full bg-orange-200 flex items-center justify-center">
//                   <Bot className="w-5 h-5 text-orange-600" />
//                 </div>
//                 <div className="bg-orange-100 text-orange-900 px-4 py-2 rounded-xl shadow-md animate-pulse">
//                   Typing...
//                 </div>
//               </div>
//             )}
//           </div>

//           <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-[#1f2937]">
//             <div className="flex gap-3">
//               <input
//                 type="text"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 placeholder="Type your message..."
//                 className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-xl border border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
//               />
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="p-3 bg-gradient-to-r from-orange-400 to-amber-300 text-black rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
//               >
//                 <Send className="w-5 h-5" />
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }



//   export const Chatbot = () => {
//     return (
//       <div>Chatbot</div>
//     )
//   }

export default function Chatbot() {
      return (
      <div>Chatbot</div>
    )
  }
