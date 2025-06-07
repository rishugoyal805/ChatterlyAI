// app/api/pin-ai-chat/route.js
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { chatId, pin } = await req.json();
    if (!chatId) {
      return NextResponse.json({ error: "Missing chatId" }, { status: 400 });
    }
    const priority = pin ? "high" : "normal";
    const { db } = await connectToDatabase();
    await db
      .collection("chats")
      .updateOne(
        { _id: new ObjectId(chatId) },
        { $set: { priority: priority } }
      ); 

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pin chat error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
