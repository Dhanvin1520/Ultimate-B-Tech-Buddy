// import { useState } from 'react';
// import { ChevronUp, Send } from 'lucide-react';

// export default function Chatbot() {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
//     { text: 'Hi! How can I help you today?', isUser: false },
//   ]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!message.trim()) return;

//     setMessages([...messages, { text: message, isUser: true }]);
//     setMessage('');


//     setTimeout(() => {
//       setMessages((prev) => [
//         ...prev,
//         { text: "I'm here to help! What would you like to know?", isUser: false },
//       ]);
//     }, 1000);
//   };

//   return (
//     <div className={`bg-gray-800 transition-all duration-300 ${isExpanded ? 'h-96' : 'h-12'}`}>
//       <button
//         onClick={() => setIsExpanded(!isExpanded)}
//         className="w-full h-12 px-4 flex items-center justify-between bg-gray-800 text-white border-t border-gray-700"
//       >
//         <span className="font-medium">BTech Buddy AI</span>
//         <ChevronUp className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
//       </button>

//       {isExpanded && (
//         <div className="h-[calc(100%-3rem)] flex flex-col">
//           <div className="flex-1 p-4 overflow-y-auto space-y-4">
//             {messages.map((msg, i) => (
//               <div
//                 key={i}
//                 className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`max-w-[80%] p-3 rounded-lg ${
//                     msg.isUser
//                       ? 'bg-blue-500 text-white'
//                       : 'bg-gray-700 text-white'
//                   }`}
//                 >
//                   {msg.text}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 placeholder="Type your message..."
//                 className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <button
//                 type="submit"
//                 className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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