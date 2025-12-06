// app/api/profile/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
// import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth"; // ✅ ADD THIS
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error("Profile GET error:", err)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// export async function PUT(req) {
//   try {
//     const session = await getServerSession(authOptions)

//     if (!session?.user?.email) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
//     }

//     const body = await req.json()
//     const { name, email, oldPass, newPass} = body

//     if (!oldPass) {
//       return NextResponse.json({ message: "Old Password is required." }, { status: 400 })
//     }
//      if (!newPass) {
//       return NextResponse.json({ message: "New Password is required." }, { status: 400 })
//     }

//     const password = await bcrypt.hash(newPass, 10);
    
//     const { db } = await connectToDatabase()
//     const result = await db.collection("users").updateOne(
//       { email: session.user.email },
//       { $set: { name, email, password, nickname } }
//     )

//     if (result.modifiedCount === 0) {
//       return NextResponse.json({ message: "No changes made" }, { status: 400 })
//     }

//     return NextResponse.json({ message: "Profile updated successfully" })
//   } catch (error) {
//     console.error("Profile update error:", error)
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 })
//   }
// }
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, oldPass, newPass } = body;

    if (!oldPass) {
      return NextResponse.json({ message: "Old Password is required." }, { status: 400 });
    }

    if (!newPass) {
      return NextResponse.json({ message: "New Password is required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // 1️⃣ FETCH USER
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 2️⃣ CHECK OLD PASSWORD
    const isOldCorrect = await bcrypt.compare(oldPass, user.password);

    if (!isOldCorrect) {
      return NextResponse.json({ message: "Old password is incorrect" }, { status: 400 });
    }

    // 3️⃣ HASH NEW PASSWORD
    const hashedNewPassword = await bcrypt.hash(newPass, 10);

    // 4️⃣ UPDATE DB
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          name,
          password: hashedNewPassword,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "No changes made" }, { status: 400 });
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
