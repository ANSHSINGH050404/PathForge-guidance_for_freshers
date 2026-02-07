"use client";

import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";

interface SkillUploaderProps {
  setSkills: (skills: string[]) => void;
}

export default function SkillUploader({ setSkills }: SkillUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const text = await file.text();
      const skillsArray = text.split(",").map((skill) => skill.trim());
      setSkills(skillsArray);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to read skills from file";
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
        dragActive
          ? "border-white/40 bg-white/5"
          : "border-white/10 hover:border-white/20"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt, .csv"
        className="hidden"
      />
      {isUploading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-neutral-400 animate-spin" />
          <p className="text-neutral-400 font-mono">Analyzing your skills...</p>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
            <Upload className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-white text-lg mb-2">
            Drag and drop your skills here, or{" "}
            <button
              onClick={handleUploadClick}
              className="text-white underline underline-offset-4 hover:text-neutral-300"
            >
              browse
            </button>
          </p>
          <p className="text-neutral-500 text-sm font-mono">
            Supports text files or manual entry
          </p>
        </>
      )}
    </div>
  );
}
