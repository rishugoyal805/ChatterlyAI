import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  const { db } = await connectToDatabase();

  const { senderEmail, chatboxId, text } = await req.json();

  const message = {
    senderEmail,
    text,
    timestamp: new Date(),
  };

  const result = await db.collection("chatboxes").updateOne(
    { _id: new ObjectId(chatboxId) },
    {
      $push: { messages: message },
      $set: { lastModified: new Date() }
    });

    console.log(Date());
  // const result = await db.collection("chatboxes").findOneAndUpdate(
  //   { _id: new ObjectId(chatboxId) },
  //   { $push: { messages: message } },
  //   { returnDocument: "after" }
  // );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Chatbox not found" }, { status: 404 });
  }
  return NextResponse.json({ message });
}