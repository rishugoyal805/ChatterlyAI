import React from "react";
import "./globals.css";
import { Inter } from "next/font/google";

// ✅ Initialize font outside the component
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Chatterly - Lets chat with friends and AI altogether",
  description:
    "Join thousands of people who are revolutionizing their Working experience with collaborative AI assistance with friends.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* ✅ inter.className must be defined here */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}
