import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Camera,
  Video,
  VideoOff,
  Upload,
  Image as ImageIcon,
  Loader2,
  Scan,
  Sparkles,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Tag
} from 'lucide-react';
import { Product } from '../types';
import {
  detectBarcodeInVideoFrame,
  scanBarcodeFromImage,
  getSupportedNativeDetector,
  BarcodeDetectionResult
} from '../utils/barcodeScanner';

interface ScannerViewProps {
  cartCount: number;
  products: Product[];
  categories: string[];
  onScanBarcode: (barcode: string) => void;
  onShowProductInfo: (product: Product) => void;
  onAddToCart: (product: Product, qty?: number) => boolean;
  isModalOpen?: boolean;
  manualFocusTrigger?: number;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  cartCount,
  products,
  categories,
  onScanBarcode,
  onShowProductInfo,
  onAddToCart,
  isModalOpen = false,
  manualFocusTrigger
}) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [cameraActive, setCameraActive] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [scanStatusMessage, setScanStatusMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const streamRef = useRef<MediaStream | null>(null);
  const nativeDetectorRef = useRef<any | null>(null);
  const scanLoopTimerRef = useRef<number | null>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  // Scan cooldown to prevent accidental duplicate triggers (Requirement 13)
  const lastScannedCodeRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);
  const detectedHighlightTimerRef = useRef<number | null>(null);

  const cameraFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Focus manual input when requested
  useEffect(() => {
    if (manualFocusTrigger && manualInputRef.current) {
      manualInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      manualInputRef.current.focus();
    }
  }, [manualFocusTrigger]);

  // Filter products by selected category
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  // Draw overlay on canvas (Requirement 4: Draw a scanning box/overlay around the barcode)
  const drawBarcodeBoxOverlay = useCallback((detection: BarcodeDetectionResult | null) => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Synchronize canvas coordinate dimensions with actual display dimensions
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!detection) return;

    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 480;
    const scaleX = canvas.width / vWidth;
    const scaleY = canvas.height / vHeight;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#10b981'; // emerald-500
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';

    let boxX = 0;
    let boxY = 0;
    let boxW = 0;
    let boxH = 0;

    if (detection.cornerPoints && detection.cornerPoints.length >= 4) {
      // Draw polygon around exact barcode corners
      ctx.beginPath();
      detection.cornerPoints.forEach((pt, idx) => {
        const x = pt.x * scaleX;
        const y = pt.y * scaleY;
        if (idx === 0) {
          ctx.moveTo(x, y);
          boxX = x;
          boxY = y;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw corner accent brackets
      detection.cornerPoints.forEach((pt) => {
        const x = pt.x * scaleX;
        const y = pt.y * scaleY;
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (detection.boundingBox) {
      boxX = detection.boundingBox.x * scaleX;
      boxY = detection.boundingBox.y * scaleY;
      boxW = detection.boundingBox.width * scaleX;
      boxH = detection.boundingBox.height * scaleY;

      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.fillRect(boxX, boxY, boxW, boxH);
    } else if (detection.cornerPoints && detection.cornerPoints.length >= 2) {
      const p1 = detection.cornerPoints[0];
      const p2 = detection.cornerPoints[1];
      const minX = Math.min(p1.x, p2.x) * scaleX - 20;
      const maxX = Math.max(p1.x, p2.x) * scaleX + 20;
      const minY = Math.min(p1.y, p2.y) * scaleY - 30;
      const maxY = Math.max(p1.y, p2.y) * scaleY + 30;
      boxX = minX;
      boxY = minY;
      boxW = maxX - minX;
      boxH = maxY - minY;

      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.fillRect(boxX, boxY, boxW, boxH);
    }

    // Draw barcode pill label above box
    if (detection.rawValue) {
      const labelText = `${detection.format}: ${detection.rawValue}`;
      ctx.font = 'bold 12px monospace';
      const textMetrics = ctx.measureText(labelText);
      const padding = 6;
      const pillWidth = textMetrics.width + padding * 2;
      const pillHeight = 22;
      const pillX = Math.max(8, Math.min(canvas.width - pillWidth - 8, boxX));
      const pillY = Math.max(26, boxY - 8);

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY - pillHeight, pillWidth, pillHeight, 6);
      ctx.fill();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.fillText(labelText, pillX + padding, pillY - 7);
    }

    ctx.restore();
  }, []);

  // Initialize Native BarcodeDetector once
  useEffect(() => {
    getSupportedNativeDetector().then((detector) => {
      nativeDetectorRef.current = detector;
    });
  }, []);

  // Start Camera Stream (Requirement 1, 14, 16)
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsPermissionDenied(false);

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Webcam API is not supported in this browser. Please use photo upload or manual entry.');
      setCameraActive(false);
      return;
    }

    try {
      // First attempt: Prefer environment (back) camera on mobile, 1280x720 ideal for crisp barcode lines
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (err1) {
        // Fallback for laptop webcams / external USB webcams that reject 'environment' facingMode
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      setCameraError(null);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setIsPermissionDenied(true);
        setCameraError('Camera access was denied. Please allow camera permissions in your browser bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can take photos or enter barcodes manually below.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is currently in use by another program. Please close other camera apps and retry.');
      } else {
        setCameraError('Unable to open camera stream. Please use photo capture or manual entry below.');
      }
      setCameraActive(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanLoopTimerRef.current) {
      window.clearInterval(scanLoopTimerRef.current);
      scanLoopTimerRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Start camera on mount if active (Requirement 1: Open Scanner -> Camera starts)
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Continuous Barcode Detection Loop (Requirement 2 & 5: Automatically detect without requiring photo)
  useEffect(() => {
    if (!cameraActive || isModalOpen) {
      if (scanLoopTimerRef.current) {
        window.clearInterval(scanLoopTimerRef.current);
        scanLoopTimerRef.current = null;
      }
      return;
    }

    let isScanning = false;

    // Run frame detection every 120ms (smooth, responsive, battery friendly)
    scanLoopTimerRef.current = window.setInterval(async () => {
      if (isScanning || isModalOpen) return;
      const video = videoRef.current;
      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

      isScanning = true;
      try {
        const detection = await detectBarcodeInVideoFrame(
          video,
          nativeDetectorRef.current,
          offscreenCanvasRef.current
        );

        if (detection && detection.rawValue) {
          const code = detection.rawValue.trim();
          const now = Date.now();

          // Debounce: prevent duplicate scan within 2.5 seconds (Requirement 13)
          if (code !== lastScannedCodeRef.current || now - lastScannedTimeRef.current > 2500) {
            lastScannedCodeRef.current = code;
            lastScannedTimeRef.current = now;

            // Draw glowing overlay around detected barcode (Requirement 4)
            drawBarcodeBoxOverlay(detection);

            // Audio beep and trigger scan action in App
            setScanStatusMessage(`Barcode detected: ${code} (${detection.format})`);
            onScanBarcode(code);

            // Clear visual highlight after 2.5s
            if (detectedHighlightTimerRef.current) {
              window.clearTimeout(detectedHighlightTimerRef.current);
            }
            detectedHighlightTimerRef.current = window.setTimeout(() => {
              drawBarcodeBoxOverlay(null);
              setScanStatusMessage(null);
            }, 2500);
          }
        } else {
          // If no detection in current frame and no recent highlight, clear overlay
          if (Date.now() - lastScannedTimeRef.current > 1500) {
            drawBarcodeBoxOverlay(null);
          }
        }
      } catch (err) {
        // Continue loop
      } finally {
        isScanning = false;
      }
    }, 120);

    return () => {
      if (scanLoopTimerRef.current) {
        window.clearInterval(scanLoopTimerRef.current);
        scanLoopTimerRef.current = null;
      }
    };
  }, [cameraActive, isModalOpen, onScanBarcode, drawBarcodeBoxOverlay]);

  // Handle Photo Barcode Capture & Upload (Requirement 15: Keep photo and manual working)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setScanStatusMessage('Analyzing picture for barcode...');

    try {
      const detectedCode = await scanBarcodeFromImage(file);
      if (detectedCode) {
        setScanStatusMessage(`Found barcode: ${detectedCode}`);
        onScanBarcode(detectedCode);
      } else {
        setScanStatusMessage(
          'No barcode detected in photo. Make sure the barcode is in focus and well lit, or enter it manually below.'
        );
      }
    } catch (err) {
      console.error('Image scan error:', err);
      setScanStatusMessage('Error analyzing image. Please try again or type the barcode manually.');
    } finally {
      setIsProcessingImage(false);
      e.target.value = '';
      setTimeout(() => {
        setScanStatusMessage((prev) => (prev?.startsWith('Found') ? null : prev));
      }, 4000);
    }
  };

  // Capture current video frame manually
  const handleCaptureVideoFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    setIsProcessingImage(true);
    setScanStatusMessage('Scanning current camera frame...');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const detectedCode = await scanBarcodeFromImage(blob);
            if (detectedCode) {
              setScanStatusMessage(`Found barcode: ${detectedCode}`);
              onScanBarcode(detectedCode);
            } else {
              setScanStatusMessage('No barcode detected in frame. Hold the barcode steady inside the reticle.');
            }
          }
          setIsProcessingImage(false);
        }, 'image/jpeg', 0.95);
      } else {
        setIsProcessingImage(false);
      }
    } catch {
      setIsProcessingImage(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScanBarcode(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 animate-fade-in">
      {/* Hidden File Inputs for Photo Capture & Gallery Upload */}
      <input
        ref={cameraFileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageFileChange}
      />
      <input
        ref={galleryFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Banner / Store Info */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 mb-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-emerald-950">Self-Checkout Enabled</h2>
            <p className="text-[11px] text-emerald-700">Point at item barcode to scan live</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Cart Count
          </span>
          <span
            className={`text-xs font-extrabold px-2 py-0.5 rounded-full inline-block ${
              cartCount >= 18
                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                : 'bg-emerald-200 text-emerald-900'
            }`}
          >
            {cartCount} / 20 Max
          </span>
        </div>
      </div>

      {/* Camera Viewfinder with Live Detection & Canvas Overlay */}
      <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-3xl overflow-hidden shadow-xl border-4 border-slate-900 flex flex-col items-center justify-center">
        {/* Live Camera Video Feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            cameraActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Barcode Detection Box Overlay Canvas (Requirement 4) */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        />

        {/* Viewfinder Target Reticle */}
        <div className="w-4/5 h-3/5 border-2 border-dashed border-emerald-400/80 rounded-2xl relative flex items-center justify-center z-10 pointer-events-none">
          <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400"></div>
          <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400"></div>
          <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400"></div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400"></div>

          {/* Animated Scanning Laser */}
          <div className="scanner-laser absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>

          <div className="text-center px-4">
            <span className="text-[11px] font-semibold text-emerald-300/90 bg-slate-900/85 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-xs shadow-sm">
              {isProcessingImage
                ? 'Decoding Barcode...'
                : cameraActive
                ? 'Align barcode inside target'
                : 'Camera Paused'}
            </span>
          </div>
        </div>

        {/* Action Controls in Viewfinder */}
        <div className="absolute top-2.5 right-3 z-30 flex items-center gap-1.5">
          {cameraActive && (
            <button
              type="button"
              onClick={handleCaptureVideoFrame}
              title="Force scan current frame"
              className="flex items-center gap-1 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded-full shadow-md active:scale-95 transition"
            >
              <Scan className="w-3 h-3" />
              <span>Scan Frame</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (cameraActive) {
                stopCamera();
              } else {
                startCamera();
              }
            }}
            title={cameraActive ? 'Turn off Camera' : 'Turn on Live Camera Scanner'}
            className="flex items-center gap-1 text-[10px] bg-slate-900/90 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 transition"
          >
            {cameraActive ? (
              <>
                <VideoOff className="w-3 h-3 text-rose-400" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Video className="w-3 h-3 text-emerald-400" />
                <span>Start Cam</span>
              </>
            )}
          </button>
        </div>

        {/* Loading Overlay */}
        {isProcessingImage && (
          <div className="absolute inset-0 bg-slate-950/80 z-40 flex flex-col items-center justify-center text-white">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
            <p className="text-xs font-bold text-emerald-300">Analyzing Barcode...</p>
          </div>
        )}

        {/* Camera Status Footer inside Viewfinder */}
        <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400 z-10">
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                cameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            ></span>
            {cameraActive ? 'Live Optical Scanner Active' : 'Camera Inactive'}
          </span>
          <span className="mono text-slate-400 text-[10px]">EAN-13 · UPC · Code 128</span>
        </div>
      </div>

      {/* Permission Denied or Camera Error Card (Requirement 14 & 15) */}
      {cameraError && (
        <div className="mt-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">{cameraError}</p>
              {isPermissionDenied && (
                <p className="text-[11px] text-amber-700 mt-1">
                  Click the lock or camera icon in your browser URL bar and select <strong>Allow</strong> for Camera, then click Retry.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={startCamera}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* Photo Barcode Action Buttons (Requirement 15) */}
      <div className="grid grid-cols-2 gap-2 mt-2.5">
        <button
          type="button"
          onClick={() => cameraFileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white py-2.5 px-3 rounded-xl border border-slate-700 text-xs font-bold transition shadow-xs"
        >
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>Take Photo to Scan</span>
        </button>

        <button
          type="button"
          onClick={() => galleryFileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-bold transition shadow-xs"
        >
          <ImageIcon className="w-4 h-4 text-amber-500" />
          <span>Upload Barcode Pic</span>
        </button>
      </div>

      {/* Status or Result Message Banner */}
      {scanStatusMessage && (
        <div className="mt-2 p-2.5 bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-medium shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="flex-1">{scanStatusMessage}</span>
        </div>
      )}

      {/* Manual Barcode Input Fallback (Requirement 9 & 15) */}
      <div className="mt-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          <input
            ref={manualInputRef}
            type="text"
            placeholder="Or enter 13-digit Barcode manually..."
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 mono"
          />
          <button
            type="submit"
            className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition hover:bg-emerald-700"
          >
            Lookup
          </button>
        </form>
      </div>

      {/* Catalog items list under scanner */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-amber-500">⚡</span>
            <span>Store Products by Category ({filteredProducts.length})</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Tap any item to test scan</span>
        </div>

        {/* Category Pill Filters */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* All Products Under Scanner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-2.5 border border-slate-200 hover:border-emerald-500 shadow-xs transition group flex items-center justify-between gap-2.5"
            >
              <div
                onClick={() => onScanBarcode(p.barcode)}
                className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60 inline-block">
                      {p.category}
                    </span>
                    {p.brand && (
                      <span className="text-[9px] font-bold text-slate-500">
                        · {p.brand}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-slate-400" />
                    <span>{p.aisle}</span>
                    <span>·</span>
                    <span className="truncate">{p.shelf}</span>
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xs font-black text-slate-900">₹{p.price}</span>
                    {p.mrp > p.price && (
                      <span className="text-[10px] text-slate-400 line-through">₹{p.mrp}</span>
                    )}
                    <span className="mono text-[9px] text-slate-400 bg-slate-100 px-1 rounded">
                      {p.barcode.slice(-5)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1 items-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onScanBarcode(p.barcode)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-xs transition active:scale-90 flex items-center gap-1"
                  title="Simulate scanning this barcode"
                >
                  <Scan className="w-3 h-3" />
                  <span>Scan</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddToCart(p, 1)}
                  className="text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 transition"
                  title="Quick add to cart"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
