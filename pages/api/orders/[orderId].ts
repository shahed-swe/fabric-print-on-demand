import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { orderId } = req.query;
    const { status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    try {
      const { db } = await connectToDatabase();
      const ordersCollection = db.collection('orders');

      await ordersCollection.updateOne(
        { _id: new ObjectId(orderId as string) },
        { $set: { status } }
      );

      return res.status(200).json({ message: 'Order status updated successfully' });
    } catch (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
