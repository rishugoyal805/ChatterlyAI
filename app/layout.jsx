// import "./globals.css"

// export const metadata = {
//   title: "Askdemia - Learn Smarter, Not Harder",
//   description:
//     "Join thousands of students who are revolutionizing their learning experience with collaborative study tools and expert guidance.",
// }

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body>{children}</body>
//     </html>
//   )
// }
// app/layout.js or app/layout.tsx
// app/layout.jsx
import "./globals.css";
import { Inter } from "next/font/google";

// ✅ Initialize font outside the component
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Askdemia - Learn Smarter, Not Harder",
  description:
    "Join thousands of students who are revolutionizing their learning experience with collaborative study tools and expert guidance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* ✅ inter.className must be defined here */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}
