"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

export type Highlight = {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
};

type PdfViewerProps = {
  file: File | null;
  pageNumber: number;
  zoom: number;
  highlights?: Highlight[];
  onPageCount?: (count: number) => void;
};

export default function PdfViewer({
  file,
  pageNumber,
  zoom,
  highlights = [],
  onPageCount,
}: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function renderPage() {
      if (!file || !canvasRef.current) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const arrayBuffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
        }).promise;

        if (cancelled) {
          return;
        }

        onPageCount?.(pdf.numPages);

        if (pageNumber < 1 || pageNumber > pdf.numPages) {
          throw new Error("Invalid page number");
        }

        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({
          scale: zoom,
        });

        const canvas = canvasRef.current;

        if (!canvas) {
          return;
        }

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not create canvas context");
        }

        const devicePixelRatio = window.devicePixelRatio || 1;

        /*
         * High-resolution canvas for Retina/HiDPI displays.
         */
        canvas.width = Math.floor(viewport.width * devicePixelRatio);

        canvas.height = Math.floor(viewport.height * devicePixelRatio);

        /*
         * CSS dimensions represent the actual visible
         * PDF page size.
         */
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        /*
         * Reset the canvas transformation before rendering.
         */
        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

        /*
         * Render the PDF page.
         */
        await page.render({
          canvasContext: context,
          canvas,
          viewport,
        }).promise;

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        console.error("PDF render error:", err);

        if (!cancelled) {
          setError("Unable to render this PDF.");
          setLoading(false);
        }
      }
    }

    renderPage();

    return () => {
      cancelled = true;
    };
  }, [file, pageNumber, zoom, onPageCount]);

  return (
    <div className="pdf-render-area">
      {loading && <div className="pdf-loading">Loading page...</div>}

      {error && <div className="pdf-error">{error}</div>}

      <div
        className="pdf-page-wrapper"
        style={{
          position: "relative",
          display: "inline-block",
        }}
      >
        <canvas ref={canvasRef} />

        {/*
         * Gemini coordinates:
         *
         * x       = 0 - 1000
         * y       = 0 - 1000
         * width   = 0 - 1000
         * height  = 0 - 1000
         *
         * Converting them to percentages means the
         * highlight automatically follows the PDF
         * page when zoom changes.
         */}

        {highlights.map((highlight, index) => {
          const left = `${highlight.x / 10}%`;
          const top = `${highlight.y / 10}%`;
          const width = `${highlight.width / 10}%`;
          const height = `${highlight.height / 10}%`;

          return (
            <div
              key={`${highlight.label ?? "highlight"}-${index}`}
              className="pdf-highlight"
              style={{
                position: "absolute",
                left,
                top,
                width,
                height,
                pointerEvents: "none",
                boxSizing: "border-box",
              }}
            >
              {highlight.label && (
                <span className="pdf-highlight-label">{highlight.label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
