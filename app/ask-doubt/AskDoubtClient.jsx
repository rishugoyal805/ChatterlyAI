"use client";
import FallbackLayout from "./FallbackLayout";

import { useState, useEffect, useRef } from "react";

import {
  Lightbulb,
  Menu,
  X,
  User,
  LogOut,
  Send,
  LayoutDashboard,
  MessageCircleMore,
  MessageSquareDiff,
  Share,
  Lock,
  EllipsisVertical,
  Edit,
  Trash2,
  Pin,
  Mail,
} from "lucide-react";
import { RiUnpinLine } from "react-icons/ri";
import { TiPinOutline } from "react-icons/ti";
import { Mic, MicOff } from "lucide-react";
import { MdDelete } from "react-icons/md";
import { RiEditLine } from "react-icons/ri";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, Suspense } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import remarkGfm from "remark-gfm";
import {
  FaCopy,
  FaWhatsapp,
  FaEnvelope,
  FaVolumeUp,
  FaPause,
  FaPlay,
  FaStop,
} from "react-icons/fa";
import { getSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import React from "react";
import { io } from "socket.io-client";

export default function AskDoubtClient() {
  const searchParams = useSearchParams();
  const convoId = searchParams.get("convoId") || "Temporary Chat";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [user_ai_chats, setUser_ai_chats] = useState([]);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const [user, setUser] = useState({ name: "", image: "" });
  const [editingChatId, setEditingChatId] = useState(null);
  const [newChatName, setNewChatName] = useState("");

  const [fullscreenImage, setFullscreenImage] = useState(null);

  const [showShare, setShowShare] = useState(false);
  const [shared, setShared] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const socket = useRef(null);
  const [selectedConvoId, setSelectedConvoId] = useState(null);
  //text message by speaking user
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  // const searchParams = useSearchParams();
  // const convoId = searchParams.get("convoId");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const reNameRef = useRef(null);
  const router = useRouter();
  const handleCopy = (text) => navigator.clipboard.writeText(text);
  const sendToWhatsApp = (text) =>
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  const sendToGmail = (text, recipientEmail) => {
    const subject = encodeURIComponent("ChatterlyAI");
    const body = encodeURIComponent(text);
    const to = encodeURIComponent(recipientEmail || "");
    const gmailUrl = `https://mail.google.com/mail/u/0/?fs=1&to=${to}&su=${subject}&body=${body}&tf=cm`;
    window.open(gmailUrl, "_blank");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (reNameRef.current && !reNameRef.current.contains(event.target)) {
        setEditingChatId(null); // cancel editing
        setNewChatName(""); // optional: reset input value
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [reNameRef]);
  //listening ai message
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef(null);

  const menuRef = useRef(null);

  useEffect(() => {
    if (!userEmail) return;
    socket.current = io(process.env.NEXT_PUBLIC_AI_SOCKET_BACKEND_URL); // URL of socket server

    socket.current.emit("join-user", userEmail);

    // ✅ join chat room if convoId exists
    if (convoId && convoId !== "Temporary Chat") {
      socket.current.emit("join-chat", convoId);
    }

    // When a chat is shared with you
    socket.current.on("chat-shared-update", ({ chatbox }) => {
      setUser_ai_chats((prev) => {
        const exists = prev.some((chat) => chat._id === chatbox._id);
        if (exists) return prev;
        return [...prev, chatbox];
      });
    });

    socket.current.on(
      "receive-message",
      ({ chatboxId, senderEmail, text, isImg, imageUrl }) => {
        if (!text?.trim()) return;

        setMessages((prev) => [
          ...prev,
          {
            role: senderEmail === "AI" ? "bot" : "user",
            text,
            isImg: !!isImg,
            imageUrl: isImg ? imageUrl : null,
          },
        ]);
      }
    );

    return () => {
      socket.current.disconnect();
    };
  }, [userEmail, convoId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    }

    if (menuOpenId) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpenId]);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session || !session.user) {
        router.push("/login");
        return;
      } else {
        setUser({
          name: session.user.name || "",
          image: session.user.image || "",
        });
      }
    };
    checkAuth();
  }, []);

  // ✅ Get email from localStorage
  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
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

  //fetchUserChats the chats for the user
  const fetchUserChats = async () => {
    try {
      const res = await fetch("/api/fetch-ai-chats");
      const data = await res.json();

      if (!res.ok) {
        console.error("Error loading chats:", data.message);
        return;
      }

      // ensure ownersCount is accessible and mapped properly
      const chats = data.chats?.map((chat) => ({
        ...chat,
        ownersCount: chat.ownersCount ?? 0, // fallback if missing
      }));
      if (chats.length === 0) {
        handleNewChat();
        return; // stop; nothing else to do
      }
      setUser_ai_chats(chats);
      // 🔥 Redirect to latest chat if no convoId is in URL
      if ((!convoId || convoId === "Temporary Chat") && chats.length > 0) {
        router.replace(`/ask-doubt?convoId=${chats[0].convoId}`);
        return; // stop further execution
      }
      // 🔥 If URL already has convoId, highlight it
      if (convoId) {
        setSelectedConvoId(convoId);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchUserChats();
  }, []);

  useEffect(() => {
    if (convoId) {
      setSelectedConvoId(convoId); // 🔥 highlight correct chat
    }
  }, [convoId, setSelectedConvoId]);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text) return;

    // very simple detection: starts with "/img" or "img:" etc
    const isImgRequest =
      text.startsWith("/img") ||
      text.startsWith("img:") ||
      text.startsWith("image:") ||
      text.startsWith("/image");

    if (isImgRequest) {
      await generateImage(text.replace(/^\/?img:?/i, "").trim());
    } else {
      await sendMessage(text);
    }

    setInput("");
  };

  const generateImage = async (prompt) => {
    if (!prompt.trim()) return;
    if (!userEmail) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "❗ Please login,", isImg: false },
      ]);
      return;
    }

    // 1️⃣ Show user prompt in chat
    const userMessage = { role: "user", text: prompt, isImg: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    socket.current.emit("send-message", {
      roomId: convoId,
      senderEmail: userEmail,
      text: prompt,
      isImg: false,
      imageUrl: null,
    });

    setLoading(true);

    try {
      // 2️⃣ Save user message in DB
      const userRes = await fetch("/api/Save-Message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: userEmail,
          text: prompt,
          role: "user",
          isImg: false,
        }),
      });

      const { insertedId: userMessageId } = await userRes.json();

      // 3️⃣ Call HF API and get base64
      const imgRes = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const imgData = await imgRes.json();
      const base64Image = imgData.image;
      // console.log("BASE64 IMAGE:", base64Image);
      // console.log("image DATA:", imgData);

      // 5️⃣ Save AI message (backend uploads to Cloudinary)
      const aiSave = await fetch("/api/Save-Message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: "AI",
          text: prompt,
          role: "ai",
          isImg: true,
          image: base64Image,
        }),
      });
      // console.log("AI SAVE RESPONSE:", aiSave);

      const { insertedId: aiResponseId, imageUrl } = await aiSave.json();

      // 4️⃣ UI update using Cloudinary URL
      const aiMessage = {
        role: "bot",
        text: prompt,
        imageUrl: imageUrl,
        isImg: true,
      };
      // console.log("AI MESSAGE:", aiMessage);
      setMessages((prev) => [...prev, aiMessage]);
      // console.log("IMAGE URL:", imageUrl);
      // 🔥 FIXED socket emit → uses Cloudinary URL
      socket.current.emit("send-message", {
        roomId: convoId,
        senderEmail: "AI",
        text: prompt,
        imageUrl: imageUrl,
        isImg: true,
      });

      // 6️⃣ Link user + AI message as a pair
      await fetch("/api/add-message-pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          convoId,
          userMessageId,
          aiResponseId,
        }),
      });

      await fetchUserChats();
    } catch (err) {
      // console.error("IMAGE GEN ERROR:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ Failed to generate image. Try again.",
          isImg: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!convoId || convoId === "Temporary Chat") return;

    const fetchConversation = async () => {
      try {
        const res = await fetch(`/api/get-conversation?convoId=${convoId}`);

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        // console.log(data);
        // Flatten messages for UI, always use imageUrl
        const formatted = data.messages.flatMap((pair) => [
          {
            id: pair.user?.id || null,
            text: pair.user?.text || "[Missing User Message]",
            role: "user",
            isImg: pair.user?.isImg ?? false,
            imageUrl: pair.user?.imageUrl ?? null, // 🔥 fixed
          },
          {
            id: pair.ai?.id || null,
            text: pair.ai?.text || "[Missing AI Response]",
            role: "ai",
            isImg: pair.ai?.isImg ?? false,
            imageUrl: pair.ai?.imageUrl ?? null, // 🔥 fixed
          },
        ]);

        setMessages(
          formatted.length > 0
            ? formatted
            : [{ text: "Start A Conversation", role: "system", isImg: false }]
        );
      } catch (err) {
        // console.error("Failed to load conversation", err);
        setMessages([
          { text: "Start A Conversation", role: "system", isImg: false },
        ]);
      }
    };

    fetchConversation();
  }, [convoId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!userEmail) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "❗ Please login" },
      ]);
      return;
    }

    // 1️⃣ Push user message to UI
    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    socket.current.emit("send-message", {
      roomId: convoId,
      senderEmail: userEmail,
      text: input,
      isImg: false,
      imageUrl: null,
    });
    setInput("");
    setLoading(true);
    setError("");

    try {
      // 2️⃣ Save user message in DB
      const userRes = await fetch("/api/Save-Message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: userEmail,
          text: input,
          role: "user",
          isImg: false,
          imageUrl: null,
        }),
      });

      const { insertedId: userMessageId } = await userRes.json();
      // 3️⃣ Call AI API to get response
      const aiRes = await axios.post(
        `${process.env.NEXT_PUBLIC_AGENTIC_BACKEND_URL}/chat`,
        {
          user_id: userEmail,
          message: input,
        }
      );

      // console.log("AI RESPONSE:", aiRes);
      const aiText = aiRes?.data?.response || "Unexpected response format.";
      const aiMessage = { role: "bot", text: aiText };

      // 4️⃣ Show AI response in chat
      setMessages((prev) => [...prev, aiMessage]);
      socket.current.emit("send-message", {
        roomId: convoId,
        senderEmail: "AI",
        text: aiText,
        isImg: false,
        imageUrl: null,
      });
      setLoading(false);
      // 5️⃣ Save AI response in DB
      const aiSave = await fetch("/api/Save-Message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: "AI",
          text: aiText,
          role: "ai",
          isImg: false,
          imageUrl: null,
        }),
      });

      const { insertedId: aiResponseId } = await aiSave.json();

      // 6️⃣ Link both messages in conversation
      await fetch("/api/add-message-pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          convoId,
          userMessageId,
          aiResponseId,
        }),
      });

      // 🔥 Update lastModified timestamp
      await fetch("/api/update-last-modified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ convoId }),
      });

      await fetchUserChats(); // Refresh chat list to reflect any changes in chat names
    } catch (err) {
      // console.error("Error sending message:", err);
      setError("Something went wrong. Try again.");
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Server error. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/create-new-chat", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setUser_ai_chats((prevChats) => {
          // Determine where to insert based on priority
          if (data.priority === "high") {
            // Insert after existing pinned chats
            const pinned = prevChats.filter((chat) => chat.priority === "high");
            const normal = prevChats.filter((chat) => chat.priority !== "high");
            return [...pinned, data, ...normal];
          } else {
            // Insert at top of normal chats (after pinned)
            const pinned = prevChats.filter((chat) => chat.priority === "high");
            const normal = prevChats.filter((chat) => chat.priority !== "high");
            return [...pinned, data, ...normal];
          }
        });
        setSelectedConvoId(data.convoId);
        router.push(`/ask-doubt?convoId=${data.convoId}`);
      } else {
        alert(data.message || "Failed to create chat");
      }
    } catch (err) {
      // console.error(err);
      alert("Something went wrong while creating chat.");
    }
  };

  const handleSendShare = async (method) => {
    if (!selectedUser) return alert("Select a user to share with.");
    // if (!shareMessage.trim()) return alert("Please enter a message to share.");
    if (selectedUser.email === userEmail) {
      alert("You cannot share chat with yourself.");
      return;
    }

    try {
      const res = await fetch("/api/share-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: selectedUser.email,
          convoId,
          message: shareMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) alert("Share failed");

      const chatUrl = `${window.location.origin}/ask-doubt?convoId=${convoId}`;
      const fullMessage = `${shareMessage.trim()}\n\nView chat: ${chatUrl}`;

      if (method === "gmail") {
        if (method === "gmail") {
          sendToGmail(fullMessage, selectedUser.email || "");
        } else if (method === "whatsapp") {
          sendToWhatsApp(fullMessage);
        }
      } else if (method === "whatsapp") {
        sendToWhatsApp(fullMessage);
      }

      // alert("Chat shared successfully!");
      setShowShare(false);
      setShared(true);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedUser("");
      setShareMessage("");
    } catch (err) {
      // console.error(err);
      alert(err.message || "Something went wrong");
    }
  };

  //base handling of edit message
  const handleEditMessage = (id) => {
    const msg = messages.find((m) => m.id === id); // or m._id depending on your data shape
    if (!msg) return;

    setEditingIndex(id); // Now storing the actual ID
    setEditingText(msg.text);
  };

  // 1. Duplicated sendMessage logic, renamed to resendEditedMessage
  const resendEditedMessage = async (text, editIndex) => {
    if (!text.trim()) return;

    if (!userEmail) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "❗ Please login to use chat." },
      ]);
      return;
    }
    // ----------------------------------------------------
    // 0️⃣ Detect if this edit is an IMAGE request
    // ----------------------------------------------------
    const isImgRequest =
      text.startsWith("/img") ||
      text.startsWith("img:") ||
      text.startsWith("image:") ||
      text.startsWith("/image");

    const cleanPrompt = isImgRequest
      ? text.replace(/^\/?img:?/i, "").trim()
      : text.trim();

    // 1️⃣ Optimistically remove all messages below the edited one

    const index = messages.findIndex((m) => m.id === editingIndex);
    if (index === -1) return;

    // 1️⃣ Remove all messages below edited one
    setMessages((prev) => prev.slice(0, index + 1));

    // 2️⃣ Replace the edited user message in position
    const updatedUserMsg = {
      id: editingIndex,
      role: "user",
      text: cleanPrompt,
      isImg: false,
    };
    setMessages((prev) => [...prev.slice(0, index), updatedUserMsg]);
    // 3️⃣ Broadcast
    socket.current.emit("send-message", {
      roomId: convoId,
      senderEmail: userEmail,
      text,
      isImg: false,
      imageUrl: null,
    });

    setInput("");
    setLoading(true);
    setError("");

    try {
      // 🔹 Delete old messages from backend (those below current index)
      // await fetch("/api/delete-below", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     convoId,
      //     index: editIndex,
      //   }),
      // });

      // 🔹 Save updated user message
      const userRes = await fetch("/api/Save-Message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: userEmail,
          text: cleanPrompt,
          role: "user",
          isImg: false,
          imageUrl: null,
        }),
      });

      const { insertedId: userMessageId } = await userRes.json();

      // ----------------------------------------------------
      // 🚀 4️⃣ If IMAGE request → run the EXACT same flow as generateImage()
      // ----------------------------------------------------
      if (isImgRequest) {
        // Call your existing API
        const imgRes = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: cleanPrompt }),
        });

        const imgData = await imgRes.json();
        const base64Image = imgData.image;

        // Save AI in DB (Cloudinary upload included)
        const aiSave = await fetch("/api/Save-Message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderName: "AI",
            text: cleanPrompt,
            role: "ai",
            isImg: true,
            image: base64Image,
          }),
        });

        const { insertedId: aiResponseId, imageUrl } = await aiSave.json();

        const aiMessage = {
          role: "bot",
          text: cleanPrompt,
          imageUrl,
          isImg: true,
        };

        setMessages((prev) => [...prev, aiMessage]);

        socket.current.emit("send-message", {
          roomId: convoId,
          senderEmail: "AI",
          text: cleanPrompt,
          imageUrl,
          isImg: true,
        });

        // pair messages
        await fetch("/api/add-message-pair", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            convoId,
            userMessageId,
            aiResponseId,
          }),
        });

        setLoading(false);
        return; // STOP → do not run text chat logic
      }

      // 🔹 Fetch new AI response
      const aiRes = await axios.post(
        `${process.env.NEXT_PUBLIC_AGENTIC_BACKEND_URL}/chat`,
        {
          user_id: userEmail,
          message: text,
        }
      );

      const aiText = aiRes?.data?.response || "Unexpected response format.";
      const aiMessage = { role: "bot", text: aiText };

      // 3️⃣ Add AI message to UI immediately
      setMessages((prev) => [...prev, aiMessage]);
      // 🔥 Broadcast AI message to all clients
      socket.current.emit("send-message", {
        roomId: convoId,
        senderEmail: "AI",
        text: aiText,
      });

      setLoading(false);

      // 🔹 Save AI response to DB
      const aiSave = await fetch("/api/Save-Message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: "AI",
          text: aiText,
          role: "ai",
        }),
      });

      const { insertedId: aiResponseId } = await aiSave.json();

      // 🔹 Link message pair in backend
      await fetch("/api/add-message-pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          convoId,
          userMessageId,
          aiResponseId,
        }),
      });
    } catch (err) {
      // console.error("Error resending message:", err);
      setError("Something went wrong. Try again.");

      // 4️⃣ Show error response in UI
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Server error. Please try again later." },
      ]);
    }

    setLoading(false);
  };

  // 2. confirmEditMessage
  const confirmEditMessage = async () => {
    if (!editingText.trim()) return;

    try {
      const res = await fetch("/api/edit-ai-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: editingIndex,
          convoId,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === editingIndex ? { ...msg, text: editingText } : msg
          )
        );
        setEditingIndex(null);
        // Send it as a new message flow
        await resendEditedMessage(editingText);
      } else {
        alert("Edit failed: " + result.message);
      }
    } catch (err) {
      // console.error("Error editing message:", err);
      alert("Something went wrong.");
    }

    setEditingIndex(null);
    setEditingText("");
  };

  // handling the deletion of a message
  const handleDeleteMessage = async (id) => {
    setMessages((prev) => {
      const idx = prev.findIndex((msg) => msg.id === id);
      if (idx === -1) return prev;

      const idsToRemove = [id];
      if (idx + 1 < prev.length) idsToRemove.push(prev[idx + 1].id);

      return prev.filter((msg) => !idsToRemove.includes(msg.id));
    });

    try {
      await fetch("/api/delete-ai-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: id,
          convoId,
        }),
      });
      // console.log("Deleted completely");
    } catch (err) {
      // console.error("Delete failed:", err);
    }
  };

  //Inline chat rename (no prompt, no reload)
  const handleEditAiChatName = async (chat) => {
    const trimmed = newChatName?.trim();
    if (!trimmed) {
      setEditingChatId(null);
      return;
    }

    await fetch("/api/edit-ai-chat-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: chat._id, newName: trimmed }),
    });

    // Update state instantly (no reload)
    setUser_ai_chats((prev) =>
      prev.map((c) => (c._id === chat._id ? { ...c, name: trimmed } : c))
    );
    setEditingChatId(null);
  };
  // handling the deletion of an AI chat
  const handleDeleteAiChat = async (chat) => {
    // Optimistic UI update
    // setUser_ai_chats((prev) => prev.filter((c) => c._id !== chat._id));
    setMenuOpenId(null);
    setUser_ai_chats((prev) => {
      const index = prev.findIndex((c) => c._id === chat._id);
      const updated = prev.filter((c) => c._id !== chat._id);

      // 🔥 If user is deleting the currently open chat
      if (selectedConvoId === chat.convoId) {
        setMessages([]);

        // CASE 1: There is a next chat → go to it
        if (updated[index]) {
          setSelectedConvoId(updated[index].convoId);
          router.replace(`/ask-doubt?convoId=${updated[index].convoId}`);

          // CASE 2: No next chat, but there is a previous one
        } else if (updated[index - 1]) {
          setSelectedConvoId(updated[index - 1].convoId);
          router.replace(`/ask-doubt?convoId=${updated[index - 1].convoId}`);

          // CASE 3: No chats left → create a new one
        }
        //removed this because there were 2 calls to handleNewChat
        //  else {
        //   handleNewChat();
        // }
      }
      return updated;
    });

    try {
      const res = await fetch("/api/delete-ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: chat._id, convoId: chat.convoId }),
      });

      if (!res.ok) throw new Error("Failed to delete chat");
    } catch (err) {
      // console.error("Delete failed:", err);
      alert("Error deleting chat. Reverting changes.");
      setUser_ai_chats((prev) => [...prev, chat]);
    }
  };

  // handling the pinning and unpining of an AI chat
  const handleTogglePinAiChat = async (chat, pin) => {
    await fetch("/api/pin-ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: chat._id, pin }), // send pin true or false
    });

    window.location.reload();
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // console.warn("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true; // for live preview
    recognition.continuous = false; // stops after one pause in speech

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript + " ";
        }
      }

      if (final) {
        setInput((prev) => prev + " " + final);
      }
      setLiveTranscript(interim);
    };

    recognition.onend = () => {
      setListening(false);
      setLiveTranscript(""); // clear interim preview
    };

    recognition.onerror = (e) => {
      console.error("Speech Recognition Error:", e);
      setListening(false);
      setLiveTranscript("");
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setLiveTranscript("");
    }

    setListening((prev) => !prev);
  };

  const speakText = (text) => {
    if (!text) return;

    // --- CASE 1: Currently speaking & not paused → PAUSE ---
    if (speechSynthesis.speaking && !speechSynthesis.paused && isSpeaking) {
      speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    // --- CASE 2: Currently speaking & paused → RESUME ---
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    // --- CASE 3: Not speaking → start NEW utterance ---
    // (Cancel any leftover old utterances)
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  // handling the logout of a user
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });

      if (res.ok) {
        // Clear LocalStorage
        localStorage.removeItem("auth_token");
        localStorage.clear(); // optional: clears all keys
        sessionStorage.clear();
        // Optional: redirect user
        window.location.href = "/login";
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest("button") // ignore clicks on the toggle button
      ) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  return (
    <Suspense
      fallback={
        <FallbackLayout
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      }
    >
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative">
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-white/20 z-50 transform transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <img
                    src="/chatterly_logo.png"
                    alt="logo"
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ChatterlyAI
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
                <span className="text-sm">Dashboard</span>
              </Link>
              <Link
                href="/ask-doubt"
                className="flex items-center space-x-3 px-4 py-3 bg-purple-100 text-purple-700 rounded-xl"
              >
                <Lightbulb className="w-5 h-5" />
                <span className="text-sm">Chatbot</span>
              </Link>
              <Link
                href="/chat"
                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <MessageCircleMore className="w-5 h-5" />
                <span className="text-sm">Chat with Friends</span>
              </Link>
              <hr className="border-t-2 border-gray-400 rounded-full my-4 shadow-sm" />
              <button
                onClick={handleNewChat}
                className="flex items-center space-x-3 px-4 py-3 bg-green-100 text-green-700 hover:bg-gray-100 rounded-xl transition-colors w-full"
              >
                <MessageSquareDiff className="w-5 h-5" />
                <span className="text-sm">New Chat</span>
              </button>
              <hr className="border-t-2 border-gray-400 rounded-full mb-3 my-4 shadow-sm" />
              {/* Dynamically list previous AI chats */}
              <div className="space-y-1 mt-5 px-2 h-[47dvh]  overflow-y-auto">
                {user_ai_chats.length > 0 ? (
                  user_ai_chats.map((chat) => (
                    <div
                      key={chat._id}
                      // className="w-full text-left px-4 py-2 rounded-xl transition-colors transform duration-300 relative hover:bg-gray-100"
                      className="relative group"
                    >
                      <AnimatePresence>
                        {editingChatId === chat._id ? (
                          <div ref={reNameRef} className="px-4 py-[6px]">
                            <input
                              type="text"
                              value={newChatName}
                              onChange={(e) => setNewChatName(e.target.value)}
                              autoFocus
                              onKeyDown={async (e) => {
                                if (e.key === "Enter")
                                  await handleEditAiChatName(chat);
                                if (e.key === "Escape") setEditingChatId(null);
                              }}
                              className="max-w-[73%] bg-white text-gray-900 border border-purple-10 focus:ring-2 focus:ring-purple-300 rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200"
                              placeholder="Enter new name..."
                            />
                          </div>
                        ) : (
                          <Link
                            href={`/ask-doubt?convoId=${chat.convoId}`}
                            onClick={() => setSelectedConvoId(chat.convoId)}
                            className={`block text-sm px-4 py-2 rounded-lg transition-colors pr-[25%] truncate w-full relative ${
                              selectedConvoId === chat.convoId
                                ? "bg-purple-200 text-purple-800"
                                : "hover:bg-gray-100 text-gray-700"
                            }`}
                            title={chat.name || "New Chat"} // optional: show full name on hover
                          >
                            {chat.name || "New Chat"}
                          </Link>
                        )}
                      </AnimatePresence>

                      {chat.priority === "high" && (
                        <div
                          className="absolute top-[18%] right-8 p-1 text-yellow-600"
                          title="Pinned"
                        >
                          <TiPinOutline size={16} fill="currentColor" />
                        </div>
                      )}
                      {/* 3-dot menu trigger */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setMenuOpenId((prev) =>
                            prev === chat._id ? null : chat._id
                          );
                        }}
                        className="absolute top-[18%] right-2 p-1 hover:bg-gray-200 rounded"
                      >
                        <EllipsisVertical size={16} />
                      </button>

                      {/* Dropdown menu */}
                      {menuOpenId === chat._id && (
                        <div
                          ref={menuRef}
                          className="absolute right-2 top-8 bg-white shadow-md rounded-md border z-10 w-40 text-sm overflow-hidden"
                        >
                          <button
                            onClick={() => {
                              setEditingChatId(chat._id);
                              setNewChatName(chat.name || "");
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                          >
                            <Edit size={14} /> Rename
                          </button>

                          <button
                            type="button"
                            onClick={() => setChatToDelete(chat)}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left text-red-600"
                          >
                            <Trash2 size={14} /> Delete Chat
                          </button>
                          {chat.priority === "high" ? (
                            <button
                              onClick={() => handleTogglePinAiChat(chat, false)}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                            >
                              <RiUnpinLine size={18} /> Unpin
                            </button>
                          ) : (
                            <button
                              onClick={() => handleTogglePinAiChat(chat, true)}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                            >
                              <Pin size={14} /> Pin to Top
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 px-4 italic">
                    No previous chats
                  </p>
                )}
              </div>
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
        {/* {chatToDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Delete this chat?
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                This will permanently delete the chat and all related data.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setChatToDelete(null)}
                  className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteAiChat(chatToDelete);
                    setChatToDelete(null);
                  }}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )} */}
        <AnimatePresence>
          {chatToDelete && (
            <motion.div
              key="deleteConfirmAi"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[999]"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-sm p-6 text-center"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Delete Chat?
                </h2>

                <p className="text-gray-500 text-sm mb-6">
                  This will permanently delete the chat and all related data.
                </p>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setChatToDelete(null)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 
                       text-gray-800 font-medium transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      handleDeleteAiChat(chatToDelete);
                      setChatToDelete(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 
                       text-white font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Section */}
        <div className="flex flex-col flex-1 lg:ml-64">
          {/* Header */}
          <header className="bg-white/70 backdrop-blur-md border-b border-white/20 px-6 py-4 sticky top-0 z-20">
            <div className="flex items-center justify-between">
              {/* Left section: Menu toggle + Heading + Back Link */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors z-[100]"
                >
                  {isSidebarOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
                <Lightbulb className="w-5 h-5" />
                <h1 className=" text-sm md:text-xl lg:text-2xl font-bold text-gray-800">Chatbot</h1>
              </div>

              {/* Right section: Notification + Profile */}
              <div className="flex items-center space-x-4">
                {convoId != "Temporary Chat" && (
                  <button
                    onClick={() => setShowShare(true)}
                    className="flex items-center border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Share className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                )}
                {/* <Link href="/profile">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center cursor-pointer">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </Link> */}
                <Link href="/profile">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 cursor-pointer">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          </header>
          {showShare && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
              <div className="bg-white rounded-xl shadow-xl p-6  max-w-md relative">
                {/* Title */}
                <h2 className="text-lg font-semibold mb-4">Share this Chat</h2>
                {/* Close Button */}
                <button
                  onClick={() => setShowShare(false)}
                  className="absolute top-[25px] right-4 p-1 hover:bg-gray-100 rounded-md"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Add people */}
                <label className="block text-sm font-medium mb-1">
                  Add People
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedUser({ email: e.target.value }); // Directly set email
                  }}
                  placeholder="Enter email"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-4"
                />

                {/* Message */}
                <label className="block text-sm font-medium mb-1">
                  Enter Message to Share
                </label>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Message"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-4"
                  rows={3}
                />

                {/* Access rules */}
                <div className="text-xs text-gray-600 mb-2">Access Rules</div>
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                  <Lock className="w-5 h-4 text-gray-500" />
                  <span>
                    Restricted — Only people with access can the chat open with
                    the link
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-black-700 mb-4">
                  <span>Share Via: </span>
                </div>

                {/* Buttons */}
                <div className="mt-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-around">
                    {/* LEFT SIDE – Share buttons */}
                    <div className="flex flex-wrap gap-3 w-full sm:flex-nowrap">
                      {/* Group 1 (Gmail + WhatsApp) on mobile */}
                      <div className="flex gap-3 items-center w-full sm:w-auto">
                        <button
                          onClick={() => handleSendShare("gmail")}
                          className="flex items-center justify-center sm:justify-start 
                     text-sm bg-gray-600 text-white px-3 py-2 rounded-lg 
                     hover:bg-gray-700 transition w-full sm:w-auto"
                        >
                          <img
                            src="/gmail.png" // make sure this path is correct in your public folder
                            alt="Gmail"
                            className="w-4 h-4 mr-2"
                          />
                          {/* <Mail className="w-4 h-4 mr-2" /> */}
                          Gmail
                        </button>

                        <button
                          onClick={() => handleSendShare("whatsapp")}
                          className="flex items-center justify-center sm:justify-start
                     text-sm bg-green-600 text-white px-3 py-2 rounded-lg 
                     hover:bg-green-700 transition w-full sm:w-auto"
                        >
                          <FaWhatsapp className="w-4 h-4 mr-2" />
                          WhatsApp
                        </button>
                      </div>

                      {/* Group 2 (OK + Cancel) on mobile */}
                      <div className="flex gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => handleSendShare("ChatterlyAI")}
                          style={{ backgroundColor: "#D8B4FE" }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = "#DBAFFF")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor = "#D8B4FE")
                          }
                          className="flex items-center justify-center text-sm bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition w-full sm:w-auto"
                        >
                          <img
                            src="/chatterly_logo.png" // make sure this path is correct in your public folder
                            alt="ChatterlyAI"
                            className="w-4 h-4 mr-2  rounded-md"
                          />
                          OK
                        </button>

                        <button
                          onClick={() => setShowShare(false)}
                          className="flex items-center justify-center text-sm bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition w-full sm:w-auto"
                        >
                          <X className="w-5 h-4 mr-1" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {shared && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center flex flex-col items-center gap-4">
                {/* Message */}
                <p className="text-gray-900 text-xl sm:text-2xl font-semibold mt-2">
                  Chat is shared!
                </p>

                {/* Confirmation Video */}
                <video
                  src="/confirmation1.mp4"
                  autoPlay
                  loop
                  muted
                  className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-cover rounded-xl"
                />

                {/* OK Button */}
                <button
                  onClick={() => setShared(false)}
                  className="bg-purple-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl text-lg sm:text-xl font-semibold hover:bg-purple-700 transition mt-4"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {/* Chat Body */}
          {/* <div className="p-6">
            <h1 className="text-xl font-bold mb-4">
              Chat: {convoId || "No convo selected"}
            </h1>
          </div> */}
          <main className="flex-1 relative overflow-x-hidden">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-32">
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-3 rounded-xl shadow-md break-words ${
                        msg.role === "user"
                          ? "bg-purple-100 text-pretty rounded-br-none max-w-[70%] sm:max-w-md"
                          : "bg-blue-200 rounded-bl-none max-w-[90%] sm:max-w-2xl overflow-x-auto"
                      }`}
                    >
                      <div
                        className={`text-xs font-semibold mb-1 ${
                          msg.role === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        {msg.role === "user" ? "You" : "Bot"}
                      </div>

                      <div className="markdown-content text-sm text-gray-800 overflow-x-hidden">
                        <div className="min-w-full">
                          {editingIndex === (msg.id ?? index) ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                rows={2}
                              />
                              <div className="flex justify-end gap-3 text-sm">
                                <button
                                  onClick={confirmEditMessage}
                                  className="text-green-600 hover:text-green-700 font-medium"
                                >
                                  Send
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingIndex(null);
                                    setEditingText("");
                                  }}
                                  className="text-gray-600 hover:text-gray-800 font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : msg.isImg ? (
                            <div
                              className={`max-w-xs bg-white border shadow-sm rounded-xl p-2 flex flex-col gap-2 ${
                                msg.role === "user" ? "self-end" : "self-start"
                              }`}
                            >
                              <img
                                src={msg.imageUrl}
                                alt="Generated"
                                className="w-full h-auto rounded-lg object-cover cursor-pointer"
                                onClick={() => setFullscreenImage(msg.imageUrl)}
                              />{" "}
                              <div className="flex items-center justify-between px-1">
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(msg.imageUrl);
                                      const blob = await res.blob();
                                      const url =
                                        window.URL.createObjectURL(blob);
                                      const a = document.createElement("a");
                                      a.href = url;
                                      a.download = "generated.png"; // filename
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                    } catch (err) {
                                      console.error("Download failed", err);
                                    }
                                  }}
                                  className="text-blue-500 text-xs font-semibold"
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          ) : (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                // p: ({ children }) => {
                                //   // Ensure children is an array
                                //   const childArray = Array.isArray(children)
                                //     ? children
                                //     : [children];

                                //   // Compute total text length for alignment
                                //   const textLength = childArray
                                //     .map((c) =>
                                //       typeof c === "string" ? c : ""
                                //     )
                                //     .join("").length;

                                //   // Short message → fully right-aligned for user
                                //   if (msg.role === "user" && textLength <= 64) {
                                //     return (
                                //       <p className="mb-1 text-right">
                                //         {children}
                                //       </p>
                                //     );
                                //   }

                                //   // Long message → normal wrap
                                //   return <p className="mb-1">{children}</p>;
                                // },
                                p: ({ children }) => {
                                  // total length of complete message, not per-paragraph children
                                  const totalLength = (msg.text || "").length;

                                  const isShort =
                                    msg.role === "user" && totalLength <= 64;

                                  return (
                                    <p
                                      className={`mb-1 ${
                                        isShort ? "text-right" : ""
                                      }`}
                                    >
                                      {children}
                                    </p>
                                  );
                                },

                                img: ({ src, alt }) => (
                                  <img
                                    src={src}
                                    alt={alt}
                                    className="rounded-lg max-w-full h-auto"
                                  />
                                ),
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
                                code: ({ inline, children, className }) => {
                                  const text = Array.isArray(children)
                                    ? children.join("")
                                    : String(children);

                                  // If it's inline OR there is no language + no newline → inline code
                                  const isInlineFenced =
                                    !inline &&
                                    !className && // means ``` not ```js or similar
                                    !text.includes("\n");

                                  if (inline || isInlineFenced) {
                                    return (
                                      <code
                                        style={{
                                          padding: "2px 6px",
                                          borderRadius: "4px",
                                          color: "black",
                                          fontSize: "0.95em",
                                        }}
                                        className="bg-blue-300"
                                      >
                                        {text}
                                      </code>
                                    );
                                  }

                                  // Multi-line block
                                  return (
                                    <div
                                      style={{
                                        position: "relative",
                                        marginBottom: "1rem",
                                      }}
                                    >
                                      <pre className="bg-blue-300 text-black p-4 rounded-md overflow-x-auto text-sm">
                                        <code>{text}</code>
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
                                          onClick={() => handleCopy(text)}
                                          title="Copy"
                                          style={{
                                            background: "none",
                                            color: "black",
                                            border: "none",
                                            cursor: "pointer",
                                          }}
                                        >
                                          <FaCopy />
                                        </button>

                                        <button
                                          onClick={() => sendToWhatsApp(text)}
                                          title="Share via WhatsApp"
                                          style={{
                                            background: "none",
                                            color: "green",
                                            border: "none",
                                            cursor: "pointer",
                                          }}
                                        >
                                          <FaWhatsapp />
                                        </button>

                                        <button
                                          onClick={() => sendToGmail(text)}
                                          title="Send via Email"
                                          style={{
                                            background: "none",
                                            color: "black",
                                            border: "none",
                                            cursor: "pointer",
                                          }}
                                        >
                                          {/* <FaEnvelope /> */}
                                          <img
                                            src="/gmail.png"
                                            alt="Gmail"
                                            style={{
                                              width: "16px",
                                              height: "16px",
                                            }}
                                          />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                },
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
                                tbody: ({ children }) => (
                                  <tbody>{children}</tbody>
                                ),
                                tr: ({ children }) => (
                                  <tr
                                    style={{ borderBottom: "1px solid #888" }}
                                  >
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
                              supresshydration
                            >
                              {msg.text}
                            </ReactMarkdown>
                          )}
                          {fullscreenImage && (
                            <div
                              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                              onClick={() => setFullscreenImage(null)}
                            >
                              <img
                                src={fullscreenImage}
                                className="max-w-[90%] max-h-[90%] rounded-xl shadow-2xl"
                              />
                            </div>
                          )}
                        </div>
                        {msg.text && (
                          <div
                            className={`flex gap-4 items-center mt-2 text-xs text-gray-700 ${
                              msg.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {msg.role === "user" && (
                              <>
                                <button
                                  onClick={() => handleCopy(msg.text)}
                                  title="Copy message"
                                  className="flex items-center gap-1 text-black-600 hover:underline"
                                >
                                  <FaCopy />
                                  <span>Copy</span>
                                </button>
                                <button
                                  onClick={() => handleEditMessage(msg.id)}
                                  title="Edit message"
                                  className="flex items-center gap-1 text-blue-600 hover:underline"
                                >
                                  <RiEditLine />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() =>
                                    setConfirmDelete({ show: true, id: msg.id })
                                  }
                                  title="Delete message"
                                  className="flex items-center gap-1 text-red-600 hover:underline"
                                >
                                  <MdDelete />
                                  <span>Delete</span>
                                </button>
                              </>
                            )}
                            {msg.role !== "user" && !msg.isImg && (
                              <div className="flex items-center gap-4 mt-2">
                                {/* Copy */}
                                <button
                                  onClick={() => handleCopy(msg.text)}
                                  title="Copy message"
                                  className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition"
                                >
                                  <FaCopy className="w-4 h-4" />
                                  <span className="hidden xs:inline">Copy</span>
                                </button>
                                {/* WhatsApp */}
                                <button
                                  onClick={() => sendToWhatsApp(msg.text)}
                                  title="Share via WhatsApp"
                                  className="flex items-center gap-1 text-green-600 hover:text-green-700 transition"
                                >
                                  <FaWhatsapp className="w-4 h-4" />
                                  <span className="hidden xs:inline">WhatsApp</span>
                                </button>
                                {/* Gmail */}
                                <button
                                  onClick={() => sendToGmail(msg.text)}
                                  title="Send via Email"
                                  className="flex items-center gap-1 text-red-600 hover:text-red-700 transition"
                                >
                                  <img
                                    src="/gmail.png"
                                    alt="Gmail"
                                    className="w-4 h-4"
                                  />
                                  <span className="hidden xs:inline" >Gmail</span>
                                </button>
                                {/* Speak / Pause */}
                                <button
                                  onClick={() => speakText(msg.text)}
                                  title={
                                    isPaused
                                      ? "Resume speaking"
                                      : isSpeaking
                                      ? "Pause speaking"
                                      : "Play"
                                  }
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                                >
                                  {isSpeaking ? (
                                    isPaused ? (
                                      <FaPlay className="w-4 h-4" />
                                    ) : (
                                      <FaPause className="w-4 h-4" />
                                    )
                                  ) : (
                                    <FaVolumeUp className="w-4 h-4" />
                                  )}

                                  <span >
                                    {isPaused
                                      ? "Resume"
                                      : isSpeaking
                                      ? "Pause"
                                      : "Play"}
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="text-sm text-gray-500 animate-pulse">
                    Bot is typing...
                  </div>
                )}
                {error && <div className="text-sm text-red-500">{error}</div>}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Fixed at Bottom */}
              <div className="fixed bottom-0 left-0 right-0 lg:ml-64 bg-white/90 backdrop-blur-lg border-t border-white/20 px-6 py-4 z-40">
                <div className="flex items-center gap-2 max-w-7xl mx-auto">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onInput={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                        // RESET SIZE AFTER SEND
                        const el = inputRef.current;
                        el.style.height = "auto"; // resets back to initial (rows={3})
                      }
                    }}
                    placeholder="Type or speak your message. Use /img at the start to generate images."
                    rows={2}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[4rem] max-h-[12rem] "
                  />
                  <>
                    {/* Mic toggle button */}
                    <button
                      onClick={toggleListening}
                      className={`p-2 rounded-xl border transition ${
                        listening
                          ? "bg-red-500 text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {listening ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </button>

                    {/* Listening modal (NOT inside button) */}
                    {listening && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm text-center">
                        <div className="bg-white rounded-2xl shadow-2xl px-6 py-8 w-[90%] max-w-sm relative flex flex-col items-center gap-4">
                          {/* Close button */}
                          <button
                            onClick={toggleListening}
                            className="absolute top-3 right-3 p-2 bg-gray-100 hover:bg-red-100 rounded-full"
                            title="Stop Listening"
                          >
                            <X className="w-5 h-5 text-red-500" />
                          </button>

                          {/* Mic animation */}
                          <div className="relative mt-2">
                            <div className="absolute h-16 w-16 bg-green-400 opacity-75 rounded-full animate-ping"></div>
                            <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center relative z-10">
                              <Mic className="w-6 h-6 text-white" />
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm font-medium">
                            Listening…
                          </p>

                          {liveTranscript && (
                            <p className="text-gray-700 text-sm bg-gray-100 rounded-md px-4 py-2 w-full text-center">
                              {liveTranscript}
                            </p>
                          )}

                          <button
                            onClick={toggleListening}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
                          >
                            Stop & Continue
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:scale-105 transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            {confirmDelete.show && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                <div className="bg-white rounded-xl shadow-lg p-5 w-[90%] max-w-sm animate-fadeIn">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Delete this message?
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    This will permanently remove the message and its AI
                    response.
                  </p>
                  <div className="flex justify-end gap-3 text-sm">
                    <button
                      onClick={() =>
                        setConfirmDelete({ show: false, id: null })
                      }
                      className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteMessage(confirmDelete.id);
                        setConfirmDelete({ show: false, id: null });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </Suspense>
  );
}
