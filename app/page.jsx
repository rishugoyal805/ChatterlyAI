"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight,
  Lightbulb,
  Users,
  MessageCircleMore,
  Star,
  Menu,
  X,
  Mail,
  PanelLeftOpen,
  PanelLeftClose,
  ChevronLeft,
} from "lucide-react";
import { RxCode } from "react-icons/rx";
import { IoShieldCheckmarkOutline } from "react-icons/io5";

import { FiGithub, FiLinkedin } from "react-icons/fi";
import { RiImageAiFill } from "react-icons/ri";
import Link from "next/link";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // const features = [
  //   {
  //     icon: Lightbulb,
  //     title: "Better Responses",
  //     description: "Uses AI Agents for refining and giving better results",
  //   },
  //   {
  //     icon: Users,
  //     title: "Collaborative sessions",
  //     description:
  //       "Many People can work on same chat when shared by admin like Google Docs",
  //   },
  //   {
  //     icon: MessageCircleMore,
  //     title: "Chat System",
  //     description: "Chat with your friends within this webapp",
  //   },
  //   {
  //     icon: RiImageAiFill,
  //     title: "Image Generation",
  //     description: "Generate images using AI within this webapp",
  //   },
  //   {
  //     icon: RxCode,
  //     title: "Code Assistance",
  //     description:
  //       "Get help with coding, debugging, and algorithm explanations using AI.",
  //   },
  //   {
  //     icon: IoShieldCheckmarkOutline,
  //     title: "Privacy & Security",
  //     description:
  //       "All user data stays private with end-to-end encrypted sessions and local storage.",
  //   },
  // ];
  const features = [
    {
      icon: Lightbulb,
      title: "Better Responses",
      description: "Uses AI Agents for refining and giving better results",
      gradient: "from-cyan-400 to-blue-500",
      bgGradient: "from-cyan-500/20 to-blue-500/20",
    },
    {
      icon: Users,
      title: "Collaborative Sessions",
      description:
        "Many People can work on same chat when shared by admin like Google Docs",
      gradient: "from-pink-400 to-rose-500",
      bgGradient: "from-pink-500/20 to-rose-500/20",
    },
    {
      icon: MessageCircleMore,
      title: "Chat System",
      description: "Chat with your friends within this webapp",
      gradient: "from-purple-400 to-violet-500",
      bgGradient: "from-purple-500/20 to-violet-500/20",
    },
    {
      icon: RiImageAiFill,
      title: "Image Generation",
      description: "Generate images using AI within this webapp",
      gradient: "from-orange-400 to-amber-500",
      bgGradient: "from-orange-500/20 to-amber-500/20",
    },
    {
      icon: RxCode,
      title: "Code Assistance",
      description:
        "Get help with coding, debugging, and algorithm explanations using AI.",
      gradient: "from-green-400 to-emerald-500",
      bgGradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: "Privacy & Security",
      description:
        "All user data stays private with end-to-end encrypted sessions and local storage.",
      gradient: "from-indigo-400 to-blue-600",
      bgGradient: "from-indigo-500/20 to-blue-600/20",
    },
  ];

  useEffect(() => {
    const urls = [
      `${process.env.NEXT_PUBLIC_CHAT_SOCKET_BACKEND_URL}/health`,
      `${process.env.NEXT_PUBLIC_AGENTIC_BACKEND_URL}/ping`,
      `${process.env.NEXT_PUBLIC_AI_SOCKET_BACKEND_URL}/health`,
    ];

    urls.forEach((u) => {
      try {
        navigator.sendBeacon(u);
      } catch {
        // fallback (still async, no blocking)
        fetch(u, { method: "POST", keepalive: true }).catch(() => {});
      }
    });
  }, []);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img
                  src="/chatterly_logo.png"
                  alt="logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ChatterlyAI
              </span>
            </div>

            <div className="hidden xs:flex items-center space-x-8">
              <Link
                href="/login"
                className="text-purple-600 hover:text-purple-700 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Sign Up
              </Link>

              <button
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-purple-100 transition-all duration-200 group"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title={isSidebarOpen ? "Hide features" : "Show features"}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                ) : (
                  <PanelLeftOpen className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                )}
              </button>
            </div>

            <button
              className="xs:hidden flex"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/90 backdrop-blur-md border-t border-white/20">
            <div className="px-4 py-4 space-y-4">
              <Link
                href="/login"
                className="flex justify-center text-purple-600"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </nav>
      <div className="flex-1 flex pt-16">
        {/* SIDEBAR – visible only on lg+ */}
        {isSidebarOpen && (
          <div
            className="hidden md:flex w-[30%] min-w-[260px] max-w-[320px]
        border-r border-white/20 bg-gradient-to-b
        from-white/40 via-white/30 to-white/20
        backdrop-blur-xl"
          >
            {/* INNER SCROLL CONTAINER */}
            <div className="h-[calc(100vh-4rem)] overflow-y-auto w-full p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600" />
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">
                    Features
                  </p>
                </div>

                {/* Feature Cards */}
                <div className="space-y-5">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`group bg-gradient-to-br ${feature.bgGradient}
                  rounded-2xl p-3 sm:p-4 cursor-pointer transition-all duration-300
                  hover:shadow-lg lg:hover:scale-105
                  border border-white/20 hover:border-white/40`}
                    >
                      <div className="flex gap-2 sm:gap-3 items-start">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${feature.gradient}
                      rounded-xl flex items-center justify-center flex-shrink-0
                      shadow-lg group-hover:shadow-xl transition-all`}
                        >
                          <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-bold text-sm sm:text-md text-slate-900
                        group-hover:text-transparent group-hover:bg-clip-text
                        group-hover:bg-gradient-to-r group-hover:from-purple-600
                        group-hover:to-blue-600 transition-all"
                          >
                            {feature.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div
          className={`flex-1 flex flex-coltransition-all duration-300
              
    ${isSidebarOpen ? `lg:ml-[7%] lg:mr-[5%]` : "lg:ml-0"} ease-in-out`}
        >
          <div
            className={`flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-3 pb-10
            ${isSidebarOpen ? "lg:w-[77%]" : "w-full mt-20"} ease-in-out`}
          >
            <div className="text-center space-y-10 animate-fade-in-up">
              <div className="animate-fade-in-up">
                <h1
                  className="
    
                  text-6xl     /* medium screens */
    lg:text-7xl     /* large screens */
    font-bold md:font-bold  /* retain weight on small screens */
    pb-2 pt-6 
    bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600
    bg-clip-text text-transparent
    leading-snug sm:leading-normal md:leading-tight
    break-words
  "
                >
                  Lets chat with friends
                  <br />
                  and AI altogether
                </h1>

                <p
                  className="
    text-lg md:text-xl lg:text-2xl
    font-medium sm:font-medium md:font-normal
    text-gray-600
    mb-6
    max-w-3xl mx-auto
    leading-snug sm:leading-relaxed
  "
                >
                  This is a student-built AI Project. No personal information is
                  stored or shared.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    href="/signup"
                    className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white 
                  px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all 
                  duration-300 transform hover:scale-105 flex items-center"
                  >
                    Register
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {/* Show Explore Features only below lg */}
                  <Link
                    href="#features"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-purple-600 px-8 py-4 md:hidden rounded-full text-lg 
                  font-semibold border-2 border-purple-200 hover:border-purple-400 
                  hover:bg-purple-50 transition-all duration-300"
                  >
                    Explore Features
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      {(!isSidebarOpen || isMobile) && (
        <section id="features" className="py-20  px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 pb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Why Choose ChatterlyAI?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover the features that make learning engaging,
                collaborative, and effective.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-purple-200/60 backdrop-blur-sm rounded-2xl p-8 border border-purple-200 hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:bg-white/80"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="bg-gradient-to-r from-purple-900 to-purple-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                  <img
                    src="/chatterly_logo.png"
                    alt="logo"
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <span className="text-xl font-bold">ChatterlyAI</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Empowering people worldwide with collaborative AI assistance and
                chat system with friends for better and more effective
                collaboration.
              </p>
              <div className="text-sm text-gray-400 space-y-1">
                <p className="text-white font-semibold mb-2">Made by:</p>

                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src="./swayam.jpg"
                    alt="Swayam Gupta"
                    className="w-12 h-12 rounded-full border-2 border-purple-500"
                  />
                  <div>
                    <p className="text-white font-medium">Swayam Gupta</p>
                    <div className="flex space-x-3 mt-1 text-gray-300">
                      <a
                        href="https://github.com/SwayamGupta12345"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-white transition-colors"
                      >
                        <FiGithub className="w-4 h-4 mr-1" />
                        GitHub
                      </a>
                      <a
                        href="https://www.linkedin.com/in/swayamgupta12"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-white transition-colors"
                      >
                        <FiLinkedin className="w-4 h-4 mr-1" />
                        LinkedIn
                      </a>
                      <a
                        href="https://mail.google.com/mail/u/0/?view=cm&fs=1&to=swayamsam2005@gmail.com"
                        target="_blank"
                        className="flex items-center hover:text-white transition-colors"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src="./rishu.jpg"
                    alt="Rishu"
                    className="w-12 h-12 rounded-full border-2 border-purple-500"
                  />
                  <div>
                    <p className="text-white font-medium">Rishu</p>
                    <div className="flex space-x-3 mt-1 text-gray-300">
                      <a
                        href="https://github.com/rishugoyal805"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-white transition-colors"
                      >
                        <FiGithub className="w-4 h-4 mr-1" />
                        GitHub
                      </a>
                      <a
                        href="https://www.linkedin.com/in/rishu0405"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-white transition-colors"
                      >
                        <FiLinkedin className="w-4 h-4 mr-1" />
                        LinkedIn
                      </a>
                      <a
                        href="https://mail.google.com/mail/u/0/?view=cm&fs=1&to=rishugoyal6800@gmail.com"
                        target="_blank"
                        className="flex items-center hover:text-white transition-colors"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/about"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                {/* <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Pricing</a></li> */}
                {/* <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li> */}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/privacy-policy"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Terms of Use
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-300">
            <p>&copy; 2025 ChatterlyAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
