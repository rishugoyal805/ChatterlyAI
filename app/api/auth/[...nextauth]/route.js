import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const { db } = await connectToDatabase();
        const existingUser = await db.collection("users").findOne({ email: user.email });

        let dbUserId;
        if (!existingUser) {
          const newUser = await db.collection("users").insertOne({
            googleId: user.id,
            email: user.email,
            name: user.name || "",
            password: "",
            createdAt: new Date(),
            nickname: "",
            chats_arr: [],
            frnd_arr: [],
          });
          dbUserId = newUser.insertedId;
        } else {
          dbUserId = existingUser._id;
        }

        user.id = dbUserId.toString(); // attach for jwt
        return true;
      } catch (err) {
        console.error("DB Error:", err);
        return false;
      }
    },
    async jwt({ token, account, user }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id || null;
      session.accessToken = token.accessToken;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Ensure we redirect to the correct domain
      const targetUrl = "/dashboard";
      if (baseUrl) {
        return new URL(targetUrl, baseUrl).toString();
      }
      return targetUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  // Add this for production deployment
  ...(process.env.NODE_ENV === "production" && {
    cookies: {
      sessionToken: {
        name: "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: true,
        },
      },
    },
  }),
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 