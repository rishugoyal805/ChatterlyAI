import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // 1. Get the user
    const user = await db.collection('users').findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 2. Create a new conversation
    const convoResult = await db.collection('conversations').insertOne({ messages: [] });

    // 3. Create a new chat referencing the conversation
    const chatResult = await db.collection('chats').insertOne({
      name: 'New Chat',
      convoId: convoResult.insertedId,
      owners: [user._id],
      priority: "normal",
    });
    // ✅ 4. Push chat ID into user's chats_arr
    await db.collection('users').updateOne(
      { _id: user._id },
      { $push: { chats_arr: chatResult.insertedId } }
    );

    // 5. Return the conversation ID to redirect user
    return NextResponse.json({ convoId: convoResult.insertedId.toString() });
  } catch (error) {
    console.error('Error creating new chat:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
