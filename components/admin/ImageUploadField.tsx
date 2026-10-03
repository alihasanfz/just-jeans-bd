'use client';

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Loader2, Check, Link as LinkIcon, Laptop } from 'lucide-react';
import { compressImageFile } from '@/lib/utils/db';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helpText?: string;
  placeholder?: string;
  aspect?: 'landscape' | 'portrait' | 'square';
  className?: string;
}

export default function ImageUploadField({
  value,
  onChange,
  label,
  helpText,
  placeholder = 'https://...',
  aspect = 'landscape',
  className = '',
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP, etc.)');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      // 1. Try uploading to /api/upload
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            onChange(data.url);
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
            setIsUploading(false);
            return;
          }
        }
      } catch (e) {
        // server upload unavailable, fallback to compressed image
      }

      // 2. High-performance compressed image fallback
      const compressed = await compressImageFile(file, 900, 1200, 0.78);
      if (compressed) {
        onChange(compressed);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
      setIsUploading(false);
    } catch (err) {
      console.error('File upload error:', err);
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // reset input so same file can be selected again
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-slate-300 font-bold uppercase text-[11px] tracking-wider">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'Hide URL' : 'Paste Web URL'}</span>
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main Upload Box */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-2xl border transition-all p-3 bg-slate-900/70 ${
          isDragging
            ? 'border-blue-500 bg-blue-950/30 ring-2 ring-blue-500/20'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Image Preview Thumbnail */}
          <div
            className={`relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0 flex items-center justify-center ${
              aspect === 'portrait'
                ? 'w-16 h-20'
                : aspect === 'square'
                ? 'w-16 h-16'
                : 'w-24 h-16'
            }`}
            style={{
              width: aspect === 'portrait' ? '64px' : aspect === 'square' ? '64px' : '96px',
              height: aspect === 'portrait' ? '80px' : '64px',
              minWidth: aspect === 'portrait' ? '64px' : aspect === 'square' ? '64px' : '96px',
            }}
          >
            {value ? (
              <img
                src={value}
                alt="Selected"
                className="w-full h-full object-cover"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-slate-600" />
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Controls: Upload Button & Status */}
          <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-95"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Laptop className="w-3.5 h-3.5 text-blue-200" />
                    <span>Upload from Computer</span>
                  </>
                )}
              </button>

              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="text-slate-400 hover:text-red-400 p-2 rounded-xl hover:bg-slate-800 transition-colors text-xs font-bold flex items-center gap-1"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove Photo</span>
                </button>
              )}

              {uploadSuccess && (
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg animate-fade-in border border-emerald-500/20">
                  <Check className="w-3 h-3" />
                  <span>Uploaded successfully!</span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              Select or drag & drop any JPG, PNG, or WebP image from your computer.
            </p>
          </div>
        </div>

        {/* Optional Web URL Input */}
        {showUrlInput && (
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 animate-fade-in">
            <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs font-mono"
            />
          </div>
        )}
      </div>

      {helpText && <p className="text-[10px] text-slate-500">{helpText}</p>}
    </div>
  );
}
