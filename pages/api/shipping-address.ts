import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../utils/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('shipping_addresses');

    switch (req.method) {
      case 'GET':
        {
          const { userId } = req.query;
          if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
          }
          
          const addresses = await collection.find({ userId: userId.toString() }).toArray();
          return res.status(200).json(addresses);
        }

      case 'POST':
        {
          const { userId: bodyUserId, ...addressData } = req.body;
          
          if (!bodyUserId) {
            return res.status(400).json({ error: 'Missing userId in request body' });
          }

          // Create new address document
          const newAddress = {
            ...addressData,
            userId: bodyUserId,
            createdAt: new Date(),
          };

          try {
            const result = await collection.insertOne(newAddress);
            return res.status(201).json({
              success: true,
              _id: result.insertedId,
              ...newAddress
            });
          } catch (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ error: 'Error saving address to database' });
          }
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
