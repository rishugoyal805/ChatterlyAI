import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function middleware(request) {
  const jwtToken = request.cookies.get("auth_token")?.value;
  const nextAuthToken = request.cookies.get("next-auth.session-token")?.value;

  // Add debugging for production
  if (process.env.NODE_ENV === "production") {
    console.log("Middleware Debug:", {
      hasJwtToken: !!jwtToken,
      hasNextAuthToken: !!nextAuthToken,
      path: request.nextUrl.pathname,
    });
  }

  // 1️⃣ If you have your custom JWT
  if (jwtToken) {
    try {
      jwt.verify(jwtToken, process.env.JWT_SECRET);
      return NextResponse.next();
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      // Clear invalid token
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("auth_token");
      return response;
    }
  }

  // 2️⃣ If you're logged in with NextAuth (Google etc.)
  if (nextAuthToken) {
    // Token exists, trust NextAuth
    return NextResponse.next();
  }

  // 3️⃣ Otherwise not authenticated
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/dashboard", "/chat", "/ask-doubt", "/profile"],
};