"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  User,
  Save,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  Mail,
  School,
  BookMarked,
  MessageCircleMore,
  Lightbulb,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { getSession } from "next-auth/react";

// Reusable password rule component
const PasswordCheck = ({ label, valid }) => (
  <div className="flex items-center gap-2 text-sm">
    {valid ? (
      <span className="text-green-600 font-bold">✔</span>
    ) : (
      <span className="text-red-500 font-bold">✘</span>
    )}
    <span className={valid ? "text-green-600" : "text-red-500"}>{label}</span>
  </div>
);

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    oldPass: "",
    newPass: "",
    confirmPass: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const [user, setUser] = useState({ name: "", image: "" });

  useEffect(() => {
    fetchProfile();
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

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile"); // ❌ No headers needed
      const data = await response.json();
      if (response.ok) {
        setFormData(data.user);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- PASSWORD VALIDATION ---
  const { newPass: password = "", confirmPass = "" } = formData;

  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    match: password && password === confirmPass,
  };

  const allGood =
    passwordChecks.length &&
    passwordChecks.upper &&
    passwordChecks.number &&
    passwordChecks.special &&
    passwordChecks.match;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    if (!formData.oldPass) {
      setError("Old Password is required.");
      setIsSaving(false);
      return;
    }
    if (!formData.newPass) {
      setError("New Password is required.");
      setIsSaving(false);
      return;
    }
    if (!allGood) {
      setError("New password does not meet all requirements.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Profile updated successfully!");
        setFormData((prev) => ({
          ...prev,
          oldPass: "",
          newPass: "",
          confirmPass: "",
        }));
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
          <div className="flex items-center space-x-2 mb-8">
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
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
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
            {/* <Link href="/profile" className="flex items-center space-x-3 px-4 py-3 bg-purple-100 text-purple-700 rounded-xl">
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
            </div>
            {/* Right section: Notification + Profile */}
            <div className="flex items-center space-x-4">
              {/* <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button> */}
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
          {/* Page Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-3xl p-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt="User"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
                  <p className="text-purple-100">
                    Manage your account information and preferences
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* <div>
            <h1>{formData.name}</h1>
          </div> */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
                  {success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Full Name
                      </div>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Address
                      </div>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your email address"
                      disabled
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="oldPass"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <div className="flex items-center">
                        <Lock className="w-4 h-4 mr-2" />
                        Old Password
                      </div>
                    </label>
                    <input
                      type="password"
                      id="oldPass"
                      name="oldPass"
                      value={formData.oldPass}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter old password"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="newPass"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <div className="flex items-center">
                        <Lock className="w-4 h-4 mr-2" />
                        New Password
                      </div>
                    </label>
                    <input
                      type="password"
                      id="newPass"
                      name="newPass"
                      value={formData.newPass}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPass"
                      value={formData.confirmPass}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {/* Password Rules */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <PasswordCheck
                        label="At least 8 characters"
                        valid={passwordChecks.length}
                      />
                      <PasswordCheck
                        label="One uppercase letter"
                        valid={passwordChecks.upper}
                      />
                      <PasswordCheck
                        label="One number"
                        valid={passwordChecks.number}
                      />
                      <PasswordCheck
                        label="One special character"
                        valid={passwordChecks.special}
                      />
                      <PasswordCheck
                        label="Passwords match"
                        valid={passwordChecks.match}
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
