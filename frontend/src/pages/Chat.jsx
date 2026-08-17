// pages/Chat.jsx
// AI Chat Assistant with persisted Chat History

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiSend,
  FiTrash2,
  FiMessageSquare,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import DashboardLayout from '../components/DashboardLayout';
import EmptyState from '../components/EmptyState';

import {
  getChatsApi,
  getChatByIdApi,
  sendMessageApi,
  deleteChatApi,
} from '../api/chatApi';

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const bottomRef = useRef(null);

  // ============================================================
  // LOAD CHAT LIST
  // ============================================================

  const loadChatList = async () => {
    try {
      const res = await getChatsApi();
      setChats(res.data.data || []);
    } catch (err) {
      console.error('Failed to load chat list:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    loadChatList();
  }, []);

  // ============================================================
  // LOAD SELECTED CHAT
  // ============================================================

  useEffect(() => {
    const loadThread = async () => {
      if (!id) {
        setMessages([]);
        return;
      }

      try {
        const res = await getChatByIdApi(id);
        setMessages(res.data.data.messages || []);
      } catch (err) {
        console.error('Failed to load conversation:', err);
        toast.error('Unable to load this conversation');
      }
    };

    loadThread();
  }, [id]);

  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSend = async (e) => {
    e.preventDefault();

    if (!input.trim() || sending) {
      return;
    }

    const currentInput = input.trim();

    const userMsg = {
      role: 'user',
      content: currentInput,
    };

    setMessages((prev) => [...prev, userMsg]);

    setInput('');
    setSending(true);

    try {
      const res = await sendMessageApi({
        message: currentInput,
        chatId: id,
      });

      const reply = res.data.data.reply;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
        },
      ]);

      if (!id && res.data.data.chatId) {
        navigate(`/chat/${res.data.data.chatId}`, {
          replace: true,
        });
      }

      await loadChatList();
    } catch (err) {
      console.error('Send message error:', err);

      setMessages((prev) => prev.slice(0, -1));

      toast.error(
        err?.response?.data?.message ||
          'Failed to send message. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // DELETE CHAT
  // ============================================================

  const handleDelete = async (chatId, e) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      'Delete this conversation?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteChatApi(chatId);

      toast.success('Conversation deleted');

      if (chatId === id) {
        navigate('/chat');
        setMessages([]);
      }

      await loadChatList();
    } catch (err) {
      console.error('Delete chat error:', err);

      toast.error(
        err?.response?.data?.message ||
          'Failed to delete conversation'
      );
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <DashboardLayout>
      <div className="relative h-[calc(100dvh-120px)] lg:h-[calc(100vh-120px)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">

          {/* ======================================================
              CHAT HISTORY SIDEBAR — desktop: static, mobile: drawer
          ====================================================== */}

          <div
            className={`
              card !p-0 overflow-hidden flex-col
              fixed inset-y-0 left-0 z-40 w-72 transition-transform duration-200
              ${showHistory ? 'translate-x-0 flex' : '-translate-x-full hidden'}
              lg:static lg:translate-x-0 lg:z-auto lg:w-auto lg:flex
            `}
          >
            {/* Mobile drawer header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800 lg:hidden shrink-0">
              <span className="font-semibold text-sm">Conversations</span>
              <button onClick={() => setShowHistory(false)}>
                <FiX size={18} />
              </button>
            </div>

            {/* New Chat */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <button
                onClick={() => {
                  navigate('/chat');
                  setShowHistory(false);
                }}
                className="btn-primary w-full text-sm"
              >
                + New Chat
              </button>
            </div>

            {/* History */}
            <div className="flex-1 overflow-y-auto">
              {loadingChats ? (
                <div className="p-4 text-sm text-gray-500">
                  Loading conversations...
                </div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  No conversations yet
                </div>
              ) : (
                chats.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => {
                      navigate(`/chat/${c._id}`);
                      setShowHistory(false);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      id === c._id
                        ? 'bg-primary-600 text-white dark:bg-primary-700'
                        : 'text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    <span className="truncate pr-2">
                      {c.title || 'New Conversation'}
                    </span>

                    <FiTrash2
                      size={14}
                      className={`shrink-0 ml-2 opacity-0 group-hover:opacity-100 ${
                        id === c._id
                          ? 'text-white hover:text-red-200'
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                      onClick={(e) => handleDelete(c._id, e)}
                    />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Backdrop overlay for mobile drawer */}
          {showHistory && (
            <div
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              onClick={() => setShowHistory(false)}
            />
          )}

          {/* ======================================================
              CHAT WINDOW
          ====================================================== */}

          <div className="card !p-0 flex flex-col lg:col-span-3 overflow-hidden min-h-0">

            {/* Mobile compact header with menu toggle */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800 lg:hidden shrink-0">
              <button onClick={() => setShowHistory(true)}>
                <FiMenu size={18} />
              </button>
              <span className="font-semibold text-xs">Chat</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4 min-h-0">

              {messages.length === 0 ? (

                <EmptyState
                  icon={FiMessageSquare}
                  title="Ask me anything"
                  description="I can explain concepts, help with assignments, or answer doubts about your coursework."
                />

              ) : (

                messages.map((m, idx) => (

                  <div
                    key={idx}
                    className={`flex ${
                      m.role === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >

                    <div
                      className={`max-w-[85%] sm:max-w-[80%] min-w-0 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm break-words ${
                        m.role === 'user'
                          ? 'bg-primary-600 text-white rounded-br-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                      }`}
                    >

                      {m.role === 'user' ? (

                        <div className="whitespace-pre-wrap">
                          {m.content}
                        </div>

                      ) : (

                        <div className="markdown-content">

                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{

                              p: ({ children }) => (
                                <p className="mb-3 last:mb-0 leading-7">
                                  {children}
                                </p>
                              ),

                              strong: ({ children }) => (
                                <strong className="font-bold">
                                  {children}
                                </strong>
                              ),

                              em: ({ children }) => (
                                <em className="italic">{children}</em>
                              ),

                              h1: ({ children }) => (
                                <h1 className="text-xl font-bold mb-3 mt-4">
                                  {children}
                                </h1>
                              ),

                              h2: ({ children }) => (
                                <h2 className="text-lg font-bold mb-2 mt-4">
                                  {children}
                                </h2>
                              ),

                              h3: ({ children }) => (
                                <h3 className="text-base font-bold mb-2 mt-3">
                                  {children}
                                </h3>
                              ),

                              ul: ({ children }) => (
                                <ul className="list-disc ml-5 mb-3 space-y-1">
                                  {children}
                                </ul>
                              ),

                              ol: ({ children }) => (
                                <ol className="list-decimal ml-5 mb-3 space-y-1">
                                  {children}
                                </ol>
                              ),

                              li: ({ children }) => <li>{children}</li>,

                              code: ({ inline, children }) => {
                                if (inline) {
                                  return (
                                    <code className="bg-gray-200 dark:bg-gray-700 rounded px-1.5 py-0.5 text-xs">
                                      {children}
                                    </code>
                                  );
                                }
                                return <code>{children}</code>;
                              },

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

                              hr: () => (
                                <hr className="my-4 border-gray-300 dark:border-gray-600" />
                              ),

                              a: ({ children, href }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-500 hover:underline"
                                >
                                  {children}
                                </a>
                              ),

                              table: ({ children }) => (
                                <div className="overflow-x-auto my-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                  <table className="min-w-full text-xs sm:text-sm border-collapse">
                                    {children}
                                  </table>
                                </div>
                              ),

                              thead: ({ children }) => (
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                  {children}
                                </thead>
                              ),

                              tbody: ({ children }) => (
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                  {children}
                                </tbody>
                              ),

                              tr: ({ children }) => <tr>{children}</tr>,

                              th: ({ children }) => (
                                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                                  {children}
                                </th>
                              ),

                              td: ({ children }) => (
                                <td className="px-3 py-2 align-top">
                                  {children}
                                </td>
                              ),

                            }}
                          >
                            {m.content}
                          </ReactMarkdown>

                        </div>
                      )}

                    </div>
                  </div>

                ))

              )}

              <div ref={bottomRef} />

            </div>

            {/* ====================================================
                MESSAGE INPUT
            ==================================================== */}

            <form
              onSubmit={handleSend}
              className="border-t border-gray-100 dark:border-gray-800 p-2 sm:p-4 flex gap-2 shrink-0"
            >

              <input
                className="input-field flex-1"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
              />

              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="btn-primary px-4"
              >
                <FiSend size={16} />
              </button>

            </form>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;