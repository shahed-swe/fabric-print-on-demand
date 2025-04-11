import React, { useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { FabricJSCanvas } from 'fabricjs-react';

interface DisplayProps {
  back: string;
  color: string;
  image: {
    front: {
      src: string;
    };
    back: {
      src: string;
    };
  };
  Canvas: typeof FabricJSCanvas;
  onReady: (canvas: fabric.Canvas) => void;
  style?: React.CSSProperties;
}

const Display: React.FC<DisplayProps> = (props) => {
  const { Canvas, onReady } = props;

  const [canvasSize, setCanvasSize] = useState({ width: 200, height: 400 });

  useEffect(() => {
    const updateCanvasSize = () => {
      if (window.innerWidth <= 600) {
        setCanvasSize({ width: 150, height: 250 });
      } else if (window.innerWidth <= 1440) {
        setCanvasSize({ width: 180, height: 320 });
      } else {
        setCanvasSize({ width: 200, height: 400 });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  return (
    <div id="sshot" style={props.style}>
      {props.back === "front" ? (
        <div
          id="shirtDiv"
          className="page"
          style={{
            width: "100%",
            maxWidth: "530px",
            height: "auto",
            position: "relative",
            backgroundColor: props.color || "white",
          }}
        >
          <img
            className="img-fluid"
            data-name="tshirtview"
            id="tshirtFacing"
            src={props.image?.front?.src}
            alt="T-shirt front view"
            style={{ width: "100%", height: "auto" }}
          />
          {Canvas && (
            <div
              id="drawingArea"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10,
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,// Responsive height fallback
              }}
            >
              <div style={{
                  WebkitUserSelect: "none",
                  width: "100%",
                  height: "100%"
                }}>
                <Canvas
                  className="sample-canvas"
                  onReady={onReady}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          id="shirtBack"
          className="page"
          style={{
            width: "100%",
            maxWidth: "530px",
            height: "auto",
            position: "relative",
            backgroundColor: props.color || "white",
          }}
        >
          <img
            className="img-fluid"
            src={props.image?.back?.src}
            alt="T-shirt back view"
            style={{ width: "100%", height: "auto" }}
          />
          {Canvas && (
            <div
              id="drawingArea"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10,
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
              }}
            >
              <div style={{
                  WebkitUserSelect: "none",
                  width: "100%",
                  height: "100%"
                }}>
                <Canvas
                  className="sample-canvas"
                  onReady={onReady}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Display;