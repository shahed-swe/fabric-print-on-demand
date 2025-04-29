import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { fabric } from "fabric";
import TextStyler from "./TextStyler";

interface TextEditorModalProps {
  showTextEditor: boolean;
  textEditorRef: React.RefObject<HTMLDivElement>;
  textEditorPosition: { x: number; y: number };
  setShowTextEditor: (value: boolean) => void;
  editor: any;
  selectedObject: fabric.Object | null;
  setSelectedObject: (object: fabric.Object | null) => void;
}

const TextEditorModal: React.FC<TextEditorModalProps> = ({
  showTextEditor,
  textEditorRef,
  textEditorPosition,
  setShowTextEditor,
  editor,
  selectedObject,
  setSelectedObject,
}) => {
  if (!showTextEditor) return null;

  return (
    <div
      ref={textEditorRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border"
      style={{
        top: textEditorPosition.y,
        left: textEditorPosition.x,
        maxHeight: "80vh",
        overflowY: "auto",
        width: "350px",
      }}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Text Editor</h3>
        <button
          onClick={() => setShowTextEditor(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <TextStyler
        editor={editor}
        selectedObject={selectedObject}
        onTextAdd={(text) => {
          if (!editor?.canvas) return;

          const textBox = new fabric.IText(text, {
            left: editor.canvas.width ? editor.canvas.width / 2 : 100,
            top: editor.canvas.height ? editor.canvas.height / 2 : 100,
            originX: "center",
            originY: "center",
            fontSize: 20,
          });

          editor.canvas.add(textBox);
          editor.canvas.setActiveObject(textBox);
          setSelectedObject(textBox);
          editor.canvas.renderAll();
        }}
      />
    </div>
  );
};

export default TextEditorModal;
