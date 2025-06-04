"use client"

import { useState, useEffect } from "react"
import { BookOpen, Plus, Search, Bell, User, LogOut, Menu, X, Clock, TrendingUp, MessageCircle, Lightbulb, LayoutDashboard, MessageCircleMore } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const [subjects, setSubjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchFriend, setSearchFriend] = useState("")
  const [searchChat, setSearchChat] = useState("")
  const [user, setUser] = useState({ name: "Student" })
  const router = useRouter()

  // useEffect(() => {
  //   fetchSubjects()
  //   // Check if user is logged in
  //   const token = localStorage.getItem("token")
  //   if (!token) {
  //     router.push("/login")
  //   }
  // }, [])

  // const fetchSubjects = async () => {
  //   try {
  //     const response = await fetch("/api/subjects", {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //     })
  //     const data = await response.json()
  //     if (response.ok) {
  //       setSubjects(data)
  //     }
  //   } catch (error) {
  //     console.error("Error fetching subjects:", error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login"); // Or "/"
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // const filteredSubjects = subjects.filter((subject) => subject.name?.toLowerCase().includes(searchTerm.toLowerCase()))

  // const SubjectSkeleton = () => (
  //   <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-pulse">
  //     <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
  //     <div className="h-6 bg-gray-200 rounded mb-2"></div>
  //     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  //   </div>
  // )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-white/20 z-50 transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Chatterly
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
            {/* <Link href="/profile" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link> */}
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
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>

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

        {/* Content */}
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {user.name}! 👋</h2>
            <p className="text-gray-600">Ready to continue your learning journey?</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 mb-1">Chat with friends</p>
                  {/* <p className="text-3xl font-bold">{subjects.length}</p> */}
                </div>
                <MessageCircle className="w-12 h-12 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 mb-1">Chat With AI</p>
                  {/* <p className="text-3xl font-bold">85%</p> */}
                </div>
                <TrendingUp className="w-12 h-12 text-green-200" />
              </div>
            </div>
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
                placeholder="Search Chat..."
                value={searchChat}
                onChange={(e) => setSearchChat(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>


          {/* Subjects Grid */}
          {/* <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Your Subjects</h3>
              <Link
                href="/ask-doubt"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ask Doubt
              </Link>
            </div> */}
          {/* 
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <SubjectSkeleton key={index} />
                ))}
              </div>
            ) : filteredSubjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/subject/${subject.id}`}
                    className="group bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-white/80"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{subject.name}</h4>
                    <p className="text-gray-600 mb-4">
                      {subject.description || "Explore notes, questions, and resources"}
                    </p>
                    <div className="flex items-center text-purple-600 font-semibold">
                      <span>View Details</span>
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No subjects found</h3>
                <p className="text-gray-500">Start by exploring available subjects or ask a doubt!</p>
              </div>
            )}
          </div> */}
        </main>
      </div>
    </div>
  )
}
