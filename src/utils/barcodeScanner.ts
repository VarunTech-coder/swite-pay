import {
  MultiFormatReader,
  DecodeHintType,
  BarcodeFormat,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
  Result,
  ResultPoint
} from '@zxing/library';

export interface BarcodeDetectionResult {
  rawValue: string;
  format: string;
  cornerPoints?: Array<{ x: number; y: number }>;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

// Prepare ZXing MultiFormatReader with retail barcode formats
const zxingHints = new Map<DecodeHintType, any>();
zxingHints.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.ITF,
  BarcodeFormat.QR_CODE
]);
zxingHints.set(DecodeHintType.TRY_HARDER, true);

const zxingReader = new MultiFormatReader();
zxingReader.setHints(zxingHints);

// Format normalizer helper
export function normalizeBarcode(raw: string): string {
  return raw.trim();
}

/**
 * Check if the browser supports hardware-accelerated native BarcodeDetector
 */
export async function getSupportedNativeDetector(): Promise<any | null> {
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const formats: string[] = await (window as any).BarcodeDetector.getSupportedFormats();
      const desired = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code', 'itf'];
      const supported = desired.filter((f) => formats.includes(f));
      if (supported.length > 0) {
        return new (window as any).BarcodeDetector({ formats: supported });
      }
    } catch (e) {
      // Fallback to ZXing
    }
  }
  return null;
}

/**
 * Scan barcode from a canvas using ZXing
 */
function scanCanvasWithZxing(canvas: HTMLCanvasElement): BarcodeDetectionResult | null {
  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const luminanceSource = new RGBLuminanceSource(
      new Uint8ClampedArray(imageData.data.buffer),
      canvas.width,
      canvas.height
    );
    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
    const result: Result = zxingReader.decodeWithState(binaryBitmap);

    if (result && result.getText()) {
      const points = result.getResultPoints() || [];
      const cornerPoints = points.map((p: ResultPoint) => ({ x: p.getX(), y: p.getY() }));
      return {
        rawValue: result.getText().trim(),
        format: BarcodeFormat[result.getBarcodeFormat()] || 'BARCODE',
        cornerPoints
      };
    }
  } catch (err) {
    // NotFoundException is standard when no barcode is in frame
  } finally {
    try {
      zxingReader.reset();
    } catch {}
  }
  return null;
}

/**
 * Scan a single video frame using Native BarcodeDetector or ZXing
 */
export async function detectBarcodeInVideoFrame(
  video: HTMLVideoElement,
  nativeDetector: any | null,
  canvas: HTMLCanvasElement
): Promise<BarcodeDetectionResult | null> {
  if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return null;
  }

  const vWidth = video.videoWidth;
  const vHeight = video.videoHeight;
  if (!vWidth || !vHeight) return null;

  // 1. Try Native BarcodeDetector first (Ultra-fast C++ 60fps)
  if (nativeDetector) {
    try {
      const detected = await nativeDetector.detect(video);
      if (detected && detected.length > 0 && detected[0].rawValue) {
        const item = detected[0];
        return {
          rawValue: item.rawValue.trim(),
          format: item.format || 'EAN-13',
          cornerPoints: item.cornerPoints,
          boundingBox: item.boundingBox
            ? {
                x: item.boundingBox.x,
                y: item.boundingBox.y,
                width: item.boundingBox.width,
                height: item.boundingBox.height
              }
            : undefined
        };
      }
    } catch (err) {
      // Continue to ZXing fallback
    }
  }

  // 2. ZXing fallback with offscreen canvas
  try {
    // Keep canvas resolution optimal for barcode reading (~640-800px width)
    const targetWidth = Math.min(vWidth, 800);
    const targetHeight = Math.round((vHeight / vWidth) * targetWidth);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      const res = scanCanvasWithZxing(canvas);
      if (res) return res;

      // Center-crop pass for small or distant barcodes (zoom in on viewfinder center)
      const cropW = Math.round(targetWidth * 0.7);
      const cropH = Math.round(targetHeight * 0.5);
      const startX = Math.round((targetWidth - cropW) / 2);
      const startY = Math.round((targetHeight - cropH) / 2);

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cropW;
      cropCanvas.height = cropH;
      const cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
      if (cropCtx) {
        cropCtx.drawImage(canvas, startX, startY, cropW, cropH, 0, 0, cropW, cropH);
        const cropRes = scanCanvasWithZxing(cropCanvas);
        if (cropRes) {
          // Adjust corner points back to full canvas coords
          if (cropRes.cornerPoints) {
            cropRes.cornerPoints = cropRes.cornerPoints.map((p) => ({
              x: p.x + startX,
              y: p.y + startY
            }));
          }
          return cropRes;
        }
      }
    }
  } catch (err) {
    // Ignore frame read failures
  }

  return null;
}

/**
 * Scan barcode from an uploaded image File or Blob
 */
export async function scanBarcodeFromImage(file: File | Blob): Promise<string | null> {
  const objectUrl = URL.createObjectURL(file);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        // 1. Try Native BarcodeDetector
        const nativeDetector = await getSupportedNativeDetector();
        if (nativeDetector) {
          try {
            const detected = await nativeDetector.detect(img);
            if (detected && detected.length > 0 && detected[0].rawValue) {
              URL.revokeObjectURL(objectUrl);
              resolve(detected[0].rawValue.trim());
              return;
            }
          } catch (e) {}
        }

        // 2. Try ZXing
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const zxingRes = scanCanvasWithZxing(canvas);
          if (zxingRes && zxingRes.rawValue) {
            URL.revokeObjectURL(objectUrl);
            resolve(zxingRes.rawValue.trim());
            return;
          }
        }

        URL.revokeObjectURL(objectUrl);
        resolve(null);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };

    img.src = objectUrl;
  });
}
