import { ObjectId } from 'mongodb';
import { connectToDatabase } from './mongodb.js';

export async function createConversation() {
  const { db } = await connectToDatabase();
  const result = await db.collection('conversations').insertOne({
    messages: []
  });
  return result.insertedId;
}

export async function addMessagePairToConversation(convoId, userMessageId, aiResponseId) {
  const { db } = await connectToDatabase();
  await db.collection('conversations').updateOne(
    { _id: new ObjectId(convoId) },
    {
      $push: {
        messages: {
          userMessageId: new ObjectId(userMessageId),
          aiResponseId: new ObjectId(aiResponseId)
        }
      }
    }
  );
}
