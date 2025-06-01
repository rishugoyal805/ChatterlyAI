import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req) {
  const { db } = await connectToDatabase();
  const { userEmail, friendEmail } = await req.json();

  const existing = await db.collection("chatboxes").findOne({
    participants: { $all: [userEmail, friendEmail] },
  });

  if (existing) {
    return NextResponse.json({ success: false, message: "Chat already exists." });
  }

  const chatbox = {
    participants: [userEmail, friendEmail],
    messages: [],
  };

  const result = await db.collection("chatboxes").insertOne(chatbox);

  return NextResponse.json({ success: true, chatbox: { ...chatbox, _id: result.insertedId } });
}