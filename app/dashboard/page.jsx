// Dashoard Page
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Bell,
  User,
  Sparkles,
  LogOut,
  Menu,
  X,
  Clock,
  TrendingUp,
  MessageCircle,
  Lightbulb,
  LayoutDashboard,
  MessageCircleMore,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchFriend, setSearchFriend] = useState("");
  const [searchChat, setSearchChat] = useState("");
  const [user, setUser] = useState({ name: "" });
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };

    fetchSession();
  }, []);

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

  const [friends, setFriends] = useState([]);
  const [aiChats, setAiChats] = useState([]);

  const loadAllLists = async () => {
    if (!userEmail) return;

    try {
      // --- Load Friends ---
      const fRes = await fetch(`/api/get-friends?email=${userEmail}`);
      const fData = await fRes.json();

      // --- Load AI Chats ---
      const cRes = await fetch(`/api/fetch-ai-chats`);
      const cData = await cRes.json();

      setFriends(fData.friends || []);
      setAiChats(cData.chats || []);
    } catch (err) {
      console.error("Error loading lists:", err);
    }
  };

  useEffect(() => {
    loadAllLists();
  }, [userEmail]);

  const filteredFriends = friends.filter((f) =>
    (f.name || f.email).toLowerCase().includes(searchFriend.toLowerCase())
  );

  const filteredAIChats = aiChats.filter((c) =>
    (c.name || c.convoId).toLowerCase().includes(searchChat.toLowerCase())
  );

  // handling the logout of a user
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });

      if (res.ok) {
        // Clear LocalStorage
        localStorage.removeItem("auth_token");
        localStorage.clear(); // optional: clears all keys
        sessionStorage.clear();
        window.location.href = "/login";
        router.push("/login");
        // Optional: redirect user
        // window.location.href = "/login";
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-white/20 z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8 py-3 px-4">
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

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-4 py-3 bg-purple-100 text-purple-700 rounded-xl"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/ask-doubt"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Lightbulb className="w-5 h-5" />
              <span>Chatbot</span>
            </Link>
            <Link
              href="/chat"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <MessageCircleMore className="w-5 h-5" />
              <span>Chat with Friends</span>
            </Link>
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

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-md border-b border-white/20 px-6 py-4">
          <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
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

        {/* Content */}
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back
              {user?.name && user.name.trim() !== ""
                ? `, ${user.name}! 👋`
                : ","}
            </h2>

            <p className="text-gray-600">Ready to continue?</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link href="/chat" className="block">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 mb-1">Chat with friends</p>
                    {/* <p className="text-3xl font-bold">{subjects.length}</p> */}
                  </div>
                  <MessageCircle className="w-12 h-12 text-purple-200" />
                </div>
              </div>
            </Link>

            <Link href="/ask-doubt" className="block">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 mb-1">Chat With AI</p>
                    {/* <p className="text-3xl font-bold">85%</p> */}
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-200" />
                </div>
              </div>
            </Link>
          </div>
          {/* Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Search Friends */}
            <div className="relative max-w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Friends..."
                value={searchFriend}
                onChange={(e) => setSearchFriend(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Search Chat */}
            <div className="relative max-w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Chats..."
                value={searchChat}
                onChange={(e) => setSearchChat(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            {/* FRIENDS LIST */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">
                Friends
              </h2>
              <div className="space-y-3">
                {filteredFriends.length === 0 && (
                  <p className="text-sm text-gray-400">No friends found</p>
                )}

                {filteredFriends.map((f) => (
                  <div
                    key={f.chatbox_id}
                    onClick={() =>
                      router.push(`/chat?chatboxId=${f.chatbox_id}`)
                    }
                    className="p-3 bg-white/50 hover:bg-white/70 cursor-pointer rounded-xl border border-white/20 flex justify-between items-center"
                  >
                    <span className="font-medium">{f.name || f.email}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(f.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI CHATS LIST */}
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-700">
                AI Chats
              </h2>
              <div className="space-y-3">
                {filteredAIChats.length === 0 && (
                  <p className="text-sm text-gray-400">No chats found</p>
                )}

                {filteredAIChats.map((c) => (
                  <div
                    key={c._id}
                    onClick={() =>
                      router.push(`/ask-doubt?convoId=${c.convoId}`)
                    }
                    className="p-3 bg-white/50 hover:bg-white/70 cursor-pointer rounded-xl border border-white/20 flex justify-between items-center"
                  >
                    <span className="font-medium">
                      {c.name || "Untitled Chat"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
