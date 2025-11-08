import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import axios from "axios"; // ⬅️ add this line

export async function POST(req) {
  try {
    const { target, convoId } = await req.json();

    if (!target || !convoId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");
    const chatsCollection = db.collection("chats");

    const targetUser = await usersCollection.findOne({
      $or: [{ email: target }, { nickname: target }],
    });

    if (!targetUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const chatDoc = await chatsCollection.findOne({
      convoId: new ObjectId(convoId),
    });

    if (!chatDoc)
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    const chatId = chatDoc._id;

    // Update ownership
    await chatsCollection.updateOne(
      { _id: chatId },
      { $addToSet: { owners: new ObjectId(targetUser._id) } }
    );

    await usersCollection.updateOne(
      { _id: new ObjectId(targetUser._id) },
      { $addToSet: { chats_arr: chatId } }
    );

    // ✅ NEW PART — Notify Socket Server
    try {
      await axios.post("https://chatterly-backend-2.onrender.com/emit-share", {
        targetEmail: targetUser.email,
        chatbox: {
          _id: chatDoc._id,
          name: chatDoc.name || "Shared Chat",
          convoId: chatDoc.convoId.toString(),
        },
      });
    } catch (socketErr) {
      console.error("Socket notify failed:", socketErr.message);
    }

    return NextResponse.json(
      { message: "Chat shared successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Share Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}