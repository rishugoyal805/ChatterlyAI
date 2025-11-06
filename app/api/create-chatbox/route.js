import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  const { db } = await connectToDatabase();
  const { userEmail, friendEmail, friendName } = await req.json();

  // Validate input
  if (!userEmail || !friendEmail || !friendName) {
    return NextResponse.json({ success: false, message: "Enter friend name and email both" }, { status: 400 });
  }

  // Check if friend exists
  const friend = await db.collection("users").findOne({ 
    $or: [
      { email: friendEmail },
      { nickname: friendEmail } // in case user entered nickname
    ]
  });

  if (!friend) {
    return NextResponse.json(
      { success: false, message: "Friend not found." }, 
      { status: 404 }
    );
  }

  const actualFriendEmail = friend.email;

  // Check if chatbox already exists
  const existing = await db.collection("chatboxes").findOne({
    participants: { $all: [userEmail, actualFriendEmail] },
  });

  if (existing) {
    return NextResponse.json({ 
      success: false, 
      message: "Chat already exists." 
    });
  }

  // Create new chatbox
  const chatbox = {
    participants: [userEmail, actualFriendEmail],
    messages: [],
    lastModified: new Date(),
  };

  const result = await db.collection("chatboxes").insertOne(chatbox);
  const insertedId = result.insertedId;

  // ✅ Update both users' frnd_arr with new structure
  const friendEntryForUser = {
    chatbox_id: insertedId,
    email: actualFriendEmail,
    name: friendName || friend.nickname || "",
    lastModified: new Date(),
  };

  const friendEntryForFriend = {
    chatbox_id: insertedId,
    email: userEmail,
    name: friend.name || "",
    lastModified: new Date(),
  };

  // Add chatbox to both users' frnd_arr
  await db.collection("users").updateOne(
    { email: userEmail },
    { $addToSet: { frnd_arr: friendEntryForUser } }
  );
  await db.collection("users").updateOne(
    { email: actualFriendEmail },
    { $addToSet: { frnd_arr: friendEntryForFriend } }
  );

  // ✅ Return chatbox and friend info
  return NextResponse.json({
    success: true,
    chatbox: { ...chatbox, _id: insertedId },
    friend: {
      email: friend.email,
      nickname: friend.nickname || "",
    },
  });
}
