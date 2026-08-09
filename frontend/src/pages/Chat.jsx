// pages/Chat.jsx
// AI Chat Assistant with persisted Chat History (list of past threads + live chat window).

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiPlus, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { getChatsApi, getChatByIdApi, sendMessageApi, deleteChatApi } from '../api/chatApi';

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const bottomRef = useRef(null);

  const loadChatList = async () => {
    const res = await getChatsApi();
    setChats(res.data.data);
    setLoadingChats(false);
  };

  useEffect(() => {
    loadChatList();
  }, []);

  useEffect(() => {
    const loadThread = async () => {
      if (!id) {
        setMessages([]);
        return;
      }
      const res = await getChatByIdApi(id);
      setMessages(res.data.data.messages);
    };
    loadThread();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setSending(true);

    try {
      const res = await sendMessageApi({ message: currentInput, chatId: id });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.data.reply }]);
      if (!id) {
        navigate(`/chat/${res.data.data.chatId}`, { replace: true });
      }
      loadChatList();
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1)); // rollback optimistic user message
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (chatId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;
    await deleteChatApi(chatId);
    toast.success('Conversation deleted');
    if (chatId === id) navigate('/chat');
    loadChatList();
  };

  return (
    <DashboardLayout title="AI Chat Assistant">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 h-[calc(100vh-8rem)]">
        {/* Chat history sidebar */}
        <div className="card !p-0 overflow-hidden flex flex-col lg:col-span-1">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <button onClick={() => navigate('/chat')} className="btn-primary w-full text-sm">
              <FiPlus size={16} /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingChats ? (
              <Loader label="Loading..." />
            ) : chats.length === 0 ? (
              <p className="text-xs text-gray-400 text-center p-4">No conversations yet</p>
            ) : (
              chats.map((c) => (
                <button
                  key={c._id}
                  onClick={() => navigate(`/chat/${c._id}`)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    id === c._id
                    ? 'bg-primary-600 text-white dark:bg-primary-700'
                    : 'text-gray-100'
                  }`}
                >
                  <span className="text-sm truncate text-gray-700 dark:text-gray-200">{c.title}</span>
                  <FiTrash2
                    size={14}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 shrink-0 ml-2"
                    onClick={(e) => handleDelete(c._id, e)}
                  />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="card !p-0 flex flex-col lg:col-span-3 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 ? (
              <EmptyState
                icon={FiMessageSquare}
                title="Ask me anything"
                description="I can explain concepts, help with assignments, or answer doubts about your coursework."
              />
            ) : (
              messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                    }`}
                  >
                    {m.role === 'assistant' ? (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      p: ({ children }) => (
        <p className="mb-3 last:mb-0">{children}</p>
      ),

      strong: ({ children }) => (
        <strong className="font-bold">{children}</strong>
      ),

      em: ({ children }) => (
        <em className="italic">{children}</em>
      ),

      h1: ({ children }) => (
        <h1 className="text-xl font-bold mb-3">{children}</h1>
      ),

      h2: ({ children }) => (
        <h2 className="text-lg font-bold mb-2">{children}</h2>
      ),

      h3: ({ children }) => (
        <h3 className="text-base font-bold mb-2">{children}</h3>
      ),

      ul: ({ children }) => (
        <ul className="list-disc ml-5 mb-3 space-y-1">{children}</ul>
      ),

      ol: ({ children }) => (
        <ol className="list-decimal ml-5 mb-3 space-y-1">{children}</ol>
      ),

      li: ({ children }) => (
        <li>{children}</li>
      ),

      code: ({ children }) => (
        <code className="bg-gray-200 dark:bg-gray-700 rounded px-1.5 py-0.5 text-xs">
          {children}
        </code>
      ),

      pre: ({ children }) => (
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 my-3 overflow-x-auto text-xs">
          {children}
        </pre>
      ),

      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-primary-500 pl-3 my-3 italic">
          {children}
        </blockquote>
      ),
    }}
  >
    {m.content}
  </ReactMarkdown>
) : (
  m.content
)}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader size="sm" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-gray-100 dark:border-gray-800 p-4 flex gap-2">
            <input
              className="input-field"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()} className="btn-primary px-4">
              <FiSend size={16} />
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
