import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiService, UploadResponse } from '@/lib/api';

interface FileUploadProps {
  userID: string;
  onUploadSuccess: (result: UploadResponse) => void;
  onUploadError: (error: string) => void;
}

export function FileUpload({ userID, onUploadSuccess, onUploadError }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PDF or DOCX file only.';
    }
    if (file.size > maxSize) {
      return 'File size must be less than 10MB.';
    }
    return null;
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setError('');

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError('');

    try {
      const result = await apiService.uploadDocument(userID, selectedFile);
      onUploadSuccess(result);
      setSelectedFile(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to upload file. Please try again.';
      setError(errorMessage);
      onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Upload Business Document</h3>
            <p className="text-sm text-muted-foreground">
              Upload a PDF or DOCX file containing your business plan, financial statements, or pitch deck
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Drop your file here</p>
              <p className="text-sm text-muted-foreground mb-4">
                or{' '}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse to upload
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF and DOCX files up to 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1"
                >
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </Button>
                <Button
                  variant="outline"
                  onClick={removeFile}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
