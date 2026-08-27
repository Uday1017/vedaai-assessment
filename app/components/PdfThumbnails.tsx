"use client";

import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

type PdfThumbnailsProps = {
  file: File | null;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

export default function PdfThumbnails({
  file,
  totalPages,
  currentPage,
  onPageChange,
}: PdfThumbnailsProps) {
  return (
    <div className="pdf-thumbnails">
      {Array.from({ length: totalPages }, (_, index) => (
        <Thumbnail
          key={index + 1}
          file={file}
          pageNumber={index + 1}
          selected={currentPage === index + 1}
          onClick={() => onPageChange(index + 1)}
        />
      ))}
    </div>
  );
}

function Thumbnail({
  file,
  pageNumber,
  selected,
  onClick,
}: {
  file: File | null;
  pageNumber: number;
  selected: boolean;
  onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderThumbnail() {
      if (!file || !canvasRef.current) return;

      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;

      const page = await pdf.getPage(pageNumber);

      const viewport = page.getViewport({
        scale: 0.18,
      });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context || cancelled) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        canvas: canvas,
        viewport,
      }).promise;
    }

    renderThumbnail();

    return () => {
      cancelled = true;
    };
  }, [file, pageNumber]);

  return (
    <button
      className={`pdf-thumbnail ${
        selected ? "selected" : ""
      }`}
      onClick={onClick}
    >
      <canvas ref={canvasRef} />

      <span>{pageNumber}</span>
    </button>
  );
}
