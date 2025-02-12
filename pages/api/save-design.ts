import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../utils/mongodb';

export default async function saveDesign(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, fileId, sizeQuantities } = req.body;

    if (!userId || !fileId || !sizeQuantities) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('designs');

    // Save design data in MongoDB
    const designData = {
      userId,
      fileId,
      sizeQuantities,
      createdAt: new Date(),
    };
    await collection.insertOne(designData);

    res.status(200).json({ message: 'Design saved successfully' });
  } catch (error) {
    console.error('Error saving design:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
