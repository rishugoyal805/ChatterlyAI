import { ObjectId } from 'mongodb';
import { connectToDatabase } from './mongodb.js';

export async function createChat({ name, convoId, ownerIds }) {
  const { db } = await connectToDatabase();
  const result = await db.collection('chats').insertOne({
    name,
    convoId: new ObjectId(convoId),
    owners: ownerIds.map(id => new ObjectId(id)),
  });
  return result.insertedId;
}
