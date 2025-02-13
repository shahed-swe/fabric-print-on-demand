import React from 'react';
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
                top: "18%",
                left: "31%",
                zIndex: 10,
                width: "38%",
                height: "64%",
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
                top: "18%",
                left: "31%",
                zIndex: 10,
                width: "38%",
                height: "64%",
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
