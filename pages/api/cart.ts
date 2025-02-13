import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('designs');

    switch (req.method) {
      case 'GET':
        const cartItems = await collection.find({ userId }).toArray();
        res.status(200).json(cartItems);
        break;
      case 'POST':
        const newItem = req.body;
        newItem.userId = userId;
        await collection.insertOne(newItem);
        res.status(201).json(newItem);
        break;
      case 'DELETE':
        const { id } = req.body;
        if (id) {
          await collection.deleteOne({ _id: new ObjectId(id), userId });
          res.status(200).json({ message: 'Item removed' });
        } else {
          await collection.deleteMany({ userId });
          res.status(200).json({ message: 'All items removed' });
        }
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling cart request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
