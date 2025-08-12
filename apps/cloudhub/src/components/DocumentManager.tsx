'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@cloudreno/ui';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  url?: string;
}

interface DocumentManagerProps {
  documents: Document[];
  onUpload: (file: File) => void;
  onDownload: (document: Document) => void;
  onShare: (document: Document) => void;
  onDelete?: (documentId: string) => void;
}

export default function DocumentManager({
  documents,
  onUpload,
  onDownload,
  onShare,
  onDelete
}: DocumentManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('pdf')) return '📄';
    if (lowerType.includes('image') || lowerType.includes('jpg') || lowerType.includes('png')) return '🖼️';
    if (lowerType.includes('excel') || lowerType.includes('spreadsheet')) return '📊';
    if (lowerType.includes('word') || lowerType.includes('doc')) return '📝';
    if (lowerType.includes('cad') || lowerType.includes('dwg')) return '📐';
    if (lowerType.includes('zip') || lowerType.includes('archive')) return '🗜️';
    return '📁';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-coral bg-coral/5' 
            : 'border-border bg-muted/50 hover:border-coral/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-4xl mb-4">📁</div>
        <h3 className="text-lg font-medium text-navy mb-2">
          Upload Project Documents
        </h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop files here or click to browse
        </p>
        <Button 
          variant="coral" 
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Choose Files'}
        </Button>
        <input
          ref={fileRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.jpg,.jpeg,.png,.zip,.rar"
        />
      </div>

      {/* File Format Guide */}
      <div className="bg-navy/5 border border-navy/20 rounded-lg p-4 [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
        <h4 className="font-medium text-navy mb-2">Supported File Types:</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <div><strong>Documents:</strong> PDF, DOC, DOCX, XLS, XLSX</div>
          <div><strong>CAD Files:</strong> DWG, DXF</div>
          <div><strong>Images:</strong> JPG, PNG, JPEG</div>
          <div><strong>Archives:</strong> ZIP, RAR</div>
          <div className="text-xs mt-2">Maximum file size: 25 MB per file</div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        <h4 className="font-medium text-navy">Project Documents ({documents.length})</h4>
        
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📂</div>
            <p>No documents uploaded yet</p>
            <p className="text-sm">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-lg">
                    {getFileIcon(doc.type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.size} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()} by {doc.uploadedBy}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDownload(doc)}
                  >
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onShare(doc)}
                  >
                    Share
                  </Button>
                  {onDelete && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDelete(doc.id)}
                      className="text-coral border-coral hover:bg-coral/10"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}