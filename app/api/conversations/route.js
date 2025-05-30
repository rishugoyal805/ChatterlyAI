import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = new ObjectId(session.user.id)

    // Get conversations grouped by date
    const conversations = await db
      .collection("conversations")
      .aggregate([
        { $match: { userId: userId.toString() } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
            },
            messages: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            conversations: {
              $map: {
                input: "$messages",
                as: "message",
                in: {
                  id: { $toString: "$$message._id" },
                  title: { $substr: ["$$message.message", 0, 30] },
                  preview: "$$message.message",
                  createdAt: "$$message.timestamp",
                },
              },
            },
          },
        },
        { $sort: { date: -1 } },
      ])
      .toArray()

    // Flatten the conversations array
    const flattenedConversations = conversations.reduce((acc, day) => {
      return [...acc, ...day.conversations]
    }, [])

    return NextResponse.json({ conversations: flattenedConversations })
  } catch (error) {
    console.error("Get conversations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

