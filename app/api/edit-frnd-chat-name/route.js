import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { userEmail, chatboxId, newName } = await req.json();

    if (!userEmail || !chatboxId || !newName) {
      return NextResponse.json(
        { success: false, message: "Missing parameters." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // ✅ Update the user's frnd_arr entry
    const updateResult = await db.collection("users").updateOne(
      { email: userEmail, "frnd_arr.chatbox_id": new ObjectId(chatboxId) },
      {
        $set: {
          "frnd_arr.$.name": newName,
          "frnd_arr.$.lastModified": new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "No matching friend found.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Friend name updated successfully.",
    });
  } catch (err) {
    console.error("Error updating friend name:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
