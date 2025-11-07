import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { db } = await connectToDatabase();
    const { userEmail, chatboxId } = await req.json();

    if (!userEmail || !chatboxId) {
      return NextResponse.json(
        { success: false, message: "Missing parameters" },
        { status: 400 }
      );
    }

    const chatObjectId = new ObjectId(chatboxId);

    // ✅ Find the chatbox first
    const chatbox = await db.collection("chatboxes").findOne({ _id: chatObjectId });

    if (!chatbox) {
      return NextResponse.json(
        { success: false, message: "Chatbox not found." },
        { status: 404 }
      );
    }

    // ✅ Delete related messages from frnd_msg
    if (Array.isArray(chatbox.messages) && chatbox.messages.length > 0) {
      const messageIds = chatbox.messages.map((msgId) =>
        typeof msgId === "string" ? new ObjectId(msgId) : msgId
      );

      const deleteMsgResult = await db
        .collection("frnd_msg")
        .deleteMany({ _id: { $in: messageIds } });

      console.log(`🗑 Deleted ${deleteMsgResult.deletedCount} related messages.`);
    }

    // ✅ Delete the chatbox itself
    await db.collection("chatboxes").deleteOne({ _id: chatObjectId });

    // ✅ Remove chatbox from both users' frnd_arr
    await db.collection("users").updateMany(
      {},
      { $pull: { frnd_arr: { chatbox_id: chatObjectId } } }
    );

    return NextResponse.json({
      success: true,
      message: "Chat and related messages deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Error deleting chatbox and messages:", error);
    return NextResponse.json(
      { success: false, message: "Server error while deleting chat." },
      { status: 500 }
    );
  }
}
