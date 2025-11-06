import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req) {
  const { db } = await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) return NextResponse.json({ friends: [] });

  // ✅ 1. Get the user document to access their frnd_arr
  const user = await db.collection("users").findOne({ email });

  if (!user) {
    return NextResponse.json({ friends: [] });
  }

  // ✅ 2. Build a lookup map from user's frnd_arr for quick access
  const frndMap = {};
  if (Array.isArray(user.frnd_arr)) {
    user.frnd_arr.forEach((f) => {
      if (f && f.chatbox_id) {
        frndMap[f.chatbox_id.toString()] = {
          email: f.email,
          nickname: f.name || f.nickname || null,
          lastModified: f.lastModified || new Date(),
        };
      }
    });
  }

  // ✅ 3. Fetch all chatboxes where this user is a participant
  const chatboxes = await db
    .collection("chatboxes")
    .find({ participants: email })
    .sort({ lastModified: -1 })
    .toArray();

  // ✅ 4. Merge chatbox info with name from frnd_arr map
  const friends = chatboxes.map((chat) => {
    const chatboxId = chat._id.toString();
    const friendEmail = chat.participants.find((p) => p !== email);

    const fromArr = frndMap[chatboxId];
    return {
      chatbox_id: chat._id,
      email: friendEmail,
      nickname: fromArr?.nickname || null, // ✅ Friend name stored in DB
      lastModified: fromArr?.lastModified || chat.lastModified,
    };
  });
  return NextResponse.json({ friends });
}