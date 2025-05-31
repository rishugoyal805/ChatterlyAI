"use client"
import { Inter } from 'next/font/google'
import { useState, useEffect, useRef } from "react"
import { BookOpen, Lightbulb, Menu, X, User, LogOut, ArrowLeft, Send, LayoutDashboard, MessageCircleMore, Bell } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { FaCopy, FaWhatsapp, FaEnvelope } from "react-icons/fa";


export default function AskDoubtPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const messagesEndRef = useRef(null)
  const router = useRouter()
  const handleCopy = (text) => navigator.clipboard.writeText(text);
  const sendToWhatsApp = (text) => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  const sendToGmail = (text) => {
    const subject = encodeURIComponent("chatAI");
    const body = encodeURIComponent(text);
    const gmailUrl = `https://mail.google.com/mail/u/0/?fs=1&to=&su=${subject}&body=${body}&tf=cm`;
    window.open(gmailUrl, "_blank");
  };

  // ✅ Get email from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("email")
      if (email) {
        setUserEmail(email)
      } else {
        setMessages([
          { role: "bot", text: "⚠️ Please log in again. User session is missing." }
        ])
      }
    }
  }, [])

  // ✅ Fetch previous chat history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userEmail) return
      try {
        const res = await axios.get(`https://askdemia1.onrender.com/chat/history/${userEmail}`)
        if (res.data && res.data.messages) {
          setMessages(res.data.messages)
        }
      } catch (err) {
        console.error("Failed to fetch chat history:", err)
      }
    }

    fetchHistory()
  }, [userEmail])

  const sendMessage = async () => {
    if (!input.trim()) return
    if (!userEmail) {
      console.error("User email is missing.")
      setMessages((prev) => [...prev, { role: "bot", text: "❗ Please login to use chat." }])
      return
    }

    const userMessage = { role: "user", text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)
    setError("")

    try {
      const res = await axios.post("https://askdemia1.onrender.com/chat", {
        user_id: userEmail,
        message: input,
      })

      if (res.data && res.data.response) {
        setMessages((prev) => [...prev, { role: "bot", text: res.data.response }])
      } else {
        setMessages((prev) => [...prev, { role: "bot", text: "Unexpected response format from server." }])
      }
    } catch (err) {
      console.error("Error sending message:", err)
      setError("Something went wrong. Try again.")
      setMessages((prev) => [...prev, { role: "bot", text: "⚠️ Server error. Please try again later." }])
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login"); // Or "/"
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50); // Small delay to allow rendering layout
  }, [messages]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-white/20 z-50 transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Askdemia
            </span>
          </div>
          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/ask-doubt" className="flex items-center space-x-3 px-4 py-3 bg-purple-100 text-purple-700 rounded-xl">
              <Lightbulb className="w-5 h-5" />
              <span>Chatbot</span>
            </Link>
            <Link href="/chat1" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <MessageCircleMore className="w-5 h-5" />
              <span>Chat with Friends</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </nav>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Section */}
      <div className="flex flex-col flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-md border-b border-white/20 px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            {/* Left section: Menu toggle + Heading + Back Link */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link
                href="/dashboard"
                className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                BackDashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">Chatbot</h1>
            </div>

            {/* Right section: Notification + Profile */}
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Chat Body */}
        <main className="flex-1 relative overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-32">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xl px-4 py-3 rounded-xl shadow-md ${msg.role === "user"
                      ? "bg-purple-100 text-right rounded-br-none"
                      : "bg-blue-100 text-left rounded-bl-none"
                      }`}
                  >
                    <div className="text-xs font-semibold mb-1">
                      {msg.role === "user" ? "You" : "Bot"}
                    </div>
                    <div className="markdown-content text-sm text-gray-800">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p>{children}</p>,
                          a: ({ href, children }) => (
                            <a href={href} style={{ color: '#6cf', textDecoration: 'underline' }}>{children}</a>
                          ),
                          li: ({ children }) => <li>{children}</li>,
                          code: ({ inline, children }) =>
                            inline ? (
                              <code style={{ backgroundColor: '#333', padding: '2px 6px', borderRadius: '4px' }}>{children}</code>
                            ) : (
                              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                <pre style={{ backgroundColor: 'var(--background)', padding: '12px', borderRadius: '6px', overflowX: 'auto' }}>
                                  <code>{Array.isArray(children) ? children.join("") : children}</code>
                                </pre>
                                <div style={{ position: 'absolute', top: 6, right: 8, display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => handleCopy(Array.isArray(children) ? children.join("") : children)}
                                    title="Copy"
                                    className="action-button"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                  >
                                    <FaCopy />
                                  </button>
                                  <button
                                    onClick={() => sendToWhatsApp(children)}
                                    title="Share via WhatsApp"
                                    className="action-button"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                  >
                                    <FaWhatsapp />
                                  </button>
                                  <button
                                    onClick={() => sendToGmail(children)}
                                    title="Send via Email"
                                    className="action-button"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                  >
                                    <FaEnvelope />
                                  </button>
                                </div>
                              </div>
                            ),
                          table: ({ children }) => (
                            <table style={{
                              width: '100%',
                              borderCollapse: 'collapse',
                              marginTop: '10px',
                              marginBottom: '10px',
                              border: '1px solid #888'
                            }}>
                              {children}
                            </table>
                          ),
                          thead: ({ children }) => <thead style={{ backgroundColor: '#e5e7eb' }}>{children}</thead>,
                          tbody: ({ children }) => <tbody>{children}</tbody>,
                          tr: ({ children }) => <tr style={{ borderBottom: '1px solid #888' }}>{children}</tr>,
                          th: ({ children }) => (
                            <th style={{
                              border: '1px solid #888',
                              padding: '6px 10px',
                              textAlign: 'left',
                              backgroundColor: '#d1d5db'
                            }}>{children}</th>
                          ),
                          td: ({ children }) => (
                            <td style={{
                              border: '1px solid #888',
                              padding: '6px 10px',
                              textAlign: 'left'
                            }}>{children}</td>
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                      {msg.role === "bot" && (
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => handleCopy(msg.text)}
                            title="Copy bot message"
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600 transition"
                          >
                            <FaCopy />
                            Copy
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && <div className="text-sm text-gray-500 animate-pulse">Bot is typing...</div>}
              {error && <div className="text-sm text-red-500">{error}</div>}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Fixed at Bottom */}
            <div className="fixed bottom-0 left-0 right-0 lg:ml-64 bg-white/90 backdrop-blur-lg border-t border-white/20 px-6 py-4 z-50">
              <div className="flex items-center gap-2 max-w-7xl mx-auto">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:scale-105 transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}