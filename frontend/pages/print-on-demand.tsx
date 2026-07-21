import { useCallback, useEffect, useRef, useState } from "react";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { fabric } from "fabric";
import html2canvas from "html2canvas";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import EmojiPicker from "emoji-picker-react";
import Display from "../components/Display";
import debounce from 'lodash.debounce';
import { Configuration, OpenAIApi } from 'openai';
import TextStyler from "../components/TextStyler";
import NavBar from '../components/NavBar';
import axios from 'axios';
import LeftSideComp from "@/components/LeftSideComp";
import RightSideComp from "@/components/RightSideComp";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { toast } from 'react-toastify';
import { designService } from '../services/design';
import { customStyleService } from '../services/customStyle';
import TextEditorModal from "@/components/TextEditorModal";
import { useRouter } from 'next/router';
import { productService } from '@/services/product';
import ProcessingLoader from '@/components/ProcessingLoader';
import { compressImageWithDimensions } from '@/utils/imageCompressor';
import { compressCanvasBlob } from '@/utils/imageCompressionUtils';

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
  const router = useRouter();
  const { productId } = router.query;
  
  const [back, setBack] = useState("back");
  const [color, setColor] = useState("");
  const [image, setImage] = useState<any>(null);
  const { editor: frontEditor, onReady: onFrontReady } = useFabricJSEditor();
  const { editor: backEditor, onReady: onBackReady } = useFabricJSEditor();
  const [frontData, setFrontData] = useState<string | null>(null);
  const [backData, setBackData] = useState<string | null>(null);
  const [frontPrice, setFrontPrice] = useState(0);
  const [backPrice, setBackPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<any[]>([
    { id: 'capture-front', label: 'Capture Front', completed: false },
    { id: 'capture-back', label: 'Capture Back', completed: false },
    { id: 'generate-pdf', label: 'Prepare Canvas', completed: false },
    { id: 'upload-image', label: 'Upload Image', completed: false },
    { id: 'save-design', label: 'Add to Cart', completed: false },
  ]);
  const [data, setData] = useState<any[]>([]);
  const [aiImagePrompt, setAiImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const { user, totalPrice } = useAuth();
  const { incrementCart } = useCart();
  const [productData, setProductData] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  useEffect(()=> {
    setTimeout(() => {
    setBack("front");},100)
    
  },[])
  // Add text editor position state
  const [textEditorPosition, setTextEditorPosition] = useState({ x: 0, y: 0 });

  const textEditorRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Function to handle text editor positioning
  const handleTextEditorOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!frontEditor?.canvas && !backEditor?.canvas) return;

    const buttonRect = event.currentTarget.getBoundingClientRect();
    setTextEditorPosition({
      x: buttonRect.left,
      y: buttonRect.bottom + window.scrollY
    });

    setShowTextEditor(true);
    setShowEmojiPicker(false); // Ensure Emoji Picker is closed
  };

  // Close Text Editor and Emoji Picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        textEditorRef.current &&
        !textEditorRef.current.contains(event.target as Node) &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowTextEditor(false);
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Use ref to track if product images have been loaded (persists across re-renders)
  const productImagesLoadedRef = useRef(false);

  // Track in-flight background uploads so we can wait for them before adding to cart
  const pendingUploadsRef = useRef<Promise<void>[]>([]);

  // Upload the original file to MinIO in the background (does NOT block canvas display).
  // Once done, attach the returned fileId to the fabric object and re-persist the canvas
  // so the fileId is saved with the design when the user adds it to the cart.
  const uploadInBackground = (
    file: File,
    fabricImage: fabric.Image,
    editor: any
  ): Promise<void> => {
    const uploadPromise = designService
      .uploadFile(file)
      .then((res) => {
        (fabricImage as any).minioFileId = res.fileId;
        // Re-serialize the canvas to localStorage so the new fileId is captured
        editor?.canvas?.fire('object:modified', { target: fabricImage });
      })
      .catch((error) => {
        console.error('Background image upload failed:', error);
      })
      .finally(() => {
        pendingUploadsRef.current = pendingUploadsRef.current.filter(
          (p) => p !== uploadPromise
        );
      });
    pendingUploadsRef.current.push(uploadPromise);
    return uploadPromise;
  };

  // Load product data and add logo/custom image to canvas
  useEffect(() => {
    if (productId && frontEditor?.canvas && backEditor?.canvas && !productImagesLoadedRef.current) {
      localStorage.removeItem("front");
      localStorage.removeItem("back");
      loadProductAndAddImages();
    }
  }, [productId, frontEditor, backEditor]);

  const loadProductAndAddImages = async () => {
    try {
      setLoadingProduct(true);
      const product = await productService.getProduct(productId as string);
      setProductData(product);
      console.log('Loaded product for customization:', product);

      // Set color from product if available
      if (product.color && product.color.hexCode) {
        setColor(product.color.hexCode);
        console.log('Product color set to:', product.color.hexCode);
      }

      // Clear localStorage to prevent loading old canvas data
      localStorage.removeItem("front");
      localStorage.removeItem("back");
      console.log('LocalStorage cleared');

      // Clear all objects from both canvases before loading new ones
      if (frontEditor?.canvas) {
        try {
          frontEditor.canvas.getObjects().forEach(obj => frontEditor.canvas.remove(obj));
          frontEditor.canvas.renderAll();
          console.log('Front canvas cleared');
        } catch (error) {
          console.log('Error clearing front canvas:', error);
        }
      }
      if (backEditor?.canvas) {
        try {
          backEditor.canvas.getObjects().forEach(obj => backEditor.canvas.remove(obj));
          backEditor.canvas.renderAll();
          console.log('Back canvas cleared');
        } catch (error) {
          console.log('Error clearing back canvas:', error);
        }
      }

      // Ensure we're on front view
      setBack("front");
      // Wait a bit for the canvas to update
      await new Promise(resolve => setTimeout(resolve, 200));

      // Add logo to front canvas if exists (small image, top-right)
      if (product.logo && product.logo.url && frontEditor?.canvas) {
        await handleAddSmallImageFromUrl(product.logo.url);
        console.log('Logo added to front canvas');
      }

      // Add custom image to front canvas if exists (larger image, centered)
      if (product.customImage && product.customImage.url && frontEditor?.canvas) {
        await handleAddImageFromUrl(product.customImage.url);
        console.log('Custom image added to front canvas');
      }

      // Mark as loaded to prevent re-loading
      productImagesLoadedRef.current = true;
      
      if (product.logo || product.customImage) {
        toast.success('Product images loaded successfully');
      }

      setLoadingProduct(false);
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product data');
      setLoadingProduct(false);
    }
  };

  // State for artwork
  const [showArtModal, setShowArtModal] = useState(false);
  const [showPixabay, setShowPixabay] = useState(false);
  const [showEfgCollection, setShowEfgCollection] = useState(false);
  const [artworkDataPixy, setArtworkDataPixy] = useState<any[]>([]);
  const [artworkDataEFG, setArtworkDataEFG] = useState<any[]>([]);
  const [isSearchingArt, setIsSearchingArt] = useState(false);
  const [artSearchQuery, setArtSearchQuery] = useState('');

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

  // Initialize data from API
  useEffect(() => {
    const fetchCustomStyles = async () => {
      try {
        const styles = await customStyleService.getAllCustomStyles();
        
        // Transform API response to match expected format
        const transformedData = styles.map((style: any) => ({
          front: { src: style.frontImage?.url || style.frontImage },
          back: { src: style.backImage?.url || style.backImage },
          title: style.title,
          price: style.price.toString(),
          id: style._id,
          description: style.description
        }));
        
        setData(transformedData);
        
        // If product has a custom style, select it; otherwise use first style
        if (productData?.customStyle) {
          const customStyleId = productData.customStyle._id || productData.customStyle;
          const selectedStyle = transformedData.find((style: any) => style.id === customStyleId);
          if (selectedStyle) {
            setImage(selectedStyle);
          } else if (transformedData.length > 0) {
            setImage(transformedData[0]);
          }
        } else if (transformedData.length > 0) {
          setImage(transformedData[0]);
        }
      } catch (error) {
        console.error('Error fetching custom styles:', error);
        toast.error('Failed to load custom styles. Please refresh the page.');
        setData([]);
      }
    };
    
    fetchCustomStyles();
  }, [productData]);

  // Handle canvas data - replace the existing useEffect
  useEffect(() => {
    if (!frontEditor || !backEditor) return;

    // Create a function to initialize canvases
    const initializeCanvases = () => {
      try {
        const savedFrontData = localStorage.getItem("front");
        const savedBackData = localStorage.getItem("back");
        console.log({savedFrontData, savedBackData});

        // Initialize front canvas
        if (back == "front" && savedFrontData && frontEditor.canvas) {
          setTimeout(() => {
            try {
              frontEditor.canvas.loadFromJSON(JSON.parse(savedFrontData), () => {
                frontEditor.canvas.renderAll();
              });
            } catch (error) {
              // console.error("Error loading front canvas:", error);
            }
          }, 100);
        }

        // Initialize back canvas
        if (back =="back" && savedBackData && backEditor.canvas) {
          setTimeout(() => {
            try {
              backEditor.canvas.loadFromJSON(JSON.parse(savedBackData), () => {
                backEditor.canvas.renderAll();
              });
            } catch (error) {
              // console.error("Error loading back canvas:", error);
            }
          }, 100);
        }
      } catch (error) {
        console.error("Error initializing canvases:", error);
      }
    };

    // Initialize canvases after a short delay to ensure DOM is ready
    setTimeout(initializeCanvases, 100);

    const saveFrontData = () => {
      if (!frontEditor?.canvas) return;
      const json = JSON.stringify(frontEditor.canvas.toJSON(['minioFileId']));
      setFrontData(json);
      localStorage.setItem("front", json);
    };

    const saveBackData = () => {
      if (!backEditor?.canvas) return;
      const json = JSON.stringify(backEditor.canvas.toJSON(['minioFileId']));
      setBackData(json);
      localStorage.setItem("back", json);
    };

    // Add event listeners with null checks
    if (frontEditor?.canvas) {
      frontEditor.canvas.on('object:modified', saveFrontData);
      frontEditor.canvas.on('object:added', saveFrontData);
      frontEditor.canvas.on('object:removed', saveFrontData);
    }

    if (backEditor?.canvas) {
      backEditor.canvas.on('object:modified', saveBackData);
      backEditor.canvas.on('object:added', saveBackData);
      backEditor.canvas.on('object:removed', saveBackData);
    }

    return () => {
      if (frontEditor?.canvas) {
        frontEditor.canvas.off('object:modified', saveFrontData);
        frontEditor.canvas.off('object:added', saveFrontData);
        frontEditor.canvas.off('object:removed', saveFrontData);
      }

      if (backEditor?.canvas) {
        backEditor.canvas.off('object:modified', saveBackData);
        backEditor.canvas.off('object:added', saveBackData);
        backEditor.canvas.off('object:removed', saveBackData);
      }
    };
  }, [frontEditor, backEditor]);

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


  // Modify handleBack to just switch views without transferring data
  const handleBack = (data: string) => {
    setBack(data);
    return data;
  };

  // Helper function to update processing steps
  const updateProcessingStep = (stepId: string, completed: boolean, status: string) => {
    setProcessingSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, completed } : step
      )
    );
    setLoadingStatus(status);
  };

  // Helper function to reset processing steps
  const resetProcessingSteps = () => {
    setProcessingSteps(prev =>
      prev.map(step => ({ ...step, completed: false }))
    );
  };

  // Handle file upload
  const handleAddImage = async (file: File) => {
    const editor = back === "front" ? frontEditor : backEditor;
    if (!editor || !file) return;

    setIsAddingImage(true);
    try {
      // Compress the image for display on canvas (fast). The original/large file is
      // uploaded to MinIO in the background so the image appears on the canvas instantly.
      const compressedFile = await compressImageWithDimensions(file, 0.5, 1080, 1080);

      // Create a new FileReader instance to display the compressed image
      const reader = new FileReader();
      reader.onload = () => {
        // Create a new image element
        const imgElement = new Image();
        imgElement.src = reader.result as string;

        imgElement.onload = () => {
          // Create a new fabric Image instance using the image element
          const fabricImage = new fabric.Image(imgElement, {
            left: (editor.canvas.width || 200) / 2,
            top: (editor.canvas.height || 400) / 2,
            originX: 'center',
            originY: 'center',
            scaleX: 150 / imgElement.width,
            scaleY: 150 / imgElement.height,
          });

          if (editor?.canvas) {
            editor.canvas.add(fabricImage);
            editor.canvas.setActiveObject(fabricImage);
            editor.canvas.renderAll();
          }

          // Upload the original file in the background and attach the fileId when ready
          uploadInBackground(file, fabricImage, editor);
          setIsAddingImage(false);
        };

        imgElement.onerror = (error) => {
          console.error('Error loading image:', error);
          toast.error('Failed to load the image. Please try again.');
          setIsAddingImage(false);
        };
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        toast.error('Failed to read the file. Please try again.');
        setIsAddingImage(false);
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to add image. Please try again.');
      setIsAddingImage(false);
    }
  };

  // Handle adding small image (logo) to top-right corner
  const handleAddSmallImage = async (file: File) => {
    const editor = back === "front" ? frontEditor : backEditor;
    if (!editor || !file) return;

    try {
      // Compress the small logo for display (fast). The original file is uploaded to
      // MinIO in the background so the logo shows on the canvas immediately.
      const compressedFile = await compressImageWithDimensions(file, 0.3, 200, 200);

      // Create a new FileReader instance for the compressed file to display on canvas
      const reader = new FileReader();
      reader.onload = () => {
        // Create a new image element
        const imgElement = new Image();
        imgElement.src = reader.result as string;

        imgElement.onload = () => {
          // Calculate small size (50x50 pixels max)
          const maxSize = 50;
          let scaleX, scaleY;

          if (imgElement.width > imgElement.height) {
            // Landscape image
            scaleX = maxSize / imgElement.width;
            scaleY = scaleX; // Maintain aspect ratio
          } else {
            // Portrait or square image
            scaleY = maxSize / imgElement.height;
            scaleX = scaleY; // Maintain aspect ratio
          }

          // Create a new fabric Image instance positioned at top-right
          const fabricImage = new fabric.Image(imgElement, {
            left: (editor.canvas.width || 200) - 20, // 20px from right edge
            top: 20,  // 20px from top edge
            originX: 'right',
            originY: 'top',
            scaleX: scaleX,
            scaleY: scaleY,
          });

          if (editor?.canvas) {
            editor.canvas.add(fabricImage);
            editor.canvas.setActiveObject(fabricImage);
            editor.canvas.renderAll();
          }

          // Upload the original logo in the background and attach the fileId when ready
          uploadInBackground(file, fabricImage, editor);
        };

        imgElement.onerror = (error) => {
          console.error('Error loading small image:', error);
          toast.error('Failed to load the small image. Please try again.');
        };
      };

      reader.onerror = (error) => {
        console.error('Error reading file for small image:', error);
        toast.error('Failed to read the file. Please try again.');
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error processing logo:', error);
      toast.error('Failed to add logo. Please try again.');
    }
  };

  // Handle URL-based image
  const handleAddImageFromUrl = async (url: string) => {
    const editor = back === "front" ? frontEditor : backEditor;
    if (!editor) return;

    setIsAddingImage(true);
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;

      // Display the image on canvas first so it appears immediately.
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = proxyUrl;

      img.onload = () => {
        // Calculate scale to fit within canvas
        if (editor && editor.canvas) {
          const canvasWidth = editor.canvas.width || 200;
          const canvasHeight = editor.canvas.height || 400;

          const fabricImage = new fabric.Image(img, {
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            originX: 'center',
            originY: 'center',
            scaleX: 150 / img.width,
            scaleY: 150 / img.height,
          });

          editor.canvas.add(fabricImage);
          editor.canvas.setActiveObject(fabricImage);
          editor.canvas.renderAll();

          // Fetch the original and upload to MinIO in the background
          fetch(proxyUrl)
            .then((response) => response.blob())
            .then((blob) => {
              const file = new File([blob], 'artwork-image.png', { type: blob.type });
              return uploadInBackground(file, fabricImage, editor);
            })
            .catch((error) => {
              console.error('Background artwork upload failed:', error);
            });
        }
        setIsAddingImage(false);
      };

      img.onerror = (error) => {
        console.error('Error loading image:', error);
        toast.error('Failed to load the image. Please try again.');
        setIsAddingImage(false);
      };
    } catch (error) {
      console.error('Error adding image from URL:', error);
      toast.error('Failed to add the image. Please try again.');
      setIsAddingImage(false);
    }
  };

  // Handle URL-based small image (for logos)
  const handleAddSmallImageFromUrl = async (url: string) => {
    const editor = back === "front" ? frontEditor : backEditor;
    if (!editor) return;

    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;

      // Display the logo on canvas first so it appears immediately.
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = proxyUrl;

      img.onload = () => {
        if (editor && editor.canvas) {
          // Calculate small size (50x50 pixels max)
          const maxSize = 50;
          let scaleX, scaleY;

          if (img.width > img.height) {
            // Landscape image
            scaleX = maxSize / img.width;
            scaleY = scaleX; // Maintain aspect ratio
          } else {
            // Portrait or square image
            scaleY = maxSize / img.height;
            scaleX = scaleY; // Maintain aspect ratio
          }

          const fabricImage = new fabric.Image(img, {
            left: (editor.canvas.width || 200) - 20, // 20px from right edge
            top: 20,  // 20px from top edge
            originX: 'right',
            originY: 'top',
            scaleX: scaleX,
            scaleY: scaleY,
          });

          editor.canvas.add(fabricImage);
          editor.canvas.setActiveObject(fabricImage);
          editor.canvas.renderAll();

          // Fetch the original and upload to MinIO in the background
          fetch(proxyUrl)
            .then((response) => response.blob())
            .then((blob) => {
              const file = new File([blob], 'logo-image.png', { type: blob.type });
              return uploadInBackground(file, fabricImage, editor);
            })
            .catch((error) => {
              console.error('Background logo upload failed:', error);
            });
        }
      };

      img.onerror = (error) => {
        console.error('Error loading logo:', error);
        toast.error('Failed to load the logo. Please try again.');
      };
    } catch (error) {
      console.error('Error adding logo from URL:', error);
      toast.error('Failed to add the logo. Please try again.');
    }
  };

  // Handle screenshot
  const handleSS = async () => {
    const editor = back === "front" ? frontEditor : backEditor;
    if (!editor) return;
    
    // Validate that at least one size has quantity > 0
    const totalQuantity = Object.values(sizeQuantities).reduce((sum, qty) => sum + Number(qty), 0);
    if (totalQuantity === 0) {
      toast.error('Please select at least one size and quantity before adding to cart');
      return;
    }
    
    setLoading(true);
    resetProcessingSteps();
    editor.canvas.discardActiveObject();
    editor.canvas.renderAll();

    // Wait for any in-flight background image/logo uploads to finish so their
    // MinIO fileIds are attached and saved with the design before we capture it.
    if (pendingUploadsRef.current.length > 0) {
      setLoadingStatus('Finalizing uploaded images...');
      await Promise.all(pendingUploadsRef.current);
    }

    // Store current view
    const currentView = back;
    
    // ===== COLLECT ADDED ELEMENTS FROM LOCALSTORAGE =====
    const addedElements = {
      front: {
        texts: [] as any[],
        images: [] as any[]
      },
      back: {
        texts: [] as any[],
        images: [] as any[]
      }
    };
    
    // Get front canvas data from localStorage
    const savedFrontData = localStorage.getItem("front");
    if (savedFrontData) {
      try {
        const frontCanvasData = JSON.parse(savedFrontData);
        if (frontCanvasData.objects) {
          frontCanvasData.objects.forEach((obj: any) => {
            // Collect text elements with all styling
            if (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox') {
              addedElements.front.texts.push({
                text: obj.text,
                fontSize: obj.fontSize,
                fontFamily: obj.fontFamily,
                color: obj.fill,
                fontWeight: obj.fontWeight,
                fontStyle: obj.fontStyle,
                textAlign: obj.textAlign,
                underline: obj.underline,
                linethrough: obj.linethrough,
                left: obj.left,
                top: obj.top,
                angle: obj.angle || 0,
                scaleX: obj.scaleX || 1,
                scaleY: obj.scaleY || 1,
              });
            }
            // Collect image elements with MinIO fileId instead of base64
            if (obj.type === 'image') {
              addedElements.front.images.push({
                fileId: obj.minioFileId, // Use stored MinIO fileId
                left: obj.left,
                top: obj.top,
                scaleX: obj.scaleX || 1,
                scaleY: obj.scaleY || 1,
                angle: obj.angle || 0,
                width: obj.width,
                height: obj.height,
              });
            }
          });
        }
      } catch (error) {
        console.error("Error parsing front canvas data:", error);
      }
    }
    
    // Get back canvas data from localStorage
    const savedBackData = localStorage.getItem("back");
    if (savedBackData) {
      try {
        const backCanvasData = JSON.parse(savedBackData);
        if (backCanvasData.objects) {
          backCanvasData.objects.forEach((obj: any) => {
            // Collect text elements with all styling
            if (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox') {
              addedElements.back.texts.push({
                text: obj.text,
                fontSize: obj.fontSize,
                fontFamily: obj.fontFamily,
                color: obj.fill,
                fontWeight: obj.fontWeight,
                fontStyle: obj.fontStyle,
                textAlign: obj.textAlign,
                underline: obj.underline,
                linethrough: obj.linethrough,
                left: obj.left,
                top: obj.top,
                angle: obj.angle || 0,
                scaleX: obj.scaleX || 1,
                scaleY: obj.scaleY || 1,
              });
            }
            // Collect image elements with MinIO fileId instead of base64
            if (obj.type === 'image') {
              addedElements.back.images.push({
                fileId: obj.minioFileId, // Use stored MinIO fileId
                left: obj.left,
                top: obj.top,
                scaleX: obj.scaleX || 1,
                scaleY: obj.scaleY || 1,
                angle: obj.angle || 0,
                width: obj.width,
                height: obj.height,
              });
            }
          });
        }
      } catch (error) {
        console.error("Error parsing back canvas data:", error);
      }
    }
    
    // Console log the collected elements
    console.log('========== ADDED ELEMENTS ==========');
    console.log('Front Texts:', addedElements.front.texts);
    console.log('Front Images:', addedElements.front.images);
    console.log('Back Texts:', addedElements.back.texts);
    console.log('Back Images:', addedElements.back.images);
    console.log('Total Elements:', {
      frontTexts: addedElements.front.texts.length,
      frontImages: addedElements.front.images.length,
      backTexts: addedElements.back.texts.length,
      backImages: addedElements.back.images.length,
    });
    console.log('====================================');
    
    // Function to get current view's canvas elements
    const getCurrentCanvasElements = () => {
      const canvasContainers = document.querySelectorAll(".canvas-container");
      const upperCanvas = document.querySelector(".upper-canvas") as HTMLElement;
      const lowerCanvas = document.querySelector(".lower-canvas") as HTMLElement;
      return { canvasContainers, upperCanvas, lowerCanvas };
    };

    // Function to remove borders from current canvas elements
    const removeBordersFromCurrentCanvas = () => {
      const { canvasContainers, upperCanvas, lowerCanvas } = getCurrentCanvasElements();
      canvasContainers.forEach(container => {
        (container as HTMLElement).style.border = 'none';
      });
      if (upperCanvas) upperCanvas.style.border = 'none';
      if (lowerCanvas) lowerCanvas.style.border = 'none';
    };
  
    try {
      let frontCanvas;
      let backCanvas;
      
      // Capture front view
      if(currentView === "front") {
        // Remove borders for front view
        removeBordersFromCurrentCanvas();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        updateProcessingStep('capture-front', false, 'Capturing front design...');
        frontCanvas = await html2canvas(document.getElementById("sshot")!, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          scale: 2
        });
        updateProcessingStep('capture-front', true, '');
        
        // Switch to back view
        updateProcessingStep('capture-back', false, 'Capturing back design...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        handleBack("back");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove borders for back view
        removeBordersFromCurrentCanvas();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        backCanvas = await html2canvas(document.getElementById("sshot")!, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          scale: 2
        });
        updateProcessingStep('capture-back', true, '');
      } else {
        // Remove borders for back view
        removeBordersFromCurrentCanvas();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        updateProcessingStep('capture-back', false, 'Capturing back design...');
        backCanvas = await html2canvas(document.getElementById("sshot")!, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          scale: 2
        });
        updateProcessingStep('capture-back', true, '');

        // Switch to front view
        updateProcessingStep('capture-front', false, 'Capturing front design...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        handleBack("front");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove borders for front view
        removeBordersFromCurrentCanvas();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        frontCanvas = await html2canvas(document.getElementById("sshot")!, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          scale: 2
        });
        updateProcessingStep('capture-front', true, '');
      }
  
      // Helper function to compress blob if it exceeds 800KB
      const compressBlob = async (blob: Blob, canvas: HTMLCanvasElement, maxSizeKB = 800): Promise<Blob> => {
        return compressCanvasBlob(blob, canvas, maxSizeKB);
      };

      // Get canvas data as data URLs (heavily optimized for backend processing)
      let frontCanvasData = null;
      let backCanvasData = null;
      
      try {
        updateProcessingStep('generate-pdf', false, 'Preparing canvas data...');
        // Use WebP format with lower quality (0.5) for better compression
        // Falls back to PNG 0.6 quality if WebP is not supported
        try {
          frontCanvasData = frontCanvas.toDataURL('image/webp', 0.5);
          backCanvasData = backCanvas.toDataURL('image/webp', 0.5);
        } catch {
          // Fallback to PNG if WebP not supported
          frontCanvasData = frontCanvas.toDataURL('image/png', 0.6);
          backCanvasData = backCanvas.toDataURL('image/png', 0.6);
        }
        updateProcessingStep('generate-pdf', true, '');
      } catch (error) {
        console.error('Error converting canvas to data URL:', error);
        toast.warning('Canvas data conversion failed');
      }

      // Upload front image separately using canvas.toBlob() - higher quality for display
      let frontImageFileId = null;
      try {
        updateProcessingStep('upload-image', false, 'Uploading front image...');
        let frontImageBlob = await new Promise<Blob>((resolve, reject) => {
          // Try WebP first for better compression, fallback to PNG
          frontCanvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert canvas to blob'));
              }
            },
            'image/webp',
            0.75
          );
        }).catch(() => {
          // Fallback to PNG if WebP fails
          return new Promise<Blob>((resolve, reject) => {
            frontCanvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Failed to convert canvas to blob'));
                }
              },
              'image/png',
              0.8
            );
          });
        });

        // Ensure file size doesn't exceed 800KB
        frontImageBlob = await compressBlob(frontImageBlob, frontCanvas, 800);

        const frontImageFile = new File([frontImageBlob], `front-design.${frontImageBlob.type === 'image/webp' ? 'webp' : 'png'}`, { type: frontImageBlob.type });
        const frontImageResponse = await designService.uploadFile(frontImageFile);
        frontImageFileId = frontImageResponse.fileId;
        updateProcessingStep('upload-image', true, '');
        console.log(`Front image uploaded successfully with fileId: ${frontImageFileId}, Size: ${(frontImageBlob.size / 1024).toFixed(2)}KB`);
      } catch (error) {
        console.error('Error uploading front image:', error);
        updateProcessingStep('upload-image', true, '');
        toast.warning('Front image upload failed, but design will be saved');
      }

      // Charge the selected style's base price (from the API) per item
      const totalQuantity = Object.values(sizeQuantities).reduce((sum, qty) => sum + Number(qty), 0);
      const basePrice = Number(image?.price) || 0;
      const designPrice = basePrice * totalQuantity;

      // Use quick save design to add to cart immediately (PDF processing happens in backend)
      updateProcessingStep('save-design', false, 'Adding to cart...');
      await designService.quickSaveDesign({
        userId: user?._id,
        frontCanvasData: frontCanvasData,
        backCanvasData: backCanvasData,
        frontImageFileId: frontImageFileId,
        sizeQuantities,
        title: image.title,
        price: designPrice,
        elements: addedElements
      });
      updateProcessingStep('save-design', true, '');

      incrementCart();
      setLoading(false);
      setLoadingStatus('');
      // Subtle, quick confirmation (no progress bar) instead of a large banner
      toast.success('Added to cart', {
        autoClose: 1500,
        hideProgressBar: true,
        icon: () => '✓',
      });
      
      // Auto-redirect to cart page after success
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/cart');

    } catch (error) {
      setLoading(false);
      setLoadingStatus('');
      console.error("Error generating PDF:", error);
      toast.error("Error processing design. Please try again.");
    } finally {
      // Clean up and restore
      localStorage.removeItem("front");
      localStorage.removeItem("back");
  
      // Restore original view
      handleBack(currentView);
      setLoading(false);
      setLoadingStatus('');
    }
  };

  // Handle pixabay search
  const searchPixabay = async (query: string) => {
    const q = (query || '').trim();
    if (!q) {
      setArtworkDataPixy([]);
      setIsSearchingArt(false);
      return;
    }
    setIsSearchingArt(true);
    try {
      const response = await fetch(`https://pixabay.com/api/?key=26989130-08a64865604ee2a22958b6c98&q=${encodeURIComponent(q)}&image_type=illustration&pretty=true`);
      const data = await response.json();
      setArtworkDataPixy(data.hits || []);
    } catch (error) {
      console.error("Error searching Pixabay:", error);
      setArtworkDataPixy([]);
    } finally {
      setIsSearchingArt(false);
    }
  };

  const debouncedSearchArt = useCallback(debounce(searchPixabay, 600), []);

  // Called on every keystroke / category change: show the loader immediately, then
  // run the (debounced) Pixabay search.
  const handleArtSearchChange = (value: string) => {
    setArtSearchQuery(value);
    if (value && value.trim()) {
      setIsSearchingArt(true);
    } else {
      setIsSearchingArt(false);
    }
    debouncedSearchArt(value);
  };

  const closeArtModal = () => {
    setShowArtModal(false);
    setShowPixabay(false);
    setShowEfgCollection(false);
    setArtworkDataPixy([]);
    setArtworkDataEFG([]);
    setIsSearchingArt(false);
    setArtSearchQuery('');
  };

  // Generate image using AI
  const handleGenerateAIImage = async () => {
    const editor = back === "front" ? frontEditor : backEditor;
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
      toast.error('Error generating image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Add deleteSelected function
  const deleteSelected = () => {
    const editor = back === "front" ? frontEditor : backEditor;
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
    const editor = back === "front" ? frontEditor : backEditor;
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
  }, [frontEditor, backEditor, back]);

  return (
    <div>
      <NavBar />
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: (loading || loadingProduct) ? 'hidden' : 'auto'
      }}>
        {loadingProduct && (
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
            <div style={{ marginTop: '1rem' }}>
              Loading product...
            </div>
          </div>
        )}
        <div className="container mx-auto px-4 py-8">
          {/* Page header */}
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold uppercase tracking-wider">
              Design Studio
            </span>
            <h1 className="mt-3 text-2xl md:text-3xl font-bold text-gray-800">
              Create Your Custom {image?.title || "Print"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Add text, images and logos, pick your style &amp; color, then add it to your cart.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <LeftSideComp
                handleTextEditorOpen={handleTextEditorOpen}
                setShowEmojiPicker={setShowEmojiPicker}
                setTextEditorPosition={setTextEditorPosition}
                setShowTextEditor={setShowTextEditor}
                showEmojiPicker={showEmojiPicker}
                handleAddImage={handleAddImage}
                handleAddSmallImage={handleAddSmallImage}
                setShowArtModal={setShowArtModal}
                deleteSelected={deleteSelected}
                handleGenerateAIImage={handleGenerateAIImage}
                isGeneratingImage={isGeneratingImage}
                aiImagePrompt={aiImagePrompt}
                setAiImagePrompt={setAiImagePrompt}
                data={data}
                setImage={setImage}
                setColor={setColor}
                image={image}
                color={color}
              />

              {/* Text Editor Modal */}
              <TextEditorModal
                showTextEditor={showTextEditor}
                textEditorRef={textEditorRef}
                textEditorPosition={textEditorPosition}
                setShowTextEditor={setShowTextEditor}
                editor={back === "front" ? frontEditor : backEditor}
                selectedObject={selectedObject}
                setSelectedObject={setSelectedObject}
              />

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute z-10 bg-white rounded-lg shadow-xl border"
                  style={{
                    top: textEditorPosition.y,
                    left: textEditorPosition.x,
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    width: '350px'
                  }}
                >
                  <EmojiPicker onEmojiClick={(emojiData: any) => {
                    const editor = back === "front" ? frontEditor : backEditor;
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
                  }} />
                </div>
              )}
            </div>
            <div className="lg:col-span-6 flex flex-col items-center">
              {/* Canvas stage */}
              <div className="relative w-full rounded-2xl border border-gray-100 shadow-sm bg-gray-50 p-4 sm:p-8 flex items-center justify-center min-h-[420px]">
                {/* Spinner shown while an image / artwork is being added to the design */}
                {isAddingImage && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-2xl">
                    <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
                    <p className="mt-3 text-sm text-gray-500">Adding your image…</p>
                  </div>
                )}
                {back === "front" ? (
                  <Display
                    back="front"
                    color={color}
                    image={image}
                    Canvas={FabricJSCanvas}
                    onReady={onFrontReady}
                    key="front-canvas"
                  />
                ) : (
                  <Display
                    back="back"
                    color={color}
                    image={image}
                    Canvas={FabricJSCanvas}
                    onReady={onBackReady}
                    key="back-canvas"
                  />
                )}
              </div>

              {/* Front / Back segmented toggle */}
              <div className="mt-5 inline-flex p-1 bg-gray-100 rounded-full">
                <button
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${back === "front"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => handleBack("front")}
                >
                  Front View
                </button>
                <button
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${back === "back"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => handleBack("back")}
                >
                  Back View
                </button>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                Drag elements to position • Click to select • Use the tools to edit
              </p>

              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleAddImage(e.target.files[0]);
                    // Clear the input value to allow selecting the same file again
                    e.target.value = '';
                  }
                }}
                className="hidden"
                id="imageUpload"
                accept="image/*"
              />
            </div>
            <div className="lg:col-span-3 lg:sticky lg:top-24">
              <RightSideComp
                image={image}
                sizeQuantities={sizeQuantities}
                frontPrice={frontPrice}
                backPrice={backPrice}
                handleSizeQuantityChange={handleSizeQuantityChange}
                getTotalQuantity={getTotalQuantity}
                handleSS={handleSS}
                isLoading={loading}
                loadingStatus={loadingStatus}
              />
            </div>
          </div>
        </div>

        {/* Artwork Modal */}
        {showArtModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={closeArtModal}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </span>
                  <h3 className="text-lg font-bold text-gray-800">Browse Artwork</h3>
                </div>
                <button
                  onClick={closeArtModal}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Search bar */}
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </span>
                  <input
                    type="text"
                    value={artSearchQuery}
                    onChange={(e) => handleArtSearchChange(e.target.value)}
                    placeholder="Search artwork (e.g. flowers, cat, logo)…"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <select
                  defaultValue=""
                  onChange={(e) => handleArtSearchChange(e.target.value)}
                  className="px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">All categories</option>
                  {["Animals","Architecture","Beauty","Computer","Food","Music","Movies","Medical","Nature","Places","Science","Sports","Technology","Transportation","Travel"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {isSearchingArt ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
                    <p className="mt-3 text-sm text-gray-500">Searching artwork…</p>
                  </div>
                ) : artworkDataPixy.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {artworkDataPixy.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleAddImageFromUrl(item.largeImageURL);
                          closeArtModal();
                        }}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 hover:border-orange-300 hover:shadow-md transition-all"
                      >
                        <img
                          src={item.previewURL}
                          alt={item.tags}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-orange-500/70 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          + Add
                        </span>
                      </button>
                    ))}
                  </div>
                ) : artSearchQuery.trim() ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-3xl mb-3" />
                    <p className="text-sm">No artwork found for &ldquo;{artSearchQuery}&rdquo;.</p>
                    <p className="text-xs mt-1">Try a different keyword or category.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-3xl mb-3" />
                    <p className="text-sm">Search for artwork or choose a category to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Processing Loader */}
      <ProcessingLoader
        isVisible={loading}
        currentStatus={loadingStatus}
        steps={processingSteps}
      />
    </div>
  );
};

export default Index;
