import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(req) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { event, data } = await req.json()

    const { db } = await connectToDatabase()
    await db.collection("analytics").insertOne({
      userId: session.user.id,
      event,
      data,
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (you would need to add an isAdmin field to your user model)
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ _id: session.user.id })

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get analytics data
    const analytics = await db
      .collection("analytics")
      .aggregate([
        {
          $group: {
            _id: "$event",
            count: { $sum: 1 },
            users: { $addToSet: "$userId" },
          },
        },
        {
          $project: {
            _id: 0,
            event: "$_id",
            count: 1,
            uniqueUsers: { $size: "$users" },
          },
        },
      ])
      .toArray()

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

