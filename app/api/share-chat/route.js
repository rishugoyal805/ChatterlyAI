import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { target, convoId } = await req.json();

    if (!target || !convoId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Destructure db from connectToDatabase()
    const { db } = await connectToDatabase();

    const usersCollection = db.collection("users");
    const chatsCollection = db.collection("chats");

    // 1. Find user by email or nickname
    const targetUser = await usersCollection.findOne({
      $or: [{ email: target }, { nickname: target }],
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Find chat by convoId (assuming convoId is a string representation of ObjectId)
    const chatDoc = await chatsCollection.findOne({
      convoId: new ObjectId(convoId),
    });

    if (!chatDoc) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const chatId = chatDoc._id;

    // 3. Update chat owners if not already added
    await chatsCollection.updateOne(
      { _id: chatId },
      {
        $addToSet: {
          owners: new ObjectId(targetUser._id),
        },
      }
    );

    // 4. Update user chat array
    await usersCollection.updateOne(
      { _id: new ObjectId(targetUser._id) },
      {
        $addToSet: {
          chats_arr: chatId,
        },
      }
    );

    return NextResponse.json({ message: "Chat shared successfully" }, { status: 200 });
  } catch (err) {
    console.error("Share Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
