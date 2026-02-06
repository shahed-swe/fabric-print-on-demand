import { useCallback, useEffect, useRef, useState } from "react";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { fabric } from "fabric";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ClipLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, 
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
import TextEditorModal from "@/components/TextEditorModal";
import { useRouter } from 'next/router';
import { productService } from '@/services/product';
import ProcessingLoader from '@/components/ProcessingLoader';

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
  const [processingSteps, setProcessingSteps] = useState<any[]>([
    { id: 'capture-front', label: 'Capture Front', completed: false },
    { id: 'capture-back', label: 'Capture Back', completed: false },
    { id: 'generate-pdf', label: 'Generate PDF', completed: false },
    { id: 'upload-image', label: 'Upload Image', completed: false },
    { id: 'upload-pdf', label: 'Upload PDF', completed: false },
    { id: 'save-design', label: 'Save Design', completed: false },
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

    try {
      // Upload image to MinIO first
      const uploadResponse = await designService.uploadFile(file);
      const minioFileId = uploadResponse.fileId;

      // Create a new FileReader instance to display the image
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

          // Store MinIO fileId in the fabric object
          (fabricImage as any).minioFileId = minioFileId;

          if (editor?.canvas) {
            editor.canvas.add(fabricImage);
            editor.canvas.setActiveObject(fabricImage);
            editor.canvas.renderAll();
          }
        };

        imgElement.onerror = (error) => {
          console.error('Error loading image:', error);
          toast.error('Failed to load the image. Please try again.');
        };
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        toast.error('Failed to read the file. Please try again.');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image to MinIO:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  // Handle adding small image to top-left corner
  const handleAddSmallImage = async (file: File) => {
    const editor = back === "front" ? frontEditor : backEditor;
    if (!editor || !file) return;

    try {
      // Upload image to MinIO first
      const uploadResponse = await designService.uploadFile(file);
      const minioFileId = uploadResponse.fileId;

      // Create a new FileReader instance each time
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

          // Store MinIO fileId in the fabric object
          (fabricImage as any).minioFileId = minioFileId;

          if (editor?.canvas) {
            editor.canvas.add(fabricImage);
            editor.canvas.setActiveObject(fabricImage);
            editor.canvas.renderAll();
          }
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

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo to MinIO:', error);
      toast.error('Failed to upload logo. Please try again.');
    }
  };

  // Handle URL-based image
  const handleAddImageFromUrl = async (url: string) => {
    const editor = back === "front" ? frontEditor : backEditor;
    if (!editor) return;

    try {
      // First, fetch the image and convert to blob
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      
      // Upload blob to MinIO
      const file = new File([blob], 'artwork-image.png', { type: blob.type });
      const uploadResponse = await designService.uploadFile(file);
      const minioFileId = uploadResponse.fileId;

      // Now display the image on canvas
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
            scaleX: 150 / img.width,
            scaleY: 150 / img.height,
          });

          // Store MinIO fileId in the fabric object
          (fabricImage as any).minioFileId = minioFileId;

          editor.canvas.add(fabricImage);
          editor.canvas.setActiveObject(fabricImage);
          editor.canvas.renderAll();
        }
      };

      img.onerror = (error) => {
        console.error('Error loading image:', error);
        toast.error('Failed to load the image. Please try again.');
      };
    } catch (error) {
      console.error('Error adding image from URL:', error);
      toast.error('Failed to add the image. Please try again.');
    }
  };

  // Handle URL-based small image (for logos)
  const handleAddSmallImageFromUrl = async (url: string) => {
    const editor = back === "front" ? frontEditor : backEditor;
    if (!editor) return;

    try {
      // First, fetch the image and convert to blob
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      
      // Upload blob to MinIO
      const file = new File([blob], 'logo-image.png', { type: blob.type });
      const uploadResponse = await designService.uploadFile(file);
      const minioFileId = uploadResponse.fileId;

      // Now display the image on canvas
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

          // Store MinIO fileId in the fabric object
          (fabricImage as any).minioFileId = minioFileId;

          editor.canvas.add(fabricImage);
          editor.canvas.setActiveObject(fabricImage);
          editor.canvas.renderAll();
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
      const pdf = new jsPDF();
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
  
      // Add front view to PDF
      updateProcessingStep('generate-pdf', false, 'Generating PDF...');
      const imgWidth = 210;
      const imgHeight = frontCanvas ? (frontCanvas.height * imgWidth) / frontCanvas.width : 0;
  
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
  
      // Save the PDF to a Blob
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], 't-shirt-design.pdf', { type: 'application/pdf' });

      // Upload front image separately using canvas.toBlob()
      let frontImageFileId = null;
      try {
        updateProcessingStep('upload-image', false, 'Uploading front image...');
        const frontImageBlob = await new Promise<Blob>((resolve, reject) => {
          frontCanvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert canvas to blob'));
              }
            },
            'image/png',
            1.0
          );
        });

        const frontImageFile = new File([frontImageBlob], 'front-design.png', { type: 'image/png' });
        const frontImageResponse = await designService.uploadFile(frontImageFile);
        frontImageFileId = frontImageResponse.fileId;
        updateProcessingStep('upload-image', true, '');
        console.log('Front image uploaded successfully with fileId:', frontImageFileId);
      } catch (error) {
        console.error('Error uploading front image:', error);
        updateProcessingStep('upload-image', true, '');
        toast.warning('Front image upload failed, but design will be saved');
      }

      // Use the design service instead of direct axios calls
      updateProcessingStep('upload-pdf', false, 'Uploading PDF...');
      const uploadResponse = await designService.uploadFile(file);
      updateProcessingStep('upload-pdf', true, '');
      
      if (!uploadResponse.fileId) {
        throw new Error('File upload failed');
      }

      // Calculate price from actual size quantities ($30 per item)
      const totalQuantity = Object.values(sizeQuantities).reduce((sum, qty) => sum + Number(qty), 0);
      const designPrice = 30 * totalQuantity;

      updateProcessingStep('save-design', false, 'Saving design...');
      await designService.saveDesign({
        userId: user?._id,
        fileId: uploadResponse.fileId,
        frontImageFileId: frontImageFileId, // Include the front image file ID
        sizeQuantities,
        title: image.title,
        price: designPrice,
        elements: addedElements // Send the collected elements
      });
      updateProcessingStep('save-design', true, '');

      incrementCart();
      setLoading(false);
      setLoadingStatus('');
      toast.success('Item Added to Cart successfully!');
      
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
  const handleSearchPix = async (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    try {
      // Implement your pixabay API call here
      const response = await fetch(`https://pixabay.com/api/?key=26989130-08a64865604ee2a22958b6c98&q=${event.target.value}&image_type=illustration&pretty=true`);
      const data = await response.json();
      setArtworkDataPixy(data.hits);
    } catch (error) {
      console.error("Error searching Pixabay:", error);
    }
  };

  const handleSearchArtWork = useCallback(debounce(handleSearchPix, 1000), []);

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
        {(loading || loadingProduct) && (
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
              {loadingProduct ? 'Loading product...' : 'Loading...'}
            </div>
          </div>
        )}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-4 bg-white rounded-xl shadow-lg">
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
            <div className="flex flex-col items-center">
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
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <button
                  disabled={back === "front"}
                  className={`px-6 py-2 rounded-lg transition-colors ${back === "front"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  onClick={() => handleBack("front")}
                >
                  Front View
                </button>
                <button
                  disabled={back === "back"}
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
                          {["All", "Animals","Architecture","Beauty","Computer","Food","Music","Movies","Medical","Nature","Places","Science","Sports","Technology","Transportation","Travel"].map((item) => (
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
