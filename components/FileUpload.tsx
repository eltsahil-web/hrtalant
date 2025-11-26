import React, { useRef } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { formatBytes } from '../utils';

interface FileUploadProps {
  label: string;
  subLabel?: string;
  accept: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  icon?: React.ReactNode;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  label, 
  subLabel, 
  accept, 
  file, 
  onFileSelect, 
  onClear,
  icon
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
        {label}
      </label>
      
      {!file ? (
        <div 
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 transition-all hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer group flex flex-col items-center justify-center text-center min-h-[140px]"
        >
          <input 
            type="file" 
            accept={accept} 
            ref={inputRef} 
            className="hidden" 
            onChange={handleChange}
          />
          <div className="bg-slate-100 p-3 rounded-full mb-3 group-hover:bg-blue-100 group-hover:text-blue-600 text-slate-500 transition-colors">
            {icon || <Upload size={24} />}
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Click to upload or drag & drop
          </p>
          {subLabel && (
            <p className="text-xs text-slate-500 mt-1">{subLabel}</p>
          )}
        </div>
      ) : (
        <div className="relative border border-slate-200 bg-white rounded-xl p-4 flex items-center shadow-sm">
          <div className="bg-blue-100 text-blue-600 p-2.5 rounded-lg mr-3">
            <FileText size={20} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-900 truncate pr-4">
              {file.name}
            </p>
            <p className="text-xs text-slate-500">
              {formatBytes(file.size)}
            </p>
          </div>
          <button 
            onClick={onClear}
            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
          <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-0.5 border-2 border-white">
            <CheckCircle size={12} fill="currentColor" className="text-white" />
          </div>
        </div>
      )}
    </div>
  );
};