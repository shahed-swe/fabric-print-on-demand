import { useCallback, useEffect, useState } from "react";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { fabric } from "fabric";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenFancy, faFont, faSmile, faImage, faPalette, faTrash } from "@fortawesome/free-solid-svg-icons";
import EmojiPicker from "emoji-picker-react";
import Display from "../components/Display";
import PricingCalculator from "../components/PricingCalculator";
import debounce from 'lodash.debounce';
import { Configuration, OpenAIApi } from 'openai';
import TextStyler from "../components/TextStyler";

// Import t-shirt images
const TShirtFront = "/images/crew_front.png";
const TShirtBack = "/images/crew_back.png";
const HoodieFront = "/images/mens_hoodie_front.png";
const HoodieBack = "/images/mens_hoodie_back.png";
const LongSleeveFront = "/images/mens_longsleeve_front.png";
const LongSleeveBack = "/images/mens_longsleeve_back.png";
const MensTankFront = "/images/mens_tank_front.png";
const MensTankBack = "/images/mens_tank_back.png";
const WomenFront = "/images/womens_crew_front.png";
const WomenBack = "/images/womens_crew_back.png";

const Index = () => {
  const [back, setBack] = useState("front");
  const [color, setColor] = useState("");
  const [image, setImage] = useState<any>(null);
  const [size, setSize] = useState("");
  const { editor, onReady } = useFabricJSEditor();
  const [frontData, setFrontData] = useState<string | null>(null);
  const [backData, setBackData] = useState<string | null>(null);
  const [frontPrice, setFrontPrice] = useState(0);
  const [backPrice, setBackPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [aiImagePrompt, setAiImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Add emoji handling function
  const onEmojiClick = (emojiData: any) => {
    if (!editor?.canvas) return;
    
    const textBox = new fabric.Text(emojiData.emoji, {
      left: editor.canvas.width ? editor.canvas.width / 2 : 100,
      top: editor.canvas.height ? editor.canvas.height / 2 : 100,
      originX: 'center',
      originY: 'center',
      fontSize: 30,
    });

    editor.canvas.add(textBox);
    editor.canvas.setActiveObject(textBox);
    setSelectedObject(textBox);
    editor.canvas.renderAll();
    setShowEmojiPicker(false);
  };

  // State for artwork
  const [showArtModal, setShowArtModal] = useState(false);
  const [showPixabay, setShowPixabay] = useState(false);
  const [showEfgCollection, setShowEfgCollection] = useState(false);
  const [artworkDataPixy, setArtworkDataPixy] = useState<any[]>([]);
  const [artworkDataEFG, setArtworkDataEFG] = useState<any[]>([]);

  // Add new state for size quantities
  type TShirtSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';
  type SizeQuantities = {
    [key in TShirtSize]: number;
  };

  const [sizeQuantities, setSizeQuantities] = useState<SizeQuantities>({
    'S': 0,
    'M': 0,
    'L': 0,
    'XL': 0,
    'XXL': 0
  });

  // Function to handle size quantity changes
  const handleSizeQuantityChange = (size: TShirtSize, quantity: number) => {
    if (quantity < 0) return; // Prevent negative quantities
    setSizeQuantities(prev => ({
      ...prev,
      [size]: quantity
    }));
  };

  // Function to get total quantity
  const getTotalQuantity = () => {
    return Object.values(sizeQuantities).reduce((sum, quantity) => sum + quantity, 0);
  };

  // Initialize data
  useEffect(() => {
    const initialData = [
      {
        front: { src: TShirtFront },
        back: { src: TShirtBack },
        title: "Mens T-shirt",
        price: "500"
      },
      {
        front: { src: WomenFront },
        back: { src: WomenBack },
        title: "Women's T-shirt",
        price: "500"
      },
      {
        front: { src: HoodieFront },
        back: { src: HoodieBack },
        title: "Hoodie",
        price: "800"
      },
      {
        front: { src: LongSleeveFront },
        back: { src: LongSleeveBack },
        title: "Long Sleeve",
        price: "600"
      },
      {
        front: { src: MensTankFront },
        back: { src: MensTankBack },
        title: "Mens Tank",
        price: "450"
      }
    ];
    setData(initialData);
    setImage(initialData[0]);
  }, []);

  // Handle canvas data
  useEffect(() => {
    if (!editor) return;

    const json = JSON.stringify(editor.canvas.toJSON());
    if (back === "back") {
      setBackData(json);
      localStorage.setItem("back", json);
    } else {
      setFrontData(json);
      localStorage.setItem("front", json);
    }
  }, [back, editor]);

  // Calculate prices
  useEffect(() => {
    try {
      const front = frontData ? JSON.parse(frontData) : null;
      const back = backData ? JSON.parse(backData) : null;

      setFrontPrice(front?.objects?.length > 0 ? 100 : 0);
      setBackPrice(back?.objects?.length > 0 ? 100 : 0);
    } catch (error) {
      console.error("Error calculating prices:", error);
    }
  }, [frontData, backData]);

  const handleBack = (data: string) => {
    if (data === "back") {
      const json = JSON.stringify(editor?.canvas.toJSON());
      setFrontData(json);
      localStorage.setItem("front", json);
      editor?.canvas.clear();
      editor?.canvas.loadFromJSON(
        backData,
        editor?.canvas.renderAll.bind(editor?.canvas)
      );
    } else {
      const json = JSON.stringify(editor?.canvas.toJSON());
      setBackData(json);
      localStorage.setItem("back", json);
      editor?.canvas.clear();
      editor?.canvas.loadFromJSON(
        frontData,
        editor?.canvas.renderAll.bind(editor?.canvas)
      );
    }
    setBack(data);
    return data;
  };

  // Handle file upload
  const handleAddImage = (file: File) => {
    if (!editor || !file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        if (editor && editor.canvas) {
          const fabricImage = new fabric.Image(img, {
            left: (editor.canvas.width || 200) / 2,
            top: (editor.canvas.height || 400) / 2,
            originX: 'center',
            originY: 'center',
          });
          editor.canvas.add(fabricImage);
          editor.canvas.setActiveObject(fabricImage);
          editor.canvas.renderAll();
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Handle URL-based image
  const handleAddImageFromUrl = async (url: string) => {
    if (!editor) return;

    try {
      // Use our proxy API to avoid CORS issues
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = proxyUrl;

      img.onload = () => {
        // Calculate scale to fit within canvas
        if (editor && editor.canvas) {
          const canvasWidth = editor.canvas.width || 200;
          const canvasHeight = editor.canvas.height || 400;
          const imgWidth = img.width;
          const imgHeight = img.height;

          // Calculate scaling factor to fit within 50% of the canvas
          let scale = 1;
          if (imgWidth > imgHeight) {
            // For landscape images, scale based on width
            scale = (canvasWidth * 0.5) / imgWidth;
          } else {
            // For portrait images, scale based on height
            scale = (canvasHeight * 0.5) / imgHeight;
          }

          const fabricImage = new fabric.Image(img, {
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
          });

          editor.canvas.add(fabricImage);
          editor.canvas.setActiveObject(fabricImage);
          editor.canvas.renderAll();
        }
      };

      img.onerror = (error) => {
        console.error('Error loading image:', error);
        alert('Failed to load the image. Please try again.');
      };
    } catch (error) {
      console.error('Error adding image from URL:', error);
      alert('Failed to add the image. Please try again.');
    }
  };

  // Handle screenshot
  const handleSS = async () => {
    if (!editor) return;

    setLoading(true);
    editor.canvas.discardActiveObject();
    editor.canvas.renderAll();

    // Store current view and canvas states
    const currentView = back;

    // Save current canvas state before switching views
    if (currentView === "front") {
      const frontState = JSON.stringify(editor.canvas.toJSON());
      localStorage.setItem("front", frontState);
    } else {
      const backState = JSON.stringify(editor.canvas.toJSON());
      localStorage.setItem("back", backState);
    }

    // Get canvas elements
    const canvasContainers = document.querySelectorAll(".canvas-container");
    const upperCanvas = document.querySelector(".upper-canvas") as HTMLElement;
    const lowerCanvas = document.querySelector(".lower-canvas") as HTMLElement;

    // Store original styles
    const originalStyles = Array.from(canvasContainers).map(container => ({
      element: container,
      style: container.getAttribute('style') || '',
      border: (container as HTMLElement).style.border
    }));
    const upperOriginalBorder = upperCanvas?.style.border;
    const lowerOriginalBorder = lowerCanvas?.style.border;

    try {
      // Temporarily remove borders for screenshot
      canvasContainers.forEach(container => {
        (container as HTMLElement).style.border = 'none';
      });
      if (upperCanvas) upperCanvas.style.border = 'none';
      if (lowerCanvas) lowerCanvas.style.border = 'none';

      const pdf = new jsPDF();
      
      // Capture front view
      handleBack("front");
      await new Promise(resolve => setTimeout(resolve, 1000));
      const frontState = localStorage.getItem("front");
      if (frontState) {
        editor.canvas.loadFromJSON(JSON.parse(frontState), () => {
          editor.canvas.renderAll();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      const frontCanvas = await html2canvas(document.getElementById("sshot")!, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2
      });

      // Capture back view
      handleBack("back");
      await new Promise(resolve => setTimeout(resolve, 1000));
      const backState = localStorage.getItem("back");
      if (backState) {
        editor.canvas.loadFromJSON(JSON.parse(backState), () => {
          editor.canvas.renderAll();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      const backCanvas = await html2canvas(document.getElementById("sshot")!, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2
      });

      // Add front view to PDF
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (frontCanvas.height * imgWidth) / frontCanvas.width;

      pdf.setFontSize(16);
      pdf.text("FRONT VIEW", 105, 20, { align: 'center' });
      pdf.addImage(
        frontCanvas.toDataURL("image/png", 1.0),
        "PNG",
        0,
        30,
        imgWidth,
        imgHeight
      );

      // Add back view on new page
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text("BACK VIEW", 105, 20, { align: 'center' });
      pdf.addImage(
        backCanvas.toDataURL("image/png", 1.0),
        "PNG",
        0,
        30,
        imgWidth,
        imgHeight
      );

      // Save the PDF
      pdf.save("t-shirt-design.pdf");

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      // Restore original borders
      originalStyles.forEach(({ element, style, border }) => {
        element.setAttribute('style', style);
        (element as HTMLElement).style.border = border;
      });
      if (upperCanvas) upperCanvas.style.border = upperOriginalBorder;
      if (lowerCanvas) lowerCanvas.style.border = lowerOriginalBorder;

      // Restore original view and state
      handleBack(currentView);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Restore the canvas state for the current view
      const finalState = localStorage.getItem(currentView);
      if (finalState) {
        editor.canvas.loadFromJSON(JSON.parse(finalState), () => {
          editor.canvas.renderAll();
        });
      }

      setLoading(false);
    }
  };

  // Handle pixabay search
  const handleSearchPix = async (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    try {
      // Implement your pixabay API call here
      const response = await fetch(`https://pixabay.com/api/?key=26989130-08a64865604ee2a22958b6c98&q=${event.target.value}&image_type=photo&pretty=true`);
      const data = await response.json();
      setArtworkDataPixy(data.hits);
    } catch (error) {
      console.error("Error searching Pixabay:", error);
    }
  };

  const handleSearchArtWork = useCallback(debounce(handleSearchPix, 1000), []);

  // Handle EFG collection
  const fetchEFGData = useCallback(async () => {
    try {
      // Implement your EFG collection API call here
      const response = await fetch('your-efg-collection-api-endpoint');
      const data = await response.json();
      setArtworkDataEFG(data);
    } catch (error) {
      console.error("Error fetching EFG collection:", error);
    }
  }, []);

  // Generate image using AI
  const handleGenerateAIImage = async () => {
    if (!editor || !aiImagePrompt) return;
    
    setIsGeneratingImage(true);
    try {
      const configuration = new Configuration({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);

      const response = await openai.createImage({
        prompt: aiImagePrompt,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = response.data.data[0].url;
      if (imageUrl) {
        await handleAddImageFromUrl(imageUrl);
        setAiImagePrompt(''); // Clear the prompt after successful generation
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Add deleteSelected function
  const deleteSelected = () => {
    if (!editor?.canvas) return;
    
    const activeObjects = editor.canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj) => {
      editor.canvas.remove(obj);
    });
    editor.canvas.discardActiveObject();
    setSelectedObject(null);
    editor.canvas.renderAll();
  };

  // Add selection event handlers
  useEffect(() => {
    if (!editor?.canvas) return;

    const handleSelection = (e: any) => {
      const selected = e.selected?.[0];
      setSelectedObject(selected || null);
    };

    editor.canvas.on('selection:created', handleSelection);
    editor.canvas.on('selection:updated', handleSelection);
    editor.canvas.on('selection:cleared', () => setSelectedObject(null));

    return () => {
      editor.canvas.off('selection:created', handleSelection);
      editor.canvas.off('selection:updated', handleSelection);
      editor.canvas.off('selection:cleared');
    };
  }, [editor]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: loading ? 'hidden' : 'auto'
    }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.5)',
          zIndex: 1000
        }}>
          <ClipLoader color="#000000" loading={true} size={50} />
          <div style={{ marginTop: '1rem' }}>Loading...</div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <Display
              back={back}
              color={color}
              image={image}
              Canvas={FabricJSCanvas}
              onReady={onReady}
            />
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button
                className={`px-6 py-2 rounded-lg transition-colors ${back === "front"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                onClick={() => handleBack("front")}
              >
                Front View
              </button>
              <button
                className={`px-6 py-2 rounded-lg transition-colors ${back === "back"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                onClick={() => handleBack("back")}
              >
                Back View
              </button>
            </div>

            {/* Design Tools */}
            <div className="mt-6 p-4 bg-white rounded-xl shadow-lg w-full">
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  <FontAwesomeIcon icon={faSmile} />
                  Add Emoji
                </button>

                <label
                  htmlFor="imageUpload"
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faImage} />
                  Add Image
                </label>

                <button
                  onClick={() => setShowArtModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  <FontAwesomeIcon icon={faImage} />
                  Browse Artwork
                </button>

                <button
                  onClick={deleteSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Delete
                </button>

                <button
                  onClick={handleGenerateAIImage}
                  disabled={isGeneratingImage || !aiImagePrompt}
                  className={`flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg ${
                    isGeneratingImage || !aiImagePrompt ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-600'
                  }`}
                >
                  {isGeneratingImage ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPenFancy} />
                      Generate AI Image
                    </>
                  )}
                </button>
              </div>

              {/* Replace old text customization with TextStyler */}
              <TextStyler
                editor={editor}
                selectedObject={editor?.canvas.getActiveObject()}
                onTextAdd={(text) => {
                  if (!editor?.canvas) return;
                  
                  const textBox = new fabric.IText(text, {
                    left: editor.canvas.width ? editor.canvas.width / 2 : 100,
                    top: editor.canvas.height ? editor.canvas.height / 2 : 100,
                    originX: 'center',
                    originY: 'center',
                    fontSize: 20,
                  });

                  editor.canvas.add(textBox);
                  editor.canvas.setActiveObject(textBox);
                  editor.canvas.renderAll();
                }}
              />

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute z-10 mt-2">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}
            </div>

            <input
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleAddImage(e.target.files[0]);
                }
              }}
              className="hidden"
              id="imageUpload"
              accept="image/*"
            />
          </div>

          <div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {image?.title || "Custom T-Shirt"}
              </h2>

              {/* Replace the old pricing display with PricingCalculator */}
              <PricingCalculator
                basePrice={image?.price ? parseInt(image.price) : 500}
                sizeQuantities={sizeQuantities}
                frontDesignPrice={frontPrice}
                backDesignPrice={backPrice}
                style={image?.title || "T-shirt"}
              />

              <div className="space-y-8 mt-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">Choose Color</h4>
                  <div className="flex flex-wrap gap-3">
                    {[
                      "#F6F6F6",
                      "black",
                      "#0C0CAE",
                      "#2A2929",
                      "gray",
                      "#919a54",
                      "#7F3232",
                      "#276457",
                      "#0DD6C5",
                    ].map((item, index) => (
                      <div
                        key={index}
                        style={{ backgroundColor: item }}
                        className="color-preview border-2 border-gray-200"
                        onClick={() => {
                          setColor(item);
                          localStorage.setItem("color", item);
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">Choose Size & Quantity</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(["S", "M", "L", "XL", "XXL"] as TShirtSize[]).map((sizeOption) => (
                      <div
                        key={sizeOption}
                        className={`p-3 border-2 rounded-lg transition-colors ${
                          sizeQuantities[sizeOption] > 0
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-medium">{sizeOption}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSizeQuantityChange(sizeOption, Math.max(0, sizeQuantities[sizeOption] - 1))}
                              className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{sizeQuantities[sizeOption]}</span>
                            <button
                              onClick={() => handleSizeQuantityChange(sizeOption, sizeQuantities[sizeOption] + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-right text-sm text-gray-600">
                    Total Quantity: {getTotalQuantity()}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">Choose Style</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {data.map((item, index) => (
                      <button
                        key={index}
                        className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${image === item
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        onClick={() => {
                          setImage(item);
                          localStorage.setItem("image", JSON.stringify(item));
                        }}
                      >
                        <img
                          src={item.front.src}
                          alt={item.title}
                          className="w-10 h-12 object-contain"
                        />
                        <span className="text-sm font-medium text-gray-700">{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSS}
                    className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Download Design
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artwork Modal */}
      {showArtModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">
                    Browse Artwork {showPixabay ? "From Pixabay" : showEfgCollection ? "From EFG Collection" : ""}
                  </h3>
                  <button
                    onClick={() => {
                      setShowArtModal(false);
                      setShowPixabay(false);
                      setShowEfgCollection(false);
                      setArtworkDataPixy([]);
                      setArtworkDataEFG([]);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex gap-4 mb-4" >
                  <div style={{ width: "100%" }}>
                    <div className="flex gap-2 mb-4" >
                      <input
                        type="text"

                        className="flex-1 px-3 py-2 border rounded"
                        placeholder="Search artwork..."
                        onChange={handleSearchArtWork}
                      />
                      <select
                        className="px-3 py-2 border rounded"
                        onChange={handleSearchArtWork}
                      >
                        <option value="">Select Category</option>
                        {["All", "Art", "Design", "Illustration", "Photography", "Vectors", "3D"].map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {artworkDataPixy.map((item, index) => (
                        <div
                          key={index}
                          className="cursor-pointer hover:opacity-75"
                          onClick={() => {
                            handleAddImageFromUrl(item.largeImageURL);
                            setShowArtModal(false);
                          }}
                          
                        >
                          <img
                            src={item.previewURL}
                            alt={item.tags}
                            className="rounded"
                            
                            style={{height: "150px", width: "200px"}}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* {showPixabay && (
                  
                )} */}

                {showEfgCollection && (
                  <div className="grid grid-cols-4 gap-4">
                    {artworkDataEFG.map((item, index) => (
                      <div
                        key={index}
                        className="cursor-pointer hover:opacity-75"
                        onClick={() => {
                          handleAddImageFromUrl(item.imageUrl);
                          setShowArtModal(false);
                        }}
                      >
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-auto rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
