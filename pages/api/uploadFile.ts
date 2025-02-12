import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '../../utils/mongodb';

// Disable Next.js default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function uploadFile(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const filename = `${Date.now()}-uploadedFile.pdf`; // Generate unique filename
    const filePath = path.join(uploadDir, filename);
    const writeStream = fs.createWriteStream(filePath);

    req.pipe(writeStream);

    writeStream.on('finish', async () => {
      try {
        const { db } = await connectToDatabase();
        const collection = db.collection('uploads');

        // Store file information in MongoDB
        const fileInfo = {
          filename,
          filePath,
          uploadedAt: new Date(),
        };
        await collection.insertOne(fileInfo);

        res.status(200).json({ fileId: filename });
      } catch (dbError) {
        console.error('Database error:', dbError);
        res.status(500).json({ error: 'Error saving file information to database' });
      }
    });

    writeStream.on('error', (err) => {
      console.error('Error writing file:', err);
      res.status(500).json({ error: 'Error saving file' });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
