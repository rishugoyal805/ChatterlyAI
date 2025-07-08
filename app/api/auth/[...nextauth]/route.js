// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { connectToDatabase } from "@/lib/mongodb";

// export const authOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//   },
//   callbacks: {
//     async signIn({ user, account }) {
//       try {
//         const { db } = await connectToDatabase();
//         const existingUser = await db
//           .collection("users")
//           .findOne({ email: user.email });

//         if (!existingUser) {
//           await db.collection("users").insertOne({
//             googleId: user.id,
//             email: user.email,
//             password: "",
//             createdAt: new Date(),
//             name: user.name || "",
//             nickname: "",
//             chats_arr: [],
//             frnd_arr: [],
//           });
//         }

//         return true;
//       } catch (err) {
//         console.error("Google signIn DB error:", err);
//         return false;
//       }
//     },
//     async jwt({ token, account, user }) {
//       if (account) {
//         token.accessToken = account.access_token;
//         token.id = user?.id;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.accessToken = token.accessToken;
//       session.user.id = token.id;
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: "/signup",
//   },
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

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
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signup",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
// This code sets up NextAuth with Google authentication, connecting to a MongoDB database to manage user sessions and data.
// It handles user sign-in, JWT token creation, and session management, ensuring that user data is stored and retrieved correctly from the database.
// The code also includes error handling for database operations and ensures that user IDs are correctly attached to the session and JWT tokens.
// The `connectToDatabase` function is assumed to be defined in the `lib/mongodb` module, which establishes a connection to the MongoDB database.
// The `authOptions` object contains the configuration for NextAuth, including the authentication provider, callbacks for sign-in, JWT, and session management, and the secret key for signing tokens.
// The `handler` is exported for handling GET and POST requests to the NextAuth API route.