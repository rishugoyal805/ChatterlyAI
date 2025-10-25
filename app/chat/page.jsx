"use client";
import { Inter } from "next/font/google";
import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Lightbulb,
  Menu,
  X,
  User,
  LogOut,
  ArrowLeft,
  Send,
  LayoutDashboard,
  MessageCircleMore,
  Bell,
  MessageSquareDiff,
  Share,
  Lock,
  EllipsisVertical,
  Edit,
  Trash2,
  Pin,
  Mail,
  Sparkles,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaCopy, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { RiEditLine } from "react-icons/ri";
import { getSession } from "next-auth/react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AskDoubtPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFriend, setSelectedFriend] = useState(null); // info of the chatting friend
  const [chatboxId, setChatboxId] = useState(null); // current chatbox ID
  const [friends, setFriends] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socket = useRef(null);
  const router = useRouter();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [updatedChatboxId, setUpdatedChatboxId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const handleCopy = (text) => navigator.clipboard.writeText(text);
  const sendToWhatsApp = (text) =>
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  const sendToGmail = (text) => {
    const subject = encodeURIComponent("Chatterly");
    const body = encodeURIComponent(text);
    const gmailUrl = `https://mail.google.com/mail/u/0/?fs=1&to=&su=${subject}&body=${body}&tf=cm`;
    window.open(gmailUrl, "_blank");
  };

  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [newFriendInput, setNewFriendInput] = useState("");

  // ✅ Get email from localStorage
  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        localStorage.setItem("email", session.user.email);
      } else {
        setMessages([
          {
            role: "bot",
            text: "⚠️ Please log in again. User session is missing.",
          },
        ]);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (!userEmail) return;
    const fetchFriends = async () => {
      const res = await fetch(`/api/get-friends?email=${userEmail}`);
      const data = await res.json();
      setFriends(
        data.friends.sort(
          (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
        )
      );

      // ✅ Load last chat after setting friends
      const lastId = localStorage.getItem("lastChatboxId");
      if (lastId) {
        const last = data.friends.find((f) => f.chatbox_id === lastId);
        if (last) {
          handleFriendSelect(last);
        }
      }
    };
    fetchFriends();
  }, [userEmail]);

  // useEffect(() => {
  //   const handleGlobalKeydown = (e) => {
  //     const isAllowed = /^[a-zA-Z0-9 ]$/.test(e.key)
  //     if (isAllowed && document.activeElement !== inputRef.current) {
  //       e.preventDefault()
  //       inputRef.current?.focus()
  //       setInput((prev) => prev + e.key)
  //     }
  //   }
  //   window.addEventListener("keydown", handleGlobalKeydown)
  //   return () => {
  //     window.removeEventListener("keydown", handleGlobalKeydown)
  //   }
  // }, [])

  useEffect(() => {
    if (!userEmail || !chatboxId) return;
    if (!socket.current) {
      socket.current = io("https://chatterly-backend-8dwx.onrender.com", {
        transports: ["websocket"], // ensure real-time connection
      });
    }
    socket.current.emit("join-room", chatboxId);

    // 🟢 Message edited
    socket.current.on("message-edited", ({ messageId, newText }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, text: newText } : msg
        )
      );
    });

    // 🔴 Message deleted
    socket.current.on("message-deleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    socket.current.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]);

      // Dynamically reorder the friends list
      setFriends((prevFriends) => {
        const updated = prevFriends.map((f) => {
          if (f.chatbox_id === message.chatboxId) {
            return { ...f, lastModified: new Date().toISOString() };
          }
          return f;
        });
        const sorted = updated.sort(
          (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
        );

        setUpdatedChatboxId(message.chatboxId);
        setTimeout(() => setUpdatedChatboxId(null), 800); // reset after animation

        return sorted;
      });
    });

    return () => {
      socket.current?.off("receive-message");
      socket.current?.off("message-deleted");
      socket.current?.off("message-edited");
      socket.current?.disconnect();
      socket.current = null;
    };
  }, [chatboxId, userEmail]);

  //editing the name of a chat
  const handleEditAiChatName = async (chat) => {
    const newName = prompt("Enter new chat name", chat.name);
    if (!newName?.trim()) return;

    await fetch("/api/edit-ai-chat-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: chat._id, newName }),
    });

    window.location.reload();
  };
  // handling the deletion of an AI chat
  const handleDeleteAiChat = async (chat) => {
    if (
      !confirm(
        "Are you sure you want to delete this chat and all related data?"
      )
    )
      return;

    await fetch("/api/delete-ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: chat._id, convoId: chat.convoId }),
    });

    window.location.reload();
  };
  // handling the pinning of an AI chat
  const handlePinAiChat = async (chat) => {
    await fetch("/api/pin-ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: chat._id }),
    });

    window.location.reload();
  };

  // const handleNewChat = async () => {
  //   const searchValue = prompt(
  //     "Enter your friend's email or nickname to start a new chat:"
  //   );

  //   const userEmail = localStorage.getItem("email");
  //   if (!searchValue || !userEmail) return;

  //   const existingChat = friends.find(
  //     (frnd) => frnd.email === searchValue || frnd.nickname === searchValue
  //   );
  //   if (existingChat) {
  //     handleFriendSelect(existingChat);
  //     return;
  //   }

  //   try {
  //     const res = await fetch("/api/create-chatbox", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ userEmail, friendEmail: searchValue }),
  //     });

  //     const data = await res.json();

  //     if (data.success) {
  //       const newFriend = {
  //         chatbox_id: data.chatbox._id,
  //         email: data.friend.email,
  //         nickname: data.friend.nickname,
  //         lastModified: new Date().toISOString(),
  //       };

  //       // Add friend to user's frnd_arr
  //       const response = await fetch("/api/add-friend", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           userEmail,
  //           friendEmail: newFriend.email,
  //           chatboxId: newFriend.chatbox_id,
  //         }),
  //       });

  //       const addFriendData = await response.json();

  //       if (!response.ok || !addFriendData.success) {
  //         alert(
  //           addFriendData.message || "Something went wrong while adding friend."
  //         );
  //         return; // exit early if add-friend failed
  //       }

  //       setFriends((prev) => {
  //         const updated = [...prev, newFriend];
  //         return updated.sort(
  //           (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
  //         );
  //       });

  //       handleFriendSelect(newFriend);
  //     } else {
  //       alert(data.message || "Failed to create chat.");
  //     }
  //   } catch (err) {
  //     alert("Something went wrong.");
  //   }
  // };

  // Open the modal
  const openAddFriendModal = () => {
    setIsAddFriendModalOpen(true);
  };

  // Handle form submission
  const handleAddFriendSubmit = async () => {
    const searchValue = newFriendInput.trim();
    const userEmail = localStorage.getItem("email");
    if (!searchValue || !userEmail) return;

    const existingChat = friends.find(
      (frnd) => frnd.email === searchValue || frnd.nickname === searchValue
    );
    if (existingChat) {
      handleFriendSelect(existingChat);
      setIsAddFriendModalOpen(false);
      return;
    }

    try {
      const res = await fetch("/api/create-chatbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, friendEmail: searchValue }),
      });

      const data = await res.json();

      if (data.success) {
        const newFriend = {
          chatbox_id: data.chatbox._id,
          email: data.friend.email,
          nickname: data.friend.nickname,
          lastModified: new Date().toISOString(),
        };

        await fetch("/api/add-friend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail,
            friendEmail: newFriend.email,
            chatboxId: newFriend.chatbox_id,
          }),
        });

        setFriends((prev) =>
          [...prev, newFriend].sort(
            (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
          )
        );

        handleFriendSelect(newFriend);
        setIsAddFriendModalOpen(false);
        setNewFriendInput("");
      } else {
        alert(data.message || "Failed to create chat.");
      }
    } catch (err) {
      alert("Something went wrong.");
    }
  };


  const handleFriendSelect = async (friend) => {
    setSelectedFriend(friend);
    localStorage.setItem("lastChatboxId", friend.chatbox_id);

    // Step 1: Fetch chatbox details
    const res = await fetch(`/api/get-chatbox?chatbox_id=${friend.chatbox_id}`);
    const data = await res.json();

    const messageIds = data.chatbox.messages;

    // Step 2: Fetch full message objects using the message ObjectIds
    const msgRes = await fetch("/api/get-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageIds }),
    });

    const { messages: fullMessages } = await msgRes.json();

    // Step 3: Update state
    setChatboxId(data.chatbox._id);
    setMessages(fullMessages); // fullMessages is an array of complete message objects
  };

  const sendMessage = () => {
    if (!input.trim() || !chatboxId || !userEmail) return;
    const message = {
      senderEmail: userEmail,
      roomId: chatboxId,
      text: input,
    };

    socket.current.emit("send-message", message); // send to server
    // setMessages((prev) => [...prev, message]);
    setInput("");
    // ✅ Move this chat to top immediately on send
    setFriends((prevFriends) => {
      const updated = prevFriends.map((f) => {
        if (f.chatbox_id === chatboxId) {
          return { ...f, lastModified: new Date().toISOString() };
        }
        return f;
      });
      return updated.sort(
        (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
      );
    });
  };

  const handleEditMessage = (index) => {
    setEditingIndex(index);
    setEditingText(messages[index].text);
  };

  const confirmEditMessage = async () => {
    const updatedMsg = messages[editingIndex];

    const res = await fetch("/api/edit-chat-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: updatedMsg._id,
        newText: editingText,
      }),
    });

    const result = await res.json();

    if (result.success) {
      const newMessages = [...messages];
      newMessages[editingIndex].text = editingText;
      setMessages(newMessages);
      setEditingIndex(null);
      setEditingText("");

      // ✅ Emit socket event to update other user
      socket.current?.emit("edit-message", {
        messageId: updatedMsg._id,
        newText: editingText,
        roomId: chatboxId, // required for server to emit to room
      });
    } else {
      alert("Failed to edit message.");
    }
  };

  const handleDeleteMessage = async (index) => {
    const msg = messages[index];
    const res = await fetch("/api/delete-chat-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: msg._id,
        chatboxId: chatboxId,
      }),
    });

    const result = await res.json();

    if (result.success) {
      setMessages((prev) => prev.filter((_, i) => i !== index));

      // ✅ Emit socket event to update other user
      socket.current?.emit("delete-message", {
        messageId: msg._id,
        roomId: chatboxId,
      });
    } else {
      alert("Failed to delete message.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("lastChatboxId");
      localStorage.removeItem("email");
      router.push("/login"); // Or "/"
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-white/20 z-50 transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Chatterly
              </span>
            </div>

            {/* Close button pushed to the right */}
            <div className="flex-1 flex justify-end lg:hidden">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-md"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/ask-doubt"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              <Lightbulb className="w-5 h-5" />
              <span>Chat</span>
            </Link>

            <Link
              href="/chat"
              className="flex items-center space-x-3 px-4 py-3 bg-purple-100 text-purple-700 rounded-xl transition-colors"
            >
              <MessageCircleMore className="w-5 h-5" />
              <span>Chat with Friends</span>
            </Link>
            {/* <Link
              href="https://v0.dev/"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              <span>Webapp Builder</span>
            </Link> */}
            {/* <button
              onClick={handleNewChat}
              className="w-full text-left px-4 py-2 mb-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl transition-colors"
            >
              ➕ New Friend Chat
            </button> */}
            <button
              onClick={openAddFriendModal}
              className="w-full text-left px-4 py-2 mb-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl transition-colors"
            >
              ➕ New Friend Chat
            </button>
            {/* <Link href="/profile" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link> */}
            {/* {friends.map((frnd, i) => (
          <button */}
            <AnimatePresence>
              {friends.map((frnd) => (
                <div key={frnd.chatbox_id} className="relative group">
                  <button
                    onClick={() => handleFriendSelect(frnd)}
                    className={`w-full text-left px-4 py-2 rounded-xl transition-colors transform duration-300 ${selectedFriend?.chatbox_id === frnd.chatbox_id
                      ? "bg-purple-200 text-purple-800"
                      : "hover:bg-gray-100 text-gray-700"
                      } ${updatedChatboxId === frnd.chatbox_id
                        ? "scale-[1.03] shadow-md"
                        : ""
                      }`}
                  >
                    <span className="block truncate max-w-full">
                      {frnd.nickname || frnd.email}
                    </span>
                  </button>

                  {/* 3-dot menu trigger */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setMenuOpenId((prev) =>
                        prev === frnd.chatbox_id ? null : frnd.chatbox_id
                      );
                    }}
                    className="absolute top-[25%] right-2 p-1 hover:bg-gray-200 rounded"
                  >
                    <EllipsisVertical size={16} />
                  </button>

                  {/* Dropdown menu */}
                  {menuOpenId === frnd.chatbox_id && (
                    <div className="absolute right-2 top-8 bg-white shadow-md rounded-md border z-10 w-40 text-sm overflow-hidden">
                      <button
                        onClick={() => handleEditAiChatName(frnd)}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                      >
                        <Edit size={14} /> Edit Name
                      </button>
                      <button
                        onClick={() => handleDeleteAiChat(frnd)}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left text-red-600"
                      >
                        <Trash2 size={14} /> Delete Chat
                      </button>
                      <button
                        onClick={() => handlePinAiChat(frnd)}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                      >
                        <Pin size={14} /> Pin to Top
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </AnimatePresence>
          </nav>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full"
          >
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
                {isSidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              {/* <Link
                href="/dashboard"
                className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link> */}
              <h1 className="text-2xl font-bold text-gray-800">
                Chat with Friends
              </h1>
            </div>

            {/* Right section: Notification + Profile */}
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/profile">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center cursor-pointer">
                  <User className="w-5 h-5 text-white" />
                </div>
              </Link>
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
                  className={`flex ${msg.senderEmail === userEmail
                    ? "justify-end"
                    : "justify-start"
                    }`}
                >
                  <div
                    className={`px-4 py-3 rounded-xl shadow-md max-w-[100vw] md:max-w-md ${msg.senderEmail === userEmail
                      ? "bg-purple-100 text-right rounded-br-none"
                      : "bg-blue-100 text-left rounded-bl-none self-start"
                      }`}
                  >
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      {msg.senderEmail === userEmail
                        ? "You"
                        : selectedFriend?.nickname || "Friend"}
                    </div>

                    <div className="markdown-content text-sm text-gray-800 max-w-[90vw] md:max-w-md overflow-x-auto whitespace-pre-wrap break-words">
                      {editingIndex === idx ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full p-2 border rounded"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2 text-sm">
                            <button
                              onClick={confirmEditMessage}
                              className="text-green-600 hover:underline"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingIndex(null);
                                setEditingText("");
                              }}
                              className="text-gray-600 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => {
                              const isPre = React.Children.toArray(
                                children
                              ).some(
                                (child) =>
                                  typeof child === "object" &&
                                  child?.type === "pre"
                              );
                              return isPre ? (
                                <>{children}</>
                              ) : (
                                <p>{children}</p>
                              );
                            },
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                style={{
                                  color: "#6cf",
                                  textDecoration: "underline",
                                }}
                              >
                                {children}
                              </a>
                            ),
                            li: ({ children }) => <li>{children}</li>,
                            code: ({ inline, children }) =>
                              inline ? (
                                <code
                                  style={{
                                    backgroundColor: "#333",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {children}
                                </code>
                              ) : (
                                <div
                                  style={{
                                    position: "relative",
                                    marginBottom: "1rem",
                                  }}
                                >
                                  <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm max-w-full">
                                    <code>
                                      {typeof children === "string"
                                        ? children
                                        : Array.isArray(children)
                                          ? children.join("")
                                          : ""}
                                    </code>
                                  </pre>
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: 6,
                                      right: 8,
                                      display: "flex",
                                      gap: "8px",
                                    }}
                                  >
                                    <button
                                      onClick={() =>
                                        handleCopy(
                                          Array.isArray(children)
                                            ? children.join("")
                                            : children
                                        )
                                      }
                                      title="Copy"
                                      className="action-button"
                                      style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <FaCopy />
                                    </button>
                                    <button
                                      onClick={() => sendToWhatsApp(children)}
                                      title="Share via WhatsApp"
                                      className="action-button"
                                      style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <FaWhatsapp />
                                    </button>
                                    <button
                                      onClick={() => sendToGmail(children)}
                                      title="Send via Email"
                                      className="action-button"
                                      style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <FaEnvelope />
                                    </button>
                                  </div>
                                </div>
                              ),
                            table: ({ children }) => (
                              <div style={{ overflowX: "auto" }}>
                                <table className="min-w-[500px] table-auto border border-gray-400 text-sm">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead style={{ backgroundColor: "#e5e7eb" }}>
                                {children}
                              </thead>
                            ),
                            tbody: ({ children }) => <tbody>{children}</tbody>,
                            tr: ({ children }) => (
                              <tr style={{ borderBottom: "1px solid #888" }}>
                                {children}
                              </tr>
                            ),
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
                          suppressHydrationWarning
                        >
                          {msg.text}
                        </ReactMarkdown>
                      )}
                    </div>

                    {msg.senderEmail === userEmail && (
                      <div className="flex gap-4 justify-end items-center mt-2 text-xs text-gray-700">
                        <button
                          onClick={() => handleEditMessage(idx)}
                          title="Edit message"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <RiEditLine />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(idx)}
                          title="Delete message"
                          className="flex items-center gap-1 text-red-600 hover:underline"
                        >
                          <MdDelete />
                          <span>Delete</span>
                        </button>
                        <button
                          onClick={() => handleCopy(msg.text)}
                          title="Copy message"
                          className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition"
                        >
                          <FaCopy />
                          <span>Copy</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <p className="text-center text-gray-400">Sending...</p>
              )}
              {!loading && messages.length === 0 && (
                <p className="text-center text-gray-500">
                  Start the conversation!
                </p>
              )}
              {error && <div className="text-sm text-red-500">{error}</div>}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Fixed at Bottom */}
            {/* <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-white/90 backdrop-blur-md border-t border-gray-200">
              <div className="flex items-center gap-2"> */}
            <div className="fixed bottom-0 left-0 right-0 lg:ml-64 bg-white/90 backdrop-blur-lg border-t border-white/20 px-6 py-4 z-50">
              <div className="flex items-center gap-2 max-w-7xl mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendMessage(); // only sends once
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}
                  className={`bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full transition ${!input.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:opacity-90"
                    }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      {isAddFriendModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Friend
            </h2>
            <input
              type="text"
              value={newFriendInput}
              onChange={(e) => setNewFriendInput(e.target.value)}
              placeholder="Enter friend's email or nickname"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsAddFriendModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFriendSubmit}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}