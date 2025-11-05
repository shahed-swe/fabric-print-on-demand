import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPenFancy, 
  faFont, 
  faSmile, 
  faTrash, 
  faImage 
} from "@fortawesome/free-solid-svg-icons";

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
}

const LeftSideComp: React.FC<LeftSideCompProps> = ({
  handleTextEditorOpen,
  setShowEmojiPicker,
  setTextEditorPosition,
  setShowTextEditor,
  showEmojiPicker,
  handleAddImage,
  handleAddSmallImage,
  setShowArtModal,
  deleteSelected,
  handleGenerateAIImage,
  isGeneratingImage,
  aiImagePrompt,
  setAiImagePrompt,
  data,
  setImage,
  setColor,
  image
}) => {
  return (
    <div>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleTextEditorOpen}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <FontAwesomeIcon icon={faFont} />
          Add Text
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

        <label
          htmlFor="smallImageUpload"
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 cursor-pointer"
        >
          <FontAwesomeIcon icon={faImage} />
          Add Logo
        </label>

        <button
          onClick={deleteSelected}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          <FontAwesomeIcon icon={faTrash} />
          Delete
        </button>
      </div>
{/* 
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-700 mb-3">Generate AI Image</h4>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={aiImagePrompt}
            onChange={(e) => setAiImagePrompt(e.target.value)}
            placeholder="Enter prompt for AI image"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={handleGenerateAIImage}
            disabled={isGeneratingImage || !aiImagePrompt}
            className={`flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg ${isGeneratingImage || !aiImagePrompt ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-600'
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
                Generate
              </>
            )}
          </button>
        </div>
      </div> */}

      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-700 mb-3">Choose Style</h4>
        <div className="grid grid-cols-2 gap-4">
          {data?.map((item, index) => (
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
      <div className="mt-4">
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

      {/* Hidden file inputs */}
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