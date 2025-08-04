'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Video, 
  Music,
  FileText,
  Archive,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
  preview?: string;
}

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onUpload?: (files: FileUploadItem[]) => Promise<void>;
  onRemove?: (fileId: string) => void;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  allowedTypes?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = "*/*",
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  onUpload,
  onRemove,
  className = "",
  disabled = false,
  showPreview = true,
  allowedTypes = []
}) => {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf') || extension === 'pdf') return FileText;
    if (type.includes('zip') || type.includes('rar') || extension === 'zip' || extension === 'rar') return Archive;
    
    return File;
  };

  const getFileIconColor = (file: File) => {
    const type = file.type.toLowerCase();
    
    if (type.startsWith('image/')) return 'text-green-400';
    if (type.startsWith('video/')) return 'text-red-400';
    if (type.startsWith('audio/')) return 'text-purple-400';
    if (type.includes('pdf')) return 'text-red-500';
    if (type.includes('zip') || type.includes('rar')) return 'text-amber-400';
    
    return 'text-blue-400';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }

    // Check allowed types
    if (allowedTypes.length > 0) {
      const fileType = file.type.toLowerCase();
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      const isAllowed = allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.substring(1);
        }
        return fileType.startsWith(type);
      });

      if (!isAllowed) {
        return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
      }
    }

    return null;
  };

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const handleFiles = useCallback(async (newFiles: File[]) => {
    if (disabled) return;

    // Check max files limit
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: FileUploadItem[] = [];

    for (const file of newFiles) {
      const error = validateFile(file);
      
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      // Check for duplicates
      const isDuplicate = files.some(existingFile => 
        existingFile.file.name === file.name && 
        existingFile.file.size === file.size
      );

      if (isDuplicate) {
        toast.error(`${file.name} is already selected`);
        continue;
      }

      const preview = await createFilePreview(file);

      validFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        progress: 0,
        status: 'pending',
        preview
      });
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file${validFiles.length > 1 ? 's' : ''} added`);
    }
  }, [files, maxFiles, maxSize, allowedTypes, disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    onRemove?.(fileId);
  }, [onRemove]);

  const uploadFiles = useCallback(async () => {
    if (!onUpload || files.length === 0) return;

    setIsUploading(true);
    
    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));

      // Simulate upload progress
      const uploadPromises = files.map(async (fileItem) => {
        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, progress } : f
          ));
        }

        // Mark as completed
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'completed' as const, progress: 100 }
            : f
        ));
      });

      await Promise.all(uploadPromises);
      await onUpload(files);

      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const, 
        error: 'Upload failed' 
      })));
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [files, onUpload]);

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const hasFiles = files.length > 0;
  const canUpload = hasFiles && !isUploading && files.some(f => f.status === 'pending');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <motion.div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-primary bg-primary/10' 
            : 'border-dark-border hover:border-dark-border-hover'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isDragOver ? 1.1 : 1 }}
          className={`mx-auto mb-4 p-3 rounded-full ${
            isDragOver ? 'bg-primary/20' : 'bg-dark-lighter'
          }`}
        >
          <Upload className={`h-8 w-8 ${isDragOver ? 'text-primary' : 'text-white/60'}`} />
        </motion.div>

        <h3 className="text-lg font-semibold text-white mb-2">
          {isDragOver ? 'Drop files here' : 'Upload Files'}
        </h3>
        
        <p className="text-white/60 mb-4">
          Drag and drop files here, or click to browse
        </p>

        <div className="text-sm text-white/50">
          <p>Maximum file size: {formatFileSize(maxSize)}</p>
          <p>Maximum files: {maxFiles}</p>
          {allowedTypes.length > 0 && (
            <p>Allowed types: {allowedTypes.join(', ')}</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {hasFiles && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white">
                Selected Files ({files.length})
              </h4>
              
              {canUpload && (
                <motion.button
                  onClick={uploadFiles}
                  disabled={isUploading}
                  className="btn btn-primary btn-sm inline-flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload All
                    </>
                  )}
                </motion.button>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((fileItem) => {
                const FileIcon = getFileIcon(fileItem.file);
                const iconColor = getFileIconColor(fileItem.file);

                return (
                  <motion.div
                    key={fileItem.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-3 bg-dark-lighter rounded-lg"
                  >
                    {/* File Icon/Preview */}
                    <div className="flex-shrink-0">
                      {showPreview && fileItem.preview ? (
                        <div className="w-10 h-10 rounded overflow-hidden bg-dark">
                          <img
                            src={fileItem.preview}
                            alt={fileItem.file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`p-2 rounded ${iconColor}`}>
                          <FileIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {fileItem.file.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <span>{formatFileSize(fileItem.file.size)}</span>
                        <span>•</span>
                        <span className={`inline-flex items-center gap-1 ${
                          fileItem.status === 'completed' ? 'text-green-400' :
                          fileItem.status === 'error' ? 'text-red-400' :
                          fileItem.status === 'uploading' ? 'text-blue-400' :
                          'text-white/60'
                        }`}>
                          {fileItem.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                          {fileItem.status === 'error' && <AlertTriangle className="h-3 w-3" />}
                          {fileItem.status === 'uploading' && <Loader2 className="h-3 w-3 animate-spin" />}
                          {fileItem.status}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      {fileItem.status === 'uploading' && (
                        <div className="mt-2 w-full bg-dark-border rounded-full h-1">
                          <motion.div
                            className="bg-primary h-1 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${fileItem.progress}%` }}
                          />
                        </div>
                      )}

                      {/* Error Message */}
                      {fileItem.error && (
                        <p className="mt-1 text-red-400 text-xs">{fileItem.error}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {fileItem.status === 'completed' && fileItem.url && (
                        <>
                          <button
                            className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => removeFile(fileItem.id)}
                        className="p-1 text-white/60 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;