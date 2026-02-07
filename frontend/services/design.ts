import api from '../config/axios';

interface TextElement {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  underline?: boolean;
  linethrough?: boolean;
  left?: number;
  top?: number;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
}

interface ImageElement {
  fileId?: string; // MinIO fileId
  src?: string; // Fallback for base64
  left?: number;
  top?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  width?: number;
  height?: number;
}

interface DesignElements {
  front: {
    texts: TextElement[];
    images: ImageElement[];
  };
  back: {
    texts: TextElement[];
    images: ImageElement[];
  };
}

export const designService = {
  quickSaveDesign: async (designData: {
    userId?: string;
    frontCanvasData?: string | null;
    backCanvasData?: string | null;
    frontImageFileId?: string | null;
    sizeQuantities: Record<string, number>;
    title: string;
    price: number;
    elements?: DesignElements;
  }) => {
    const response = await api.post('/designs/quick-save', designData);
    return response.data;
  },

  saveDesign: async (designData: {
    userId?: string;
    fileId: string;
    frontImageFileId?: string | null;
    sizeQuantities: Record<string, number>;
    title: string;
    price: number;
    elements?: DesignElements;
  }) => {
    const response = await api.post('/designs', designData);
    return response.data;
  },

  getDesigns: async () => {
    const response = await api.get('/designs');
    return response.data;
  },

  uploadFile: async (file: File | Blob) => {
    const formData = new FormData();
    
    // If it's a Blob, convert it to a File
    if (file instanceof Blob && !(file instanceof File)) {
      file = new File([file], 't-shirt-design.pdf', { type: 'application/pdf' });
    }
    
    formData.append('file', file);
    
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload file');
    }
  },
  
  // New function to download files
  getFile: async (fileId: string) => {
    try {
      const response = await api.get(`/files/${fileId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }
};
