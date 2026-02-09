import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useLocation } from 'react-router-dom';

const DesignElements = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState({});
  const location = useLocation();

  useEffect(() => {
    fetchDesigns();
  }, []);

  useEffect(() => {
    // Check if there's a designId in the URL query params
    const params = new URLSearchParams(location.search);
    const designId = params.get('designId');
    
    if (designId && designs.length > 0) {
      const design = designs.find(d => d._id === designId);
      if (design) {
        viewDesignDetails(design);
      }
    }
  }, [location.search, designs]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/designs');
      setDesigns(response.data);
      
      // Build users map from the design data which now includes user info
      const usersMap = {};
      response.data.forEach(design => {
        if (design.user) {
          usersMap[design.userId] = design.user;
        }
      });
      setUsers(usersMap);
    } catch (error) {
      console.error('Error fetching designs:', error);
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const viewDesignDetails = (design) => {
    setSelectedDesign(design);
    setShowModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageUrl = (fileId) => {
    // REACT_APP_API_URL already includes /api, so just append /files
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    return `${baseUrl}/files/${fileId}`;
  };

  const downloadAllImages = async (design) => {
    try {
      const zip = new JSZip();
      const imageFolder = zip.folder('images');
      
      // Collect all image fileIds from front and back
      const allImages = [];
      
      if (design.elements?.front?.images) {
        design.elements.front.images.forEach((img, index) => {
          if (img.fileId) {
            allImages.push({ fileId: img.fileId, name: `front-image-${index + 1}` });
          }
        });
      }
      
      if (design.elements?.back?.images) {
        design.elements.back.images.forEach((img, index) => {
          if (img.fileId) {
            allImages.push({ fileId: img.fileId, name: `back-image-${index + 1}` });
          }
        });
      }
      
      // Create text files for front and back texts
      const frontTexts = design.elements?.front?.texts || [];
      const backTexts = design.elements?.back?.texts || [];
      
      if (frontTexts.length > 0) {
        let frontTextContent = 'FRONT SIDE TEXT ELEMENTS\n';
        frontTextContent += '=' .repeat(50) + '\n\n';
        
        frontTexts.forEach((text, index) => {
          frontTextContent += `Text ${index + 1}:\n`;
          frontTextContent += `Content: ${text.text}\n`;
          frontTextContent += `Font Family: ${text.fontFamily}\n`;
          frontTextContent += `Font Size: ${text.fontSize}px\n`;
          frontTextContent += `Color: ${text.color}\n`;
          frontTextContent += `Font Weight: ${text.fontWeight}\n`;
          frontTextContent += `Font Style: ${text.fontStyle}\n`;
          frontTextContent += `Text Align: ${text.textAlign}\n`;
          frontTextContent += `Position: Left ${text.left}, Top ${text.top}\n`;
          frontTextContent += `Rotation: ${text.angle || 0}°\n`;
          frontTextContent += `Scale: X ${text.scaleX || 1}, Y ${text.scaleY || 1}\n`;
          if (text.underline) frontTextContent += 'Underline: Yes\n';
          if (text.linethrough) frontTextContent += 'Strikethrough: Yes\n';
          frontTextContent += '\n' + '-'.repeat(50) + '\n\n';
        });
        
        zip.file('front-texts.txt', frontTextContent);
      }
      
      if (backTexts.length > 0) {
        let backTextContent = 'BACK SIDE TEXT ELEMENTS\n';
        backTextContent += '='.repeat(50) + '\n\n';
        
        backTexts.forEach((text, index) => {
          backTextContent += `Text ${index + 1}:\n`;
          backTextContent += `Content: ${text.text}\n`;
          backTextContent += `Font Family: ${text.fontFamily}\n`;
          backTextContent += `Font Size: ${text.fontSize}px\n`;
          backTextContent += `Color: ${text.color}\n`;
          backTextContent += `Font Weight: ${text.fontWeight}\n`;
          backTextContent += `Font Style: ${text.fontStyle}\n`;
          backTextContent += `Text Align: ${text.textAlign}\n`;
          backTextContent += `Position: Left ${text.left}, Top ${text.top}\n`;
          backTextContent += `Rotation: ${text.angle || 0}°\n`;
          backTextContent += `Scale: X ${text.scaleX || 1}, Y ${text.scaleY || 1}\n`;
          if (text.underline) backTextContent += 'Underline: Yes\n';
          if (text.linethrough) backTextContent += 'Strikethrough: Yes\n';
          backTextContent += '\n' + '-'.repeat(50) + '\n\n';
        });
        
        zip.file('back-texts.txt', backTextContent);
      }
      
      // Create a summary file
      let summaryContent = `DESIGN SUMMARY\n`;
      summaryContent += `${'='.repeat(50)}\n\n`;
      summaryContent += `Design Title: ${design.title}\n`;
      summaryContent += `Design ID: ${design._id}\n`;
      summaryContent += `Price: $${design.price.toFixed(2)}\n`;
      summaryContent += `Created: ${new Date(design.createdAt).toLocaleString()}\n\n`;
      summaryContent += `Front Elements:\n`;
      summaryContent += `  - Texts: ${frontTexts.length}\n`;
      summaryContent += `  - Images: ${design.elements?.front?.images?.length || 0}\n\n`;
      summaryContent += `Back Elements:\n`;
      summaryContent += `  - Texts: ${backTexts.length}\n`;
      summaryContent += `  - Images: ${design.elements?.back?.images?.length || 0}\n`;
      
      zip.file('design-info.txt', summaryContent);
      
      if (allImages.length === 0 && frontTexts.length === 0 && backTexts.length === 0) {
        toast.warning('No content to download');
        return;
      }
      
      toast.info(`Preparing download with ${allImages.length} images and ${frontTexts.length + backTexts.length} texts...`);
      
      // Download all images
      if (allImages.length > 0) {
        const downloadPromises = allImages.map(async ({ fileId, name }) => {
          try {
            const response = await fetch(getImageUrl(fileId));
            const blob = await response.blob();
            const extension = fileId.split('.').pop();
            imageFolder.file(`${name}.${extension}`, blob);
          } catch (error) {
            console.error(`Failed to download ${fileId}:`, error);
          }
        });
        
        await Promise.all(downloadPromises);
      }
      
      // Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${design.title.replace(/\s+/g, '-')}-design.zip`);
      toast.success('Design files downloaded successfully!');
    } catch (error) {
      console.error('Error downloading design:', error);
      toast.error('Failed to download design files');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading designs...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Design Elements</h1>
        <p className="text-gray-600 mt-1">View all custom designs and their elements</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Design ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Elements
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {designs.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No designs found
                </td>
              </tr>
            ) : (
              designs.map((design) => {
                const frontTexts = design.elements?.front?.texts?.length || 0;
                const frontImages = design.elements?.front?.images?.length || 0;
                const backTexts = design.elements?.back?.texts?.length || 0;
                const backImages = design.elements?.back?.images?.length || 0;
                const totalElements = frontTexts + frontImages + backTexts + backImages;

                return (
                  <tr key={design._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      #{design._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{design.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{users[design.userId]?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{users[design.userId]?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {totalElements > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {totalElements} elements
                          </span>
                        ) : (
                          <span className="text-gray-400">No elements</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {frontTexts + backTexts > 0 && `${frontTexts + backTexts} texts`}
                        {frontTexts + backTexts > 0 && frontImages + backImages > 0 && ', '}
                        {frontImages + backImages > 0 && `${frontImages + backImages} images`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${design.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(design.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewDesignDetails(design)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for design details */}
      {showModal && selectedDesign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Design: {selectedDesign.title}
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => downloadAllImages(selectedDesign)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download All
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* PDF Preview Section */}
              {selectedDesign.fileId && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Design PDF Preview</h4>
                        <p className="text-xs text-gray-600 mt-1">Generated design with front and back views</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">File ID: {selectedDesign.fileId}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={getImageUrl(selectedDesign.fileId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View PDF
                      </a>
                      <a
                        href={getImageUrl(selectedDesign.fileId)}
                        download={`${selectedDesign.title.replace(/\\s+/g, '-')}.pdf`}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Front Elements */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm mr-2">FRONT</span>
                  Front Side Elements
                </h4>
                
                {/* Front Texts */}
                {selectedDesign.elements?.front?.texts?.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Text Elements ({selectedDesign.elements.front.texts.length})</h5>
                    <div className="space-y-2">
                      {selectedDesign.elements.front.texts.map((text, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                          <div className="font-medium" style={{ 
                            fontFamily: text.fontFamily,
                            fontSize: '16px',
                            color: text.color,
                            fontWeight: text.fontWeight,
                            fontStyle: text.fontStyle
                          }}>
                            "{text.text}"
                          </div>
                          <div className="text-xs text-gray-500 mt-2 grid grid-cols-3 gap-2">
                            <span>Font: {text.fontFamily}</span>
                            <span>Size: {text.fontSize}px</span>
                            <span>Color: {text.color}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Front Images */}
                {selectedDesign.elements?.front?.images?.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Images ({selectedDesign.elements.front.images.length})</h5>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedDesign.elements.front.images.map((img, index) => {
                        const imageUrl = img.fileId ? getImageUrl(img.fileId) : null;
                        return (
                          <div key={index} className="bg-gray-50 p-2 rounded border border-gray-200">
                            {imageUrl ? (
                              <>
                                <img 
                                  src={imageUrl} 
                                  alt={`Front image ${index + 1}`}
                                  className="w-full h-32 object-contain bg-white rounded"
                                  onError={(e) => {
                                    console.error('Failed to load image:', imageUrl);
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                  onLoad={() => console.log('Image loaded successfully:', imageUrl)}
                                />
                                <div className="w-full h-32 bg-red-100 rounded items-center justify-center p-2" style={{ display: 'none' }}>
                                  <span className="text-xs text-red-600 text-center">Failed to load image</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 break-all">
                                  FileID: {img.fileId.slice(-12)}
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-500">No File ID</span>
                              </div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              {img.width} x {img.height}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!selectedDesign.elements?.front?.texts?.length && !selectedDesign.elements?.front?.images?.length && (
                  <p className="text-gray-400 text-sm">No front elements</p>
                )}
              </div>

              {/* Back Elements */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">BACK</span>
                  Back Side Elements
                </h4>
                
                {/* Back Texts */}
                {selectedDesign.elements?.back?.texts?.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Text Elements ({selectedDesign.elements.back.texts.length})</h5>
                    <div className="space-y-2">
                      {selectedDesign.elements.back.texts.map((text, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                          <div className="font-medium" style={{ 
                            fontFamily: text.fontFamily,
                            fontSize: '16px',
                            color: text.color,
                            fontWeight: text.fontWeight,
                            fontStyle: text.fontStyle
                          }}>
                            "{text.text}"
                          </div>
                          <div className="text-xs text-gray-500 mt-2 grid grid-cols-3 gap-2">
                            <span>Font: {text.fontFamily}</span>
                            <span>Size: {text.fontSize}px</span>
                            <span>Color: {text.color}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Back Images */}
                {selectedDesign.elements?.back?.images?.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Images ({selectedDesign.elements.back.images.length})</h5>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedDesign.elements.back.images.map((img, index) => {
                        const imageUrl = img.fileId ? getImageUrl(img.fileId) : null;
                        return (
                          <div key={index} className="bg-gray-50 p-2 rounded border border-gray-200">
                            {imageUrl ? (
                              <>
                                <img 
                                  src={imageUrl} 
                                  alt={`Back image ${index + 1}`}
                                  className="w-full h-32 object-contain bg-white rounded"
                                  onError={(e) => {
                                    console.error('Failed to load image:', imageUrl);
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                  onLoad={() => console.log('Image loaded successfully:', imageUrl)}
                                />
                                <div className="w-full h-32 bg-red-100 rounded items-center justify-center p-2" style={{ display: 'none' }}>
                                  <span className="text-xs text-red-600 text-center">Failed to load image</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 break-all">
                                  FileID: {img.fileId.slice(-12)}
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-500">No File ID</span>
                              </div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              {img.width} x {img.height}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!selectedDesign.elements?.back?.texts?.length && !selectedDesign.elements?.back?.images?.length && (
                  <p className="text-gray-400 text-sm">No back elements</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignElements;
