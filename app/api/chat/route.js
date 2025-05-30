import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSession } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { NextResponse } from "next/server"

// Allow streaming responses up to less than 60 seconds
export const maxDuration = 59

export async function POST(req) {
  try {
    // Verify authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messages } = await req.json()

    // Store the conversation in the database
    const { db } = await connectToDatabase()
    await db.collection("conversations").insertOne({
      userId: session.user.id,
      // message: messages[messages.length - 1].content,
      message: messages[messages.length - 1].content,
      timestamp: new Date(),
    })

    // Generate response using AI SDK
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Use Gemini API key
    console.log(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: messages.map(m => ({ text: m.content })) }],
    });
   
    console.log("Raw AI response:", result);
    const responseText = result.response?.candidates?.[0]?.content?.parts?.map(part => part.text).join(" ") || "AI did not provide a response";
    console.log("AI response" ,responseText);
    
    return NextResponse.json({ content: responseText });
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
