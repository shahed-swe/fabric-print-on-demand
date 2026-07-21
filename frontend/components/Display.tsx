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
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const src = props.back === 'front' ? props.image?.front?.src : props.image?.back?.src;
  const shirtId = props.back === 'front' ? 'shirtDiv' : 'shirtBack';

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

  // Drive the loading state with a dedicated preloader whenever the shirt image
  // source changes. The DOM <img> onLoad can silently not fire for cached images
  // (leaving the spinner stuck), so we rely on a separate Image() whose load/error
  // events are reliable, plus a check for images that are already cached/complete.
  useEffect(() => {
    if (!src) {
      setImgLoaded(false);
      setImgError(false);
      return;
    }

    setImgLoaded(false);
    setImgError(false);

    let cancelled = false;
    const preloader = new Image();
    preloader.onload = () => { if (!cancelled) setImgLoaded(true); };
    preloader.onerror = () => { if (!cancelled) setImgError(true); };
    preloader.src = src;

    // If the image is already in cache it may be complete before onload is attached.
    if (preloader.complete) {
      if (preloader.naturalWidth > 0) {
        setImgLoaded(true);
      } else {
        setImgError(true);
      }
    }

    // Safety net: never let the spinner run indefinitely.
    const timeout = setTimeout(() => { if (!cancelled) setImgLoaded(true); }, 10000);

    return () => {
      cancelled = true;
      preloader.onload = null;
      preloader.onerror = null;
      clearTimeout(timeout);
    };
  }, [src]);

  const isLoading = !!src && !imgLoaded && !imgError;

  return (
    <div id="sshot" style={props.style}>
      <div
        id={shirtId}
        className="page"
        style={{
          width: "100%",
          maxWidth: "530px",
          height: "auto",
          minHeight: "320px",
          position: "relative",
          backgroundColor: props.color || "white",
        }}
      >
        {/* Opaque overlay + spinner while the shirt image loads. It sits on top of the
            image (hiding any broken-image flash) and is excluded from the html2canvas
            capture via data-html2canvas-ignore, so it never ends up in the saved design. */}
        {isLoading && (
          <div
            data-html2canvas-ignore="true"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20,
              backgroundColor: props.color || "#ffffff",
            }}
          >
            <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
          </div>
        )}

        <img
          className="img-fluid"
          data-name="tshirtview"
          id="tshirtFacing"
          src={src}
          alt="T-shirt view"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
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
    </div>
  );
};

export default Display;
