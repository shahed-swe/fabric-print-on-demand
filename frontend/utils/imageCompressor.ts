/**
 * Compress image file to a maximum size
 * @param file - The image file to compress
 * @param maxSizeMB - Maximum file size in MB (default: 2MB)
 * @returns Promise<File> - Compressed image file
 */
export const compressImage = async (
  file: File,
  maxSizeMB: number = 2
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Start with original dimensions
        let width = img.width;
        let height = img.height;

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format - preserve PNG for transparency
        const isTransparent = file.type === 'image/png';
        const outputFormat = isTransparent ? 'image/png' : 'image/jpeg';
        let quality = isTransparent ? 0.9 : 0.95;
        let compressedFile: File;

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              const sizeInMB = blob.size / (1024 * 1024);

              // If size is acceptable or quality is too low, resolve
              if (sizeInMB <= maxSizeMB || quality <= (isTransparent ? 0.1 : 0.05)) {
                compressedFile = new File([blob], file.name, {
                  type: outputFormat,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // Reduce quality and try again
                quality -= isTransparent ? 0.1 : 0.1;
                canvas.toBlob(tryCompress, outputFormat, quality);
              }
            },
            outputFormat,
            quality
          );
        };

        tryCompress();
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

/**
 * Compress image with dimensions reduction
 * @param file - The image file to compress
 * @param maxSizeMB - Maximum file size in MB (default: 2MB)
 * @param maxWidth - Maximum width in pixels (default: 1920)
 * @param maxHeight - Maximum height in pixels (default: 1920)
 * @returns Promise<File> - Compressed image file
 */
export const compressImageWithDimensions = async (
  file: File,
  maxSizeMB: number = 2,
  maxWidth: number = 1920,
  maxHeight: number = 1920
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate dimensions with aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format - preserve PNG for transparency
        const isTransparent = file.type === 'image/png';
        const outputFormat = isTransparent ? 'image/png' : 'image/jpeg';
        let quality = isTransparent ? 0.9 : 0.9;
        let compressedFile: File;

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              const sizeInMB = blob.size / (1024 * 1024);

              // If size is acceptable or quality is too low, resolve
              if (sizeInMB <= maxSizeMB || quality <= (isTransparent ? 0.1 : 0.05)) {
                compressedFile = new File([blob], file.name, {
                  type: outputFormat,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // Reduce quality and try again
                quality -= isTransparent ? 0.1 : 0.05;
                canvas.toBlob(tryCompress, outputFormat, quality);
              }
            },
            outputFormat,
            quality
          );
        };

        tryCompress();
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};
