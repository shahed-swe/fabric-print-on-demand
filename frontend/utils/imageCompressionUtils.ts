/**
 * Compress canvas blob to a maximum size with adaptive quality reduction
 * @param blob - The blob to compress
 * @param canvas - The HTML canvas element to use for recompression
 * @param maxSizeKB - Maximum file size in KB (default: 800KB)
 * @returns Promise<Blob> - Compressed blob
 */
export const compressCanvasBlob = async (
  blob: Blob,
  canvas: HTMLCanvasElement,
  maxSizeKB: number = 800
): Promise<Blob> => {
  const maxSizeBytes = maxSizeKB * 1024;

  // If already under limit, return as is
  if (blob.size <= maxSizeBytes) {
    console.log(`Blob size ${(blob.size / 1024).toFixed(2)}KB is within ${maxSizeKB}KB limit`);
    return blob;
  }

  console.log(`Blob size ${(blob.size / 1024).toFixed(2)}KB exceeds ${maxSizeKB}KB, compressing...`);

  // Progressive quality reduction using WebP format
  let quality = 0.7;
  let compressedBlob = blob;

  while (compressedBlob.size > maxSizeBytes && quality > 0.1) {
    compressedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Compression failed'))),
        'image/webp',
        quality
      );
    });
    console.log(`Attempted compression at quality ${quality}: ${(compressedBlob.size / 1024).toFixed(2)}KB`);
    quality -= 0.1;
  }

  if (compressedBlob.size > maxSizeBytes) {
    console.warn(
      `Could not compress to ${maxSizeKB}KB. Final size: ${(compressedBlob.size / 1024).toFixed(2)}KB`
    );
  } else {
    console.log(`Successfully compressed to ${(compressedBlob.size / 1024).toFixed(2)}KB`);
  }

  return compressedBlob;
};
