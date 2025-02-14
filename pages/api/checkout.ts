import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, items, paymentStatus } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    try {
      const { db } = await connectToDatabase();
      const ordersCollection = db.collection('orders');

      const order = {
        userId,
        items,
        paymentStatus: paymentStatus || 'pending',
        status: "Processing",
        createdAt: new Date(),
      };

      await ordersCollection.insertOne(order);

      return res.status(200).json({ message: 'Order placed successfully' });
    } catch (error) {
      console.error('Error placing order:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      const ordersCollection = db.collection('orders');
      const usersCollection = db.collection('users');

      const orders = await ordersCollection.find().toArray();

      // Fetch user details for each order
      const ordersWithUserDetails = await Promise.all(
        orders.map(async (order) => {
          const user = await usersCollection.findOne({ _id: new ObjectId(order.userId) });
          return { ...order, user };
        })
      );

      return res.status(200).json(ordersWithUserDetails);
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
