import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
    try {
        const { messageId, convoId } = await req.json();

        if (!messageId || !convoId ||
            !ObjectId.isValid(messageId) || !ObjectId.isValid(convoId)) {
            return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        const conversation = await db.collection('conversations').findOne({ _id: new ObjectId(convoId) });
        if (!conversation) {
            return NextResponse.json({ success: false, message: 'Conversation not found' }, { status: 404 });
        }

        // Find the index of the pair that contains the userMessageId
        const index = conversation.messages.findIndex(
            (pair) => pair.userMessageId.toString() === messageId
        );

        if (index === -1) {
            return NextResponse.json({ success: false, message: 'Message not found in conversation' }, { status: 404 });
        }

        // Slice from the current index to the end
        const pairsToDelete = conversation.messages.slice(index);
        const idsToDelete = pairsToDelete.flatMap(pair => [
            pair.userMessageId,
            pair.aiResponseId
        ]);

        // Delete messages from the `messages` collection
        await db.collection('messages').deleteMany({
            _id: { $in: idsToDelete }
        });
        console.log("deleted many ")
        // Trim the conversation to remove message pairs from index onwards
        await db.collection('conversations').updateOne(
            { _id: new ObjectId(convoId) },
            { $set: { messages: conversation.messages.slice(0, index) } }
        );
        console.log("updated many ")
        return NextResponse.json({
            success: true,
            deletedCount: idsToDelete.length,
            message: 'Deleted selected and subsequent messages.',
            updatedMessages: conversation.messages.slice(0, index),
        });

    } catch (error) {
        console.error('Error editing AI message:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
