import { useRef, useEffect, useState } from "react";

interface PixelatedImageProps {
  src: string;
  compatibility: number; // 0-100
  revealLevel?: number; // 0-100 (from chat progress)
  className?: string;
  width?: number;
  height?: number;
}

export default function PixelatedImage({
  src,
  compatibility,
  revealLevel = 0,
  className = "",
  width = 400,
  height = 500,
}: PixelatedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
    };
    img.src = src;
  }, [src]);

  useEffect(() => {
    if (!imageLoaded || !imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imgRef.current;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Draw original image
    ctx.drawImage(img, 0, 0, width, height);

    // Calculate total reveal: combination of compatibility and chat reveal
    const totalReveal = Math.min(100, compatibility * 0.6 + revealLevel * 0.4);

    // Pixelation amount: lower totalReveal = more pixelated
    const maxPixelSize = 20;
    const minPixelSize = 1;
    const pixelSize = Math.max(minPixelSize, Math.round(maxPixelSize - (totalReveal / 100) * (maxPixelSize - minPixelSize)));

    if (pixelSize <= 1 && totalReveal >= 95) {
      // Fully revealed
      return;
    }

    // Get original image data
    const originalData = ctx.getImageData(0, 0, width, height);

    // Create pixelated version
    // Step 1: draw small then scale up for pixelation
    const smallW = Math.max(1, Math.floor(width / pixelSize));
    const smallH = Math.max(1, Math.floor(height / pixelSize));

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, smallW, smallH);
    ctx.drawImage(canvas, 0, 0, smallW, smallH, 0, 0, width, height);

    // Step 2: Create revealed sections based on compatibility
    // More compatibility = more revealed cells
    const gridCols = 8;
    const gridRows = 10;
    const cellW = width / gridCols;
    const cellH = height / gridRows;
    const totalCells = gridCols * gridRows;
    const revealedCellCount = Math.floor((totalReveal / 100) * totalCells);

    // Generate deterministic "random" reveal pattern based on compatibility
    // Use a seeded approach so the same image always reveals the same way
    const seed = src.length * 7 + compatibility;
    const cellOrder: number[] = [];
    for (let i = 0; i < totalCells; i++) cellOrder.push(i);

    // Seeded shuffle
    for (let i = cellOrder.length - 1; i > 0; i--) {
      const j = Math.abs(((seed * (i + 1) * 2654435761) >> 16) % (i + 1));
      [cellOrder[i], cellOrder[j]] = [cellOrder[j], cellOrder[i]];
    }

    // Prioritize face area (center-top) for later reveal
    // Sort so edges reveal first, face reveals last
    const centerCol = gridCols / 2;
    const faceRow = gridRows * 0.25;
    cellOrder.sort((a, b) => {
      const aCol = a % gridCols;
      const aRow = Math.floor(a / gridCols);
      const bCol = b % gridCols;
      const bRow = Math.floor(b / gridCols);

      const aDist = Math.sqrt((aCol - centerCol) ** 2 + (aRow - faceRow) ** 2);
      const bDist = Math.sqrt((bCol - centerCol) ** 2 + (bRow - faceRow) ** 2);

      // Edges first (higher distance = revealed first)
      return bDist - aDist;
    });

    // Draw revealed cells with original image data
    const revealedSet = new Set(cellOrder.slice(0, revealedCellCount));

    // Put original pixels back for revealed cells
    const pixelatedData = ctx.getImageData(0, 0, width, height);

    for (const cellIndex of revealedSet) {
      const col = cellIndex % gridCols;
      const row = Math.floor(cellIndex / gridCols);
      const startX = Math.floor(col * cellW);
      const startY = Math.floor(row * cellH);
      const endX = Math.min(width, Math.floor(startX + cellW));
      const endY = Math.min(height, Math.floor(startY + cellH));

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * width + x) * 4;
          pixelatedData.data[idx] = originalData.data[idx];
          pixelatedData.data[idx + 1] = originalData.data[idx + 1];
          pixelatedData.data[idx + 2] = originalData.data[idx + 2];
          pixelatedData.data[idx + 3] = originalData.data[idx + 3];
        }
      }
    }

    ctx.putImageData(pixelatedData, 0, 0);

    // Add subtle grid lines on pixelated cells for mosaic feel
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < totalCells; i++) {
      if (revealedSet.has(i)) continue;
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      ctx.strokeRect(col * cellW, row * cellH, cellW, cellH);
    }
  }, [imageLoaded, compatibility, revealLevel, width, height, src]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}
