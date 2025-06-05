import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const { messageId, convoId } = await req.json();

    if (!messageId || !convoId || !ObjectId.isValid(messageId) || !ObjectId.isValid(convoId)) {
      return NextResponse.json({ success: false, message: 'Invalid messageId or convoId' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const convo = await db.collection('conversations').findOne({ _id: new ObjectId(convoId) });

    if (!convo) {
      return NextResponse.json({ success: false, message: 'Conversation not found' }, { status: 404 });
    }

    // Find the message pair that includes the given messageId
    const matchedPair = convo.messages.find(
      (pair) =>
        pair.userMessageId?.toString() === messageId ||
        pair.aiResponseId?.toString() === messageId
    );

    if (!matchedPair) {
      return NextResponse.json({ success: false, message: 'Message pair not found in conversation' }, { status: 404 });
    }

    const userMsgId = matchedPair.userMessageId;
    const aiMsgId = matchedPair.aiResponseId;

    // 1. Remove the pair from the conversation.messages array
    await db.collection('conversations').updateOne(
      { _id: new ObjectId(convoId) },
      {
        $pull: {
          messages: {
            userMessageId: userMsgId,
            aiResponseId: aiMsgId,
          },
        },
      }
    );

    // 2. Delete both messages from messages collection
    await db.collection('messages').deleteMany({
      _id: { $in: [userMsgId, aiMsgId] },
    });

    return NextResponse.json({ success: true, message: 'Messages deleted successfully' });
  } catch (error) {
    console.error('Error deleting AI message pair:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}