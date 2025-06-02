"use client"
import { Inter } from 'next/font/google'
import { useState, useEffect, useRef } from "react"
import { BookOpen, Lightbulb, Menu, X, User, LogOut, ArrowLeft, Send, LayoutDashboard, MessageCircleMore, Bell } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLayoutEffect } from "react"
import axios from "axios"
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { FaCopy, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { getSession } from "next-auth/react"

export default function AskDoubtPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedFriend, setSelectedFriend] = useState(null);  // info of the chatting friend
  const [chatboxId, setChatboxId] = useState(null);            // current chatbox ID
  const [friends, setFriends] = useState([]);
  const [userEmail, setUserEmail] = useState("")
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const socket = useRef(null);
  const router = useRouter()
  const handleCopy = (text) => navigator.clipboard.writeText(text);
  const sendToWhatsApp = (text) => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  const sendToGmail = (text) => {
    const subject = encodeURIComponent("Chatterly");
    const body = encodeURIComponent(text);
    const gmailUrl = `https://mail.google.com/mail/u/0/?fs=1&to=&su=${subject}&body=${body}&tf=cm`;
    window.open(gmailUrl, "_blank");
  };

  // ✅ Get email from localStorage
  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession()
      if (session?.user?.email) {
        setUserEmail(session.user.email)
      } else {
        setMessages([
          { role: "bot", text: "⚠️ Please log in again. User session is missing." }
        ])
      }
    }
    fetchSession()
  }, [])

  useEffect(() => {
    if (!userEmail) return;
    const fetchFriends = async () => {
      const res = await fetch(`/api/get-friends?email=${userEmail}`);
      const data = await res.json();
      setFriends(data.friends);
    };
    fetchFriends();
  }, [userEmail]);

  useEffect(() => {
    const handleGlobalKeydown = (e) => {
      const isAllowed = /^[a-zA-Z0-9 ]$/.test(e.key)
      if (isAllowed && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()

        // Append the key to the input manually
        setInput((prev) => prev + e.key)
      }
    }

    window.addEventListener("keydown", handleGlobalKeydown)

    return () => {
      window.removeEventListener("keydown", handleGlobalKeydown)
    }
  }, [])

  useEffect(() => {
    if (!userEmail || !chatboxId) return;

    if (!socket.current) {
      socket.current = io("https://chatterly-backend-8dwx.onrender.com", {
        transports: ["websocket"], // ensure real-time connection
      });
    }

    socket.current.emit("join-room", chatboxId);

    socket.current.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.current?.off("receive-message");
    };
  }, [chatboxId, userEmail]);

  const handleNewChat = async () => {
    const friendEmail = prompt("Enter your friend's email to start a new chat:");

    if (!friendEmail || friendEmail === userEmail) return;

    // Check if chat already exists
    const existingChat = friends.find(frnd => frnd.email === friendEmail);
    if (existingChat) {
      handleFriendSelect(existingChat); // Open existing chat
      return;
    }

    try {
      const res = await fetch("/api/create-chatbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, friendEmail }),
      });
      const data = await res.json();

      if (data.success) {
        const newFriend = {
          chatbox_id: data.chatbox._id,
          email: friendEmail,
          nickname: null, // or let user set nickname
        };

        setFriends(prev => [...prev, newFriend]);
        handleFriendSelect(newFriend); // Open new chat
      } else {
        alert(data.message || "Failed to create chat.");
      }
    } catch (err) {
      console.error("Error creating chat:", err);
      alert("Something went wrong.");
    }
  };

  const handleFriendSelect = async (friend) => {
    setSelectedFriend(friend);

    // Get the chatbox details using chatbox_id
    const res = await fetch(`/api/get-chatbox?chatbox_id=${friend.chatbox_id}`);
    const data = await res.json();
    setChatboxId(data.chatbox._id);
    setMessages(data.chatbox.messages); // assuming populated messages
  };

  const sendMessage = () => {
    if (!input.trim() || !chatboxId || !userEmail) return;

    const message = {
      senderEmail: userEmail,
      chatboxId,
      text: input,
    };

    socket.current.emit("send-message", message); // send to server
    setMessages((prev) => [...prev, message]);
    setInput("");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login"); // Or "/"
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
            <Link href="/ask-doubt" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl">
              <Lightbulb className="w-5 h-5" />
              <span>Chat</span>
            </Link>
            <Link href="/chat" className="flex items-center space-x-3 px-4 py-3 bg-purple-100 text-purple-700 rounded-xl transition-colors">
              <MessageCircleMore className="w-5 h-5" />
              <span>Chat with Friends</span>
            </Link>
            <button
              onClick={handleNewChat}
              className="w-full text-left px-4 py-2 mb-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl transition-colors"
            >
              ➕ New Chat
            </button>
            {/* <Link href="/profile" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link> */}
            {friends.map((frnd, i) => (
              <button
                key={i}
                onClick={() => handleFriendSelect(frnd)}
                className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${selectedFriend?.chatbox_id === frnd.chatbox_id
                  ? "bg-purple-200 text-purple-800"
                  : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                <span className="block truncate max-w-full">{frnd.nickname || frnd.email}</span>
              </button>
            ))}
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
              <h1 className="text-2xl font-bold text-gray-800">Chat with Friend</h1>
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
                  className={`flex ${msg.senderEmail === userEmail ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-3 rounded-xl shadow-md ${msg.senderEmail === userEmail
                      ? "max-w-md bg-purple-100 text-right rounded-br-none"
                      : "w-full md:max-w-4xl overflow-x-auto bg-blue-100 text-left rounded-bl-none"
                      }`}
                  >
                    <div className="text-xs font-semibold mb-1">
                      {msg.senderEmail === userEmail ? "You" : selectedFriend?.nickname || "Friend"}
                    </div>
                    <div className="markdown-content text-sm text-gray-800 overflow-x-auto">
                      <div className="min-w-full">
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
                                <code style={{ backgroundColor: '#333', padding: '2px 6px', borderRadius: '4px' }}>
                                  {children}
                                </code>
                              ) : (
                                <div style={{ position: 'relative', marginBottom: '1rem' }} supresshydrationerror>
                                  <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm">
                                    <code>
                                      {typeof children === 'string'
                                        ? children
                                        : Array.isArray(children)
                                          ? children.join('')
                                          : ''}
                                    </code>
                                  </pre>
                                  <div style={{ position: 'absolute', top: 6, right: 8, display: 'flex', gap: '8px' }}>
                                    <button
                                      onClick={() => handleCopy(Array.isArray(children) ? children.join('') : children)}
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
                              <div style={{ overflowX: 'auto' }}>
                                <table className="min-w-[500px] table-auto border border-gray-400 text-sm">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => <thead style={{ backgroundColor: '#e5e7eb' }}>{children}</thead>,
                            tbody: ({ children }) => <tbody>{children}</tbody>,
                            tr: ({ children }) => <tr style={{ borderBottom: '1px solid #888' }}>{children}</tr>,
                            th: ({ children }) => (
                              <th className="border border-gray-400 bg-gray-200 px-4 py-2 text-left font-medium">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="border border-gray-300 px-4 py-2 text-left">
                                {children}
                              </td>
                            ),
                          }}
                          supresshydrationerror>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
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
              {loading && <p className="text-center text-gray-400">Sending...</p>}
              {!loading && messages.length === 0 && (
                <p className="text-center text-gray-500">Start the conversation!</p>
              )}
              {error && <div className="text-sm text-red-500">{error}</div>}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Fixed at Bottom */}
            {/* <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-white/90 backdrop-blur-md border-t border-gray-200">
              <div className="flex items-center gap-2"> */}
            < div className="fixed bottom-0 left-0 right-0 lg:ml-64 bg-white/90 backdrop-blur-lg border-t border-white/20 px-6 py-4 z-50" >
              <div className="flex items-center gap-2 max-w-7xl mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}

                  className={`bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full transition ${!input.trim() ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                    }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}