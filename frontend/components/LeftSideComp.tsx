import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFont,
  faSmile,
  faTrash,
  faImage,
  faPalette,
  faStamp,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { colorService } from '../services/color';

interface LeftSideCompProps {
  handleTextEditorOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
  setShowEmojiPicker: (show: boolean) => void;
  setTextEditorPosition: (position: { x: number, y: number }) => void;
  setShowTextEditor: (show: boolean) => void;
  showEmojiPicker: boolean;
  handleAddImage: (file: File) => void;
  handleAddSmallImage: (file: File) => void;
  setShowArtModal: (show: boolean) => void;
  deleteSelected: () => void;
  handleGenerateAIImage: () => void;
  isGeneratingImage: boolean;
  aiImagePrompt: string;
  setAiImagePrompt: (prompt: string) => void;
  data: any[];
  setImage: (image: any) => void;
  setColor: (color: string) => void;
  image: any;
  color?: string;
}

const LeftSideComp: React.FC<LeftSideCompProps> = ({
  handleTextEditorOpen,
  setShowEmojiPicker,
  setTextEditorPosition,
  setShowTextEditor,
  showEmojiPicker,
  handleAddSmallImage,
  setShowArtModal,
  deleteSelected,
  data,
  setImage,
  setColor,
  image,
  color,
}) => {
  const [colors, setColors] = useState<any[]>([]);
  const [loadingColors, setLoadingColors] = useState(false);

  // Fetch colors from API
  useEffect(() => {
    const fetchColors = async () => {
      try {
        setLoadingColors(true);
        const fetchedColors = await colorService.getAllColors();
        setColors(fetchedColors);
      } catch (error) {
        console.error('Error fetching colors:', error);
        // Fallback to empty array if API fails
        setColors([]);
      } finally {
        setLoadingColors(false);
      }
    };
    fetchColors();
  }, []);

  // Shared classes for a tool tile
  const toolTile =
    "group flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50 hover:shadow-sm active:scale-95 transition-all cursor-pointer";

  return (
    <div className="space-y-6">
      {/* ===== Add Elements ===== */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Add Elements
        </h4>
        <div className="grid grid-cols-3 gap-2.5">
          <button onClick={handleTextEditorOpen} className={toolTile}>
            <span className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faFont} />
            </span>
            <span className="text-xs font-medium text-gray-700">Text</span>
          </button>

          <button
            onClick={(e) => {
              setShowEmojiPicker(!showEmojiPicker);
              const buttonRect = e.currentTarget.getBoundingClientRect();
              setTextEditorPosition({
                x: buttonRect.left,
                y: buttonRect.bottom + window.scrollY
              });
              setShowTextEditor(false); // Ensure Text Editor is closed
            }}
            className={toolTile}
          >
            <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faSmile} />
            </span>
            <span className="text-xs font-medium text-gray-700">Emoji</span>
          </button>

          <label htmlFor="imageUpload" className={toolTile}>
            <span className="w-9 h-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faImage} />
            </span>
            <span className="text-xs font-medium text-gray-700">Image</span>
          </label>

          <button onClick={() => setShowArtModal(true)} className={toolTile}>
            <span className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faPalette} />
            </span>
            <span className="text-xs font-medium text-gray-700">Artwork</span>
          </button>

          <label htmlFor="smallImageUpload" className={toolTile}>
            <span className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faStamp} />
            </span>
            <span className="text-xs font-medium text-gray-700">Logo</span>
          </label>

          <button
            onClick={deleteSelected}
            className="group flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-red-100 bg-white hover:border-red-300 hover:bg-red-50 active:scale-95 transition-all"
          >
            <span className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faTrash} />
            </span>
            <span className="text-xs font-medium text-red-600">Delete</span>
          </button>
        </div>
      </div>

      {/* ===== Choose Style ===== */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Choose Style
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {data?.map((item, index) => {
            const isSelected = image === item;
            return (
              <button
                key={index}
                className={`relative p-3 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                  isSelected
                    ? "border-orange-500 bg-orange-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => {
                  setImage(item);
                  localStorage.setItem("image", JSON.stringify(item));
                }}
              >
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                )}
                <img
                  src={item.front.src}
                  alt={item.title}
                  className="w-12 h-14 object-contain"
                />
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== Choose Color ===== */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Choose Color
        </h4>
        <div className="flex flex-wrap gap-3">
          {loadingColors ? (
            <p className="text-gray-400 text-sm">Loading colors...</p>
          ) : colors.length === 0 ? (
            <p className="text-gray-400 text-sm">No colors available</p>
          ) : (
            colors.map((c) => {
              const isSelected = color === c.hexCode;
              return (
                <button
                  key={c._id}
                  onClick={() => {
                    setColor(c.hexCode);
                    localStorage.setItem("color", c.hexCode);
                  }}
                  title={c.displayName}
                  className={`relative w-10 h-10 rounded-full transition-all hover:scale-110 ${
                    isSelected
                      ? "ring-2 ring-orange-500 ring-offset-2"
                      : "ring-1 ring-gray-200"
                  }`}
                  style={{ backgroundColor: c.hexCode }}
                >
                  {isSelected && (
                    <span
                      className="absolute inset-0 flex items-center justify-center text-xs"
                      style={{
                        color: ['#ffffff', '#fff', '#f5f5f5'].includes(
                          (c.hexCode || '').toLowerCase()
                        )
                          ? '#374151'
                          : '#ffffff',
                      }}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Hidden file input for logo upload */}
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleAddSmallImage(e.target.files[0]);
            e.target.value = '';
          }
        }}
        className="hidden"
        id="smallImageUpload"
        accept="image/*"
      />
    </div>
  );
};

export default LeftSideComp;
