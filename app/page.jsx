"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight,
  BookOpen,
  Lightbulb,
  Users,
  MessageCircle,
  Star,
  Menu,
  X,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import { RiImageAiFill } from "react-icons/ri";
import Link from "next/link";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: Lightbulb,
      title: "Better Responses",
      description: "Uses AI Agents for refining and giving better results",
    },
    {
      icon: Users,
      title: "Collaborative sessions",
      description:
        "Many People can work on same chat when shared by admin like Google Docs",
    },
    {
      icon: MessageCircle,
      title: "Chat System",
      description: "Chat woth your friends withing this webapp",
    },
    {
      icon: RiImageAiFill,
      title: "Image Generation",
      description: "Generate images using AI within this webapp",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      content:
        "ChatterlyAI transformed my study routine. The collaborative doubt-solving feature is incredible!",
      rating: 5,
    },
    {
      name: "Alex Rodriguez",
      role: "Engineering Student",
      content:
        "The organized notes and resources saved me countless hours during exam preparation.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Medical Student",
      content:
        "Best educational platform I've used. The community support is amazing!",
      rating: 5,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ChatterlyAI
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-purple-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-purple-600 transition-colors"
              >
                Testimonials
              </a>
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
                Get Started
              </Link>
            </div>

            <button
              className="md:hidden"
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
              <a
                href="#features"
                className="block text-gray-700 hover:text-purple-600"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="block text-gray-700 hover:text-purple-600"
              >
                Testimonials
              </a>
              <Link href="/login" className="block text-purple-600">
                Login
              </Link>
              <Link
                href="/signup"
                className="block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold pb-2  mb-6 pt-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Lets chat with friends
              <br />
              and AI altogether
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              This is a student-built AI Project. No personal information is stored
              or shared.
            </p>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of people who are revolutionizing their Working
              experience with collaborative AI assistance with friends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                Start Today
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="text-purple-600 px-8 py-4 rounded-full text-lg font-semibold border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20  px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 pb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Why Choose ChatterlyAI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the features that make learning engaging, collaborative,
              and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:bg-white/80"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
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

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-100 to-blue-100"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            What People Say
          </h2>

          <div className="relative">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20 shadow-xl">
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map(
                  (_, i) => (
                    <Star
                      key={i}
                      className="w-6 h-6 text-yellow-400 fill-current"
                    />
                  )
                )}
              </div>
              <blockquote className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              <div>
                <div className="font-bold text-lg text-gray-800">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-purple-600">
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-purple-600 scale-125"
                      : "bg-purple-200 hover:bg-purple-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="bg-gradient-to-r from-gray-900 to-purple-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ChatterlyAI</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Empowering students worldwide with collaborative AI assistance and chat system with friends for better and more effective learning.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <span className="sr-only">Github</span>
                  <div className="w-5 h-5 bg-white rounded-sm"></div>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <span className="sr-only">LinkedIn</span>
                  <div className="w-5 h-5 bg-white rounded-sm"></div>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <span className="sr-only">Email</span>
                  <div className="w-5 h-5 bg-white rounded-sm"></div>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-300">
            <p>&copy; 2024 ChatterlyAI. All rights reserved.</p>
          </div>
        </div>
      </footer> */}
      <footer className="bg-gradient-to-r from-gray-900 to-purple-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ChatterlyAI</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Empowering students worldwide with collaborative AI assistance
                and chat system with friends for better and more effective
                learning.
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
                    Terms of Service
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
