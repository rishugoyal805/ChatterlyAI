import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req) {
  const { db } = await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const chatbox_id = searchParams.get("chatbox_id");

  const chatbox = await db.collection("chatboxes").findOne({ _id: new ObjectId(chatbox_id) });

  if (!chatbox) {
    return NextResponse.json({ error: "Chatbox not found" }, { status: 404 });
  }

  return NextResponse.json({ chatbox });
}