// pages/Chat.jsx
// AI Chat Assistant with persisted Chat History

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiSend,
  FiTrash2,
  FiMessageSquare,
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

  // Load chats when page opens
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

    // Optimistically display user message
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

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
        },
      ]);

      // If this was a new chat, move to its URL
      if (!id && res.data.data.chatId) {
        navigate(`/chat/${res.data.data.chatId}`, {
          replace: true,
        });
      }

      // Refresh chat history
      await loadChatList();
    } catch (err) {
      console.error('Send message error:', err);

      // Remove optimistic user message
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

      // If deleting currently opened chat
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-120px)]">

        {/* ======================================================
            CHAT HISTORY SIDEBAR
        ====================================================== */}

        <div className="card !p-0 overflow-hidden flex flex-col">

          {/* New Chat */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => navigate('/chat')}
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
                  onClick={() =>
                    navigate(`/chat/${c._id}`)
                  }
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
                    onClick={(e) =>
                      handleDelete(c._id, e)
                    }
                  />
                </button>
              ))
            )}

          </div>
        </div>

        {/* ======================================================
            CHAT WINDOW
        ====================================================== */}

        <div className="card !p-0 flex flex-col lg:col-span-3 overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">

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
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      m.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                    }`}
                  >

                    {/* ==================================================
                        USER MESSAGE
                    ================================================== */}

                    {m.role === 'user' ? (

                      <div className="whitespace-pre-wrap">
                        {m.content}
                      </div>

                    ) : (

                      /* ==================================================
                         AI MESSAGE
                      ================================================== */

                      <div className="markdown-content">

                        <ReactMarkdown
                          remarkPlugins={[
                            remarkGfm,
                            remarkMath,
                          ]}
                          rehypePlugins={[
                            rehypeKatex,
                          ]}
                          components={{

                            /* Paragraph */
                            p: ({ children }) => (
                              <p className="mb-3 last:mb-0 leading-7">
                                {children}
                              </p>
                            ),

                            /* Bold */
                            strong: ({ children }) => (
                              <strong className="font-bold">
                                {children}
                              </strong>
                            ),

                            /* Italic */
                            em: ({ children }) => (
                              <em className="italic">
                                {children}
                              </em>
                            ),

                            /* Headings */
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

                            /* Unordered list */
                            ul: ({ children }) => (
                              <ul className="list-disc ml-5 mb-3 space-y-1">
                                {children}
                              </ul>
                            ),

                            /* Ordered list */
                            ol: ({ children }) => (
                              <ol className="list-decimal ml-5 mb-3 space-y-1">
                                {children}
                              </ol>
                            ),

                            /* List item */
                            li: ({ children }) => (
                              <li>{children}</li>
                            ),

                            /* Inline code */
                            code: ({
                              inline,
                              children,
                            }) => {

                              if (inline) {
                                return (
                                  <code className="bg-gray-200 dark:bg-gray-700 rounded px-1.5 py-0.5 text-xs">
                                    {children}
                                  </code>
                                );
                              }

                              return (
                                <code>
                                  {children}
                                </code>
                              );
                            },

                            /* Code block */
                            pre: ({ children }) => (
                              <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 my-3 overflow-x-auto text-xs">
                                {children}
                              </pre>
                            ),

                            /* Blockquote */
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-primary-500 pl-3 my-3 italic">
                                {children}
                              </blockquote>
                            ),

                            /* Horizontal rule */
                            hr: () => (
                              <hr className="my-4 border-gray-300 dark:border-gray-600" />
                            ),

                            /* Links */
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

            {/* Scroll target */}
            <div ref={bottomRef} />

          </div>

          {/* ====================================================
              MESSAGE INPUT
          ==================================================== */}

          <form
            onSubmit={handleSend}
            className="border-t border-gray-100 dark:border-gray-800 p-4 flex gap-2"
          >

            <input
              className="input-field flex-1"
              placeholder="Type your question..."
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              disabled={sending}
            />

            <button
              type="submit"
              disabled={
                sending || !input.trim()
              }
              className="btn-primary px-4"
            >
              <FiSend size={16} />
            </button>

          </form>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;