// app/api/edit-ai-chat-name/route.js
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import axios from "axios";  

export async function POST(req) {
  try {
    const { chatId, newName } = await req.json();
    if (!chatId || !newName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    await db.collection("chats").updateOne(
      { _id: new ObjectId(chatId) },
      { $set: { name: newName } }
    );

    // ✅ Tell socket server to emit update
    await axios.post("https://chatterly-backend-2.onrender.com/emit-chat-rename", {
      chatId,
      newName,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Edit chat name error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}