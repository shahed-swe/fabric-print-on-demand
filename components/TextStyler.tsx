import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold, faItalic, faUnderline, faAlignLeft, faAlignCenter,
  faAlignRight, faFont, faPalette, faDroplet, faShadow,
  faArrowRotateRight, faCircle, faStar, faWaveSquare
} from '@fortawesome/free-solid-svg-icons';

interface TextStylerProps {
  editor: any;
  selectedObject: fabric.Object | null;
  onTextAdd: (text: string) => void;
}

const fonts = [
  "Arial", "Times New Roman", "Courier New", "Georgia", "Verdana",
  "Helvetica", "Comic Sans MS", "Impact", "Trebuchet MS", "Palatino"
];

const TextStyler: React.FC<TextStylerProps> = ({ editor, selectedObject, onTextAdd }) => {
  // Text content state
  const [text, setText] = useState("");
  
  // Basic styling states
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(20);
  const [textColor, setTextColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  
  // Advanced styling states
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  
  // Shadow effects
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowBlur, setShadowBlur] = useState(0);
  const [shadowOffsetX, setShadowOffsetX] = useState(0);
  const [shadowOffsetY, setShadowOffsetY] = useState(0);
  
  // Text effects
  const [textEffect, setTextEffect] = useState<"none" | "arc" | "wave" | "circle" | "star">("none");
  const [effectRadius, setEffectRadius] = useState(50);
  const [effectAmplitude, setEffectAmplitude] = useState(20);
  
  // Gradient
  const [useGradient, setUseGradient] = useState(false);
  const [gradientColor1, setGradientColor1] = useState("#000000");
  const [gradientColor2, setGradientColor2] = useState("#ffffff");

  // Update text properties when selected object changes
  useEffect(() => {
    if (!selectedObject || !(selectedObject instanceof fabric.IText)) return;
    
    setText(selectedObject.text || "");
    setFontFamily(selectedObject.fontFamily || "Arial");
    setFontSize(selectedObject.fontSize || 20);
    setTextColor(selectedObject.fill?.toString() || "#000000");
    setBackgroundColor(selectedObject.backgroundColor?.toString() || "");
    setBold(selectedObject.fontWeight === 'bold');
    setItalic(selectedObject.fontStyle === 'italic');
    setUnderline(selectedObject.underline || false);
    setTextAlign(selectedObject.textAlign || "left");
    setLetterSpacing(selectedObject.charSpacing || 0);
    setLineHeight(selectedObject.lineHeight || 1.2);
    setRotation(selectedObject.angle || 0);
    setOpacity(selectedObject.opacity || 1);
    
    // Shadow properties
    if (selectedObject.shadow) {
      const shadow = selectedObject.shadow as fabric.Shadow;
      setShadowColor(shadow.color || "#000000");
      setShadowBlur(shadow.blur || 0);
      setShadowOffsetX(shadow.offsetX || 0);
      setShadowOffsetY(shadow.offsetY || 0);
    }
  }, [selectedObject]);

  // Apply text properties to selected object
  const updateTextProperties = () => {
    if (!editor?.canvas || !selectedObject || !(selectedObject instanceof fabric.IText)) return;

    const updatedProps: any = {
      fontFamily,
      fontSize,
      fill: useGradient ? createGradient() : textColor,
      backgroundColor: backgroundColor || 'transparent',
      fontWeight: bold ? 'bold' : 'normal',
      fontStyle: italic ? 'italic' : 'normal',
      underline,
      textAlign,
      charSpacing: letterSpacing,
      lineHeight,
      angle: rotation,
      opacity,
    };

    // Apply shadow if any shadow property is set
    if (shadowBlur > 0 || shadowOffsetX !== 0 || shadowOffsetY !== 0) {
      updatedProps.shadow = new fabric.Shadow({
        color: shadowColor,
        blur: shadowBlur,
        offsetX: shadowOffsetX,
        offsetY: shadowOffsetY,
      });
    } else {
      updatedProps.shadow = null;
    }

    // Apply text effects
    applyTextEffect(selectedObject as fabric.IText, textEffect);

    selectedObject.set(updatedProps);
    editor.canvas.renderAll();
  };

  // Create gradient fill
  const createGradient = () => {
    if (!editor?.canvas || !selectedObject) return textColor;

    const gradient = new fabric.Gradient({
      type: 'linear',
      coords: {
        x1: 0,
        y1: 0,
        x2: selectedObject.width,
        y2: selectedObject.height,
      },
      colorStops: [
        { offset: 0, color: gradientColor1 },
        { offset: 1, color: gradientColor2 },
      ],
    });

    return gradient;
  };

  // Apply text effects
  const applyTextEffect = (textObject: fabric.IText, effect: string) => {
    if (!textObject) return;

    switch (effect) {
      case 'arc':
        const radius = effectRadius;
        const text = textObject.text || '';
        const chars = text.split('');
        const totalAngle = chars.length * 10;
        const startAngle = -totalAngle / 2;

        chars.forEach((char, i) => {
          const charAngle = startAngle + (i * totalAngle / chars.length);
          const x = radius * Math.cos((charAngle * Math.PI) / 180);
          const y = radius * Math.sin((charAngle * Math.PI) / 180);
          
          if (textObject.setPositionByOrigin) {
            textObject.setPositionByOrigin(new fabric.Point(x, y), 'center', 'center');
          }
        });
        break;

      case 'wave':
        const amplitude = effectAmplitude;
        const frequency = 0.1;
        textObject.set({
          top: textObject.top + Math.sin(frequency * textObject.left!) * amplitude
        });
        break;

      case 'circle':
        const circumference = Math.PI * 2 * effectRadius;
        const textLength = (textObject.text || '').length;
        const anglePerChar = (360 / circumference) * (textObject.fontSize || 20);
        
        textObject.set({
          radius: effectRadius,
          spacing: anglePerChar
        });
        break;

      case 'star':
        const points = 5;
        const innerRadius = effectRadius * 0.4;
        const outerRadius = effectRadius;
        let angle = -Math.PI / 2;
        const step = (Math.PI * 2) / points;
        
        const coords = [];
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? outerRadius : innerRadius;
          const x = r * Math.cos(angle);
          const y = r * Math.sin(angle);
          coords.push(new fabric.Point(x, y));
          angle += step / 2;
        }
        
        if (textObject.setPositionByOrigin) {
          textObject.setPositionByOrigin(coords[0], 'center', 'center');
        }
        break;
    }
  };

  // Handle text input
  const handleAddText = () => {
    if (text.trim()) {
      onTextAdd(text);
      setText("");
    }
  };

  // Effect to update properties when they change
  useEffect(() => {
    updateTextProperties();
  }, [
    fontFamily, fontSize, textColor, backgroundColor, bold, italic,
    underline, textAlign, letterSpacing, lineHeight, rotation,
    opacity, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY,
    textEffect, effectRadius, effectAmplitude, useGradient,
    gradientColor1, gradientColor2
  ]);

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      {/* Text Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleAddText}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Text
        </button>
      </div>

      {/* Basic Styling */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="p-2 border rounded"
          >
            {fonts.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
          
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-20 p-2 border rounded"
            min="1"
            max="200"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setBold(!bold)}
            className={`p-2 rounded ${bold ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faBold} />
          </button>
          <button
            onClick={() => setItalic(!italic)}
            className={`p-2 rounded ${italic ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faItalic} />
          </button>
          <button
            onClick={() => setUnderline(!underline)}
            className={`p-2 rounded ${underline ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faUnderline} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTextAlign('left')}
            className={`p-2 rounded ${textAlign === 'left' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faAlignLeft} />
          </button>
          <button
            onClick={() => setTextAlign('center')}
            className={`p-2 rounded ${textAlign === 'center' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faAlignCenter} />
          </button>
          <button
            onClick={() => setTextAlign('right')}
            className={`p-2 rounded ${textAlign === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faAlignRight} />
          </button>
        </div>
      </div>

      {/* Color Controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label>Text Color:</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-8 h-8"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label>Background:</label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-8 h-8"
          />
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="space-y-2">
        <div>
          <label>Letter Spacing:</label>
          <input
            type="range"
            min="-20"
            max="100"
            value={letterSpacing}
            onChange={(e) => setLetterSpacing(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label>Line Height:</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={lineHeight}
            onChange={(e) => setLineHeight(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label>Rotation:</label>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label>Opacity:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Shadow Effects */}
      <div className="space-y-2">
        <h3 className="font-semibold">Shadow Effects</h3>
        <div className="flex items-center gap-2">
          <label>Color:</label>
          <input
            type="color"
            value={shadowColor}
            onChange={(e) => setShadowColor(e.target.value)}
            className="w-8 h-8"
          />
        </div>
        
        <div>
          <label>Blur:</label>
          <input
            type="range"
            min="0"
            max="50"
            value={shadowBlur}
            onChange={(e) => setShadowBlur(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label>Offset X:</label>
          <input
            type="range"
            min="-50"
            max="50"
            value={shadowOffsetX}
            onChange={(e) => setShadowOffsetX(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label>Offset Y:</label>
          <input
            type="range"
            min="-50"
            max="50"
            value={shadowOffsetY}
            onChange={(e) => setShadowOffsetY(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Text Effects */}
      <div className="space-y-2">
        <h3 className="font-semibold">Text Effects</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTextEffect('none')}
            className={`p-2 rounded ${textEffect === 'none' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faFont} />
          </button>
          <button
            onClick={() => setTextEffect('arc')}
            className={`p-2 rounded ${textEffect === 'arc' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faArrowRotateRight} />
          </button>
          <button
            onClick={() => setTextEffect('wave')}
            className={`p-2 rounded ${textEffect === 'wave' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faWaveSquare} />
          </button>
          <button
            onClick={() => setTextEffect('circle')}
            className={`p-2 rounded ${textEffect === 'circle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faCircle} />
          </button>
          <button
            onClick={() => setTextEffect('star')}
            className={`p-2 rounded ${textEffect === 'star' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faStar} />
          </button>
        </div>

        {textEffect !== 'none' && (
          <div>
            <label>Effect Size:</label>
            <input
              type="range"
              min="10"
              max="200"
              value={effectRadius}
              onChange={(e) => setEffectRadius(Number(e.target.value))}
              className="w-full"
            />
            {textEffect === 'wave' && (
              <div>
                <label>Wave Height:</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={effectAmplitude}
                  onChange={(e) => setEffectAmplitude(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gradient */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useGradient}
            onChange={(e) => setUseGradient(e.target.checked)}
          />
          <label>Use Gradient</label>
        </div>
        
        {useGradient && (
          <div className="flex gap-4">
            <div>
              <label>Color 1:</label>
              <input
                type="color"
                value={gradientColor1}
                onChange={(e) => setGradientColor1(e.target.value)}
                className="w-8 h-8"
              />
            </div>
            <div>
              <label>Color 2:</label>
              <input
                type="color"
                value={gradientColor2}
                onChange={(e) => setGradientColor2(e.target.value)}
                className="w-8 h-8"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextStyler;
