// app/api/add-message-pair/route.js

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb'; // Adjust this path as needed

export async function POST(req) {
  try {
    const { convoId, userMessageId, aiResponseId } = await req.json();

    if (!convoId || !userMessageId || !aiResponseId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('conversations').updateOne(
      { _id: new ObjectId(convoId) },
      {
        $push: {
          messages: {
            userMessageId: new ObjectId(userMessageId),
            aiResponseId: new ObjectId(aiResponseId)
          }
        }
      },
      { upsert: true } // Creates the convo if it doesn't exist
    );

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error adding message pair:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
