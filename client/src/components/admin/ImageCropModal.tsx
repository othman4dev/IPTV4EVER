import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import type { Area, Point } from "react-easy-crop";
import "../../assets/css/admin/image-crop-modal.css";

// ─── Canvas helper ─────────────────────────────────────────────────────────

async function cropImageToFile(
  src: string,
  pixelCrop: Area,
  originalFile: File,
): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    const mimeType = originalFile.type || "image/jpeg";
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Failed to create image blob"));
        resolve(new File([blob], `cropped_${originalFile.name}`, { type: mimeType }));
      },
      mimeType,
      0.92,
    );
  });
}

// ─── Aspect ratio options ──────────────────────────────────────────────────

const ASPECT_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: "Free", value: undefined },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "3:4", value: 3 / 4 },
  { label: "9:16", value: 9 / 16 },
];

// ─── Component ────────────────────────────────────────────────────────────

interface ImageCropModalProps {
  file: File;
  onDone: (croppedFile: File) => void;
  onCancel: () => void;
}

export function ImageCropModal({ file, onDone, onCancel }: ImageCropModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  // Create blob URL inside useEffect so React StrictMode's double-invoke
  // doesn't revoke the URL before the component has a chance to render.
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels || !imageUrl) return;
    setApplying(true);
    try {
      const cropped = await cropImageToFile(imageUrl, croppedAreaPixels, file);
      onDone(cropped);
    } catch {
      onDone(file); // fallback to original on error
    } finally {
      setApplying(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div className="icm-overlay" onClick={handleOverlayClick}>
      <div className="icm-modal" role="dialog" aria-modal="true" aria-label="Crop image">
        {/* Header */}
        <div className="icm-header">
          <span className="icm-title">
            <i className="bi bi-crop" />
            Crop Image
          </span>
          <button className="icm-close" onClick={onCancel} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Crop canvas area */}
        <div className="icm-crop-wrap">
          {imageUrl && <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            {...(aspect !== undefined ? { aspect } : {})}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
          />}
        </div>

        {/* Controls */}
        <div className="icm-controls">
          <div className="icm-ctrl-row">
            <span className="icm-ctrl-label">Aspect</span>
            <div className="icm-aspect-btns">
              {ASPECT_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  className={`icm-aspect-btn${aspect === opt.value ? " active" : ""}`}
                  onClick={() => setAspect(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="icm-ctrl-row">
            <span className="icm-ctrl-label">Zoom</span>
            <input
              type="range"
              className="icm-zoom-slider"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom"
            />
            <span className="icm-zoom-val">{zoom.toFixed(1)}×</span>
          </div>
        </div>

        {/* Footer */}
        <div className="icm-footer">
          <button
            type="button"
            className="icm-btn-skip"
            onClick={() => onDone(file)}
            disabled={applying}
          >
            Skip Crop
          </button>
          <div className="icm-footer-right">
            <button
              type="button"
              className="icm-btn-cancel"
              onClick={onCancel}
              disabled={applying}
            >
              Cancel
            </button>
            <button
              type="button"
              className="icm-btn-apply"
              onClick={handleApply}
              disabled={applying || !croppedAreaPixels}
            >
              {applying ? (
                <>
                  <i className="bi bi-hourglass-split" /> Applying…
                </>
              ) : (
                <>
                  <i className="bi bi-check2" /> Apply Crop
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
