import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { connectToDatabase } from "@/lib/mongodb"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // ✅ Save Google user to MongoDB if not already exists
    async signIn({ user, account }) {
      try {
        const { db } = await connectToDatabase();
        const existingUser = await db.collection("users").findOne({ email: user.email });

        if (!existingUser) {
          await db.collection("users").insertOne({
            email: user.email,
            password: "",
            createdAt: new Date(),
            name: user.name || "",
            nickname: "",
            // image: user.image || "",
            // provider: account.provider || "google",
          });
        }

        return true;
      } catch (err) {
        console.error("Google signIn DB error:", err);
        return false;
      }
    },

    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = user?.id;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.id;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signup", // Optional
  },
});

export { handler as GET, handler as POST }