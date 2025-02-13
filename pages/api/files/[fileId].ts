import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query;

  // Define the directory where files are stored
  const uploadDir = path.join(process.cwd(), 'uploads');

  // Construct the file path
  const filePath = path.join(uploadDir, fileId as string);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Set the appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename=${fileId}`);
    res.setHeader('Content-Type', 'application/pdf');

    // Create a read stream and pipe it to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    // If the file does not exist, return a 404 error
    res.status(404).json({ error: 'File not found' });
  }
}
