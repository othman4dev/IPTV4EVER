import { useState, useCallback, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import type { Area, Point } from "react-easy-crop";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import "../../assets/css/admin/video-crop-modal.css";

// ─── FFmpeg singleton (loaded once per page session) ─────────────────────────

let _ffmpeg: FFmpeg | null = null;
let _loadPromise: Promise<void> | null = null;

async function loadFFmpeg(onProgress: (pct: number) => void): Promise<FFmpeg> {
  if (_ffmpeg?.loaded) return _ffmpeg;

  if (!_loadPromise) {
    _ffmpeg = new FFmpeg();

    // Files are served locally from /ffmpeg/ (copied from @ffmpeg/core during install)
    const baseURL = "/ffmpeg";

    let jsBytes = 0;
    let wasmBytes = 0;
    let jsTotal = 0;
    let wasmTotal = 0;

    const reportProgress = () => {
      const total = jsTotal + wasmTotal;
      if (total === 0) return;
      const loaded = jsBytes + wasmBytes;
      onProgress(Math.round((loaded / total) * 100));
    };

    _loadPromise = Promise.all([
      toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript", true, ({ received, total }) => {
        jsBytes = received;
        jsTotal = total;
        reportProgress();
      }),
      toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm", true, ({ received, total }) => {
        wasmBytes = received;
        wasmTotal = total;
        reportProgress();
      }),
    ]).then(([coreURL, wasmURL]) =>
      _ffmpeg!.load({ coreURL, wasmURL }),
    );
  }

  await _loadPromise;
  return _ffmpeg!;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function secondsToTimecode(s: number): string {
  const m = Math.floor(s / 60);
  const sec = (s - m * 60).toFixed(1).padStart(4, "0");
  return `${String(m).padStart(2, "0")}:${sec}`;
}

// Extract a video frame as a blob URL for the crop UI
async function extractFrame(videoEl: HTMLVideoElement, seekTime: number): Promise<string> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      videoEl.removeEventListener("seeked", onSeeked);
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(videoEl, 0, 0);
      canvas.toBlob((blob) => {
        resolve(blob ? URL.createObjectURL(blob) : "");
      }, "image/jpeg", 0.9);
    };
    videoEl.addEventListener("seeked", onSeeked);
    videoEl.currentTime = seekTime;
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

type Stage = "loading" | "ready" | "processing";

interface VideoCropModalProps {
  file: File;
  onDone: (processedFile: File) => void;
  onCancel: () => void;
}

export function VideoCropModal({ file, onDone, onCancel }: VideoCropModalProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stage state
  const [stage, setStage] = useState<Stage>("loading");
  const [loadPct, setLoadPct] = useState(0);
  const [processPct, setProcessPct] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Video metadata
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // Spatial crop
  const [cropEnabled, setCropEnabled] = useState(false);
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [cropPoint, setCropPoint] = useState<Point>({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropAspect] = useState<number | undefined>(undefined);

  const frameBlobRef = useRef<string | null>(null);

  // Load FFmpeg on mount
  useEffect(() => {
    let cancelled = false;
    loadFFmpeg((pct) => {
      if (!cancelled) setLoadPct(pct);
    })
      .then(() => {
        if (!cancelled) setStage("ready");
      })
      .catch((e) => {
        if (!cancelled) setError(`Failed to load video editor: ${e?.message ?? e}`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Create video blob URL inside useEffect to survive React StrictMode double-invoke
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Cleanup frame blob URLs on unmount
  useEffect(() => {
    return () => {
      if (frameBlobRef.current) URL.revokeObjectURL(frameBlobRef.current);
    };
  }, []);

  const handleVideoLoaded = () => {
    const v = videoRef.current;
    if (!v) return;
    const dur = v.duration;
    setDuration(dur);
    setTrimEnd(dur);
  };

  const handleCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // Extract frame when user toggles crop or seeks
  const handleEnableCrop = async (enabled: boolean) => {
    setCropEnabled(enabled);
    if (enabled && videoRef.current) {
      const url = await extractFrame(videoRef.current, trimStart);
      if (frameBlobRef.current) URL.revokeObjectURL(frameBlobRef.current);
      frameBlobRef.current = url;
      setFrameUrl(url);
    }
  };

  // Re-extract frame when trim start changes with crop enabled
  const handleTrimStartChange = async (val: number) => {
    setTrimStart(val);
    if (cropEnabled && videoRef.current) {
      const url = await extractFrame(videoRef.current, val);
      if (frameBlobRef.current) URL.revokeObjectURL(frameBlobRef.current);
      frameBlobRef.current = url;
      setFrameUrl(url);
    }
  };

  const handleApply = async () => {
    const ffmpeg = _ffmpeg;
    if (!ffmpeg?.loaded) return;

    const needsTrim = trimStart > 0.01 || trimEnd < duration - 0.01;
    const needsCrop = cropEnabled && croppedAreaPixels;

    if (!needsTrim && !needsCrop) {
      onDone(file);
      return;
    }

    setStage("processing");
    setProcessPct(0);

    try {
      ffmpeg.on("progress", ({ progress }) => {
        setProcessPct(Math.round(Math.min(progress, 1) * 100));
      });

      const inputName = "input" + (file.name.match(/\.\w+$/)?.[0] ?? ".mp4");
      const outputName = "output" + (file.name.match(/\.\w+$/)?.[0] ?? ".mp4");

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const args: string[] = ["-i", inputName];

      if (needsTrim) {
        args.push("-ss", String(trimStart.toFixed(3)));
        args.push("-to", String(trimEnd.toFixed(3)));
      }

      if (needsCrop && croppedAreaPixels) {
        const v = videoRef.current!;
        // Scale crop coordinates from displayed frame to actual video pixels
        const scaleX = v.videoWidth / v.getBoundingClientRect().width;
        const scaleY = v.videoHeight / v.getBoundingClientRect().height;
        const cw = Math.round(croppedAreaPixels.width * scaleX);
        const ch = Math.round(croppedAreaPixels.height * scaleY);
        const cx = Math.round(croppedAreaPixels.x * scaleX);
        const cy = Math.round(croppedAreaPixels.y * scaleY);
        // Ensure even numbers (required by h264 codec)
        const evenW = cw - (cw % 2);
        const evenH = ch - (ch % 2);
        args.push("-vf", `crop=${evenW}:${evenH}:${cx}:${cy}`);
        args.push("-c:a", "copy");
      } else {
        // No re-encode needed if only trimming
        args.push("-c", "copy");
      }

      args.push(outputName);

      await ffmpeg.exec(args);

      const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
      const mimeType = file.type || "video/mp4";
      const blob = new Blob([data], { type: mimeType });
      const outFile = new File([blob], `trimmed_${file.name}`, { type: mimeType });

      // Cleanup ffmpeg files
      try {
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
      } catch {
        /* ignore cleanup errors */
      }

      onDone(outFile);
    } catch (e: any) {
      setError(`Processing failed: ${e?.message ?? "Unknown error"}`);
      setStage("ready");
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel();
  };

  const trimDuration = Math.max(0, trimEnd - trimStart);

  return (
    <div className="vcm-overlay" onClick={handleOverlayClick}>
      <div className="vcm-modal" role="dialog" aria-modal="true" aria-label="Crop and trim video">
        {/* Header */}
        <div className="vcm-header">
          <span className="vcm-title">
            <i className="bi bi-scissors" />
            Crop & Trim Video
          </span>
          <button className="vcm-close" onClick={onCancel} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Loading state */}
        {stage === "loading" && (
          <div className="vcm-loading">
            <div className="vcm-loading-icon">
              <i className="bi bi-film" />
            </div>
            <p className="vcm-loading-title">Loading video editor…</p>
            <p className="vcm-loading-sub">
              {loadPct < 100
                ? `Downloading FFmpeg engine (${loadPct}%)…`
                : "Initializing…"}
            </p>
            <div className="vcm-progress-bar">
              <div className="vcm-progress-fill" style={{ width: `${loadPct}%` }} />
            </div>
            <p className="vcm-loading-note">
              First load may take a moment — will be cached for future use.
            </p>
            <button type="button" className="vcm-btn-skip" onClick={() => onDone(file)}>
              Skip &amp; upload original
            </button>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="vcm-error-banner">
            <i className="bi bi-exclamation-triangle" />
            {error}
            <button className="vcm-btn-skip" onClick={() => onDone(file)}>Upload original</button>
          </div>
        )}

        {/* Processing state */}
        {stage === "processing" && (
          <div className="vcm-loading">
            <div className="vcm-loading-icon processing">
              <i className="bi bi-gear-fill" />
            </div>
            <p className="vcm-loading-title">Processing video…</p>
            <p className="vcm-loading-sub">{processPct}% complete</p>
            <div className="vcm-progress-bar">
              <div className="vcm-progress-fill" style={{ width: `${processPct}%` }} />
            </div>
          </div>
        )}

        {/* Ready state */}
        {stage === "ready" && !error && (
          <div className="vcm-body">
            {/* Hidden video element for metadata + frame extraction */}
            {videoUrl && <video
              ref={videoRef}
              src={videoUrl}
              className="vcm-video-preview"
              onLoadedMetadata={handleVideoLoaded}
              controls
              playsInline
            />}

            {/* Trim controls */}
            <div className="vcm-section">
              <div className="vcm-section-header">
                <i className="bi bi-clock" />
                <span>Trim</span>
                <span className="vcm-duration-badge">
                  {secondsToTimecode(trimDuration)} selected
                </span>
              </div>

              <div className="vcm-trim-row">
                <div className="vcm-trim-field">
                  <label className="vcm-trim-label">Start</label>
                  <input
                    type="range"
                    className="vcm-trim-slider"
                    min={0}
                    max={Math.max(0, trimEnd - 0.1)}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => handleTrimStartChange(Number(e.target.value))}
                  />
                  <span className="vcm-trim-time">{secondsToTimecode(trimStart)}</span>
                </div>

                <div className="vcm-trim-field">
                  <label className="vcm-trim-label">End</label>
                  <input
                    type="range"
                    className="vcm-trim-slider"
                    min={Math.min(trimStart + 0.1, duration)}
                    max={duration}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => setTrimEnd(Number(e.target.value))}
                  />
                  <span className="vcm-trim-time">{secondsToTimecode(trimEnd)}</span>
                </div>
              </div>
            </div>

            {/* Spatial crop toggle */}
            <div className="vcm-section">
              <div className="vcm-section-header">
                <i className="bi bi-crop" />
                <span>Spatial Crop</span>
                <label className="vcm-toggle">
                  <input
                    type="checkbox"
                    checked={cropEnabled}
                    onChange={(e) => handleEnableCrop(e.target.checked)}
                  />
                  <span className="vcm-toggle-slider" />
                </label>
                <span className="vcm-toggle-label">{cropEnabled ? "On" : "Off"}</span>
              </div>

              {cropEnabled && frameUrl && (
                <div className="vcm-crop-wrap">
                  <Cropper
                    image={frameUrl}
                    crop={cropPoint}
                    zoom={cropZoom}
                    {...(cropAspect !== undefined ? { aspect: cropAspect } : {})}
                    onCropChange={setCropPoint}
                    onZoomChange={setCropZoom}
                    onCropComplete={handleCropComplete}
                    showGrid
                  />
                  <div className="vcm-crop-hint">
                    Drag to set crop area — frame extracted at trim start
                  </div>
                </div>
              )}

              {cropEnabled && !frameUrl && (
                <p className="vcm-hint">Extracting frame…</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        {stage === "ready" && !error && (
          <div className="vcm-footer">
            <button
              type="button"
              className="vcm-btn-skip"
              onClick={() => onDone(file)}
            >
              Skip &amp; upload original
            </button>
            <div className="vcm-footer-right">
              <button type="button" className="vcm-btn-cancel" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="vcm-btn-apply"
                onClick={handleApply}
                disabled={duration === 0}
              >
                <i className="bi bi-check2" /> Apply &amp; Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
