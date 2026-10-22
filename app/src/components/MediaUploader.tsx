import React, { useRef, useState } from 'react';
import { UploadCloud, FileImage, FileVideo, X, CheckCircle, AlertCircle } from 'lucide-react';

export interface UploadedMedia {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  isVideo: boolean;
}

interface MediaUploaderProps {
  onMediaSelected: (media: UploadedMedia | null) => void;
  selectedMedia: UploadedMedia | null;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onMediaSelected,
  selectedMedia
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);

    // Limit size to 20MB for client base64 encoding
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('O arquivo excede o limite de 20MB. Por favor, envie uma versão mais leve.');
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setErrorMsg('Formato não suportado. Envie imagens (JPG, PNG, WebP) ou vídeos (MP4, MOV).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1] || '';
      const previewUrl = URL.createObjectURL(file);

      onMediaSelected({
        file,
        previewUrl,
        base64: base64Data,
        mimeType: file.type,
        fileName: file.name,
        fileSize: file.size,
        isVideo
      });
    };

    reader.onerror = () => {
      setErrorMsg('Erro ao ler arquivo. Tente novamente.');
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedMedia?.previewUrl) {
      URL.revokeObjectURL(selectedMedia.previewUrl);
    }
    onMediaSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {!selectedMedia ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-950/40'
              : 'border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-slate-100/70 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-blue-500 dark:hover:bg-slate-800/40'
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 group-hover:scale-105 transition-transform dark:bg-slate-800 dark:ring-slate-700">
            <UploadCloud className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>

          <h4 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
            Arraste ou clique para enviar captura de tela, foto ou vídeo
          </h4>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Suporta JPG, PNG, WebP, MP4 e MOV (até 20MB)
          </p>

          <span className="mt-3 inline-block rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
            Selecionar arquivo
          </span>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            {/* Thumbnail Preview */}
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              {selectedMedia.isVideo ? (
                <video
                  src={selectedMedia.previewUrl}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={selectedMedia.previewUrl}
                  alt={selectedMedia.fileName}
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute bottom-1 right-1 rounded bg-black/70 p-1 text-white">
                {selectedMedia.isVideo ? (
                  <FileVideo className="h-3 w-3" />
                ) : (
                  <FileImage className="h-3 w-3" />
                )}
              </div>
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Arquivo pronto para análise</span>
              </div>
              <h5 className="mt-1 truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                {selectedMedia.fileName}
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatFileSize(selectedMedia.fileSize)} · {selectedMedia.mimeType}
              </p>
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remover arquivo"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-rose-950 dark:hover:text-rose-400 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
