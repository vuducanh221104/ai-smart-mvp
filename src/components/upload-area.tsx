"use client";

import type React from "react";
import { Upload } from "lucide-react";

interface UploadAreaProps {
  selectedFile: File | null;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onClick: () => void;
}

export function UploadArea({ selectedFile, onDrop, onDragOver, onClick }: UploadAreaProps) {
  return (
    <div className="upload-area" onDrop={onDrop} onDragOver={onDragOver} onClick={onClick}>
      <div className="upload-icon">
        <Upload size={32} />
      </div>
      <div className="upload-text">
        {selectedFile ? (
          <span className="file-selected">{selectedFile.name}</span>
        ) : (
          <>
            <span className="drag-text">Drag and drop your file here</span>
            <span className="or-text">or click to browse</span>
          </>
        )}
      </div>
    </div>
  );
}


