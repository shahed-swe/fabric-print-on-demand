import api from '../config/axios';

export const designService = {
  saveDesign: async (designData: {
    fileId: string;
    sizeQuantities: Record<string, number>;
    title: string;
    price: number;
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
