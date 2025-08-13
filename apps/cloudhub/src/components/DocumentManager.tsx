'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@cloudreno/ui';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  category: 'contract' | 'permit' | 'plan' | 'specification' | 'correspondence' | 'other';
  upload_date: string;
  uploaded_by: string;
  file_url?: string;
  description?: string;
}

interface DocumentManagerProps {
  documents: Document[];
  onUpload: (file: File, category: string, description?: string) => void;
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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    category: 'other' as Document['category'],
    description: ''
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const categories = [
    { value: '', label: 'All Documents' },
    { value: 'contract', label: 'Contracts' },
    { value: 'permit', label: 'Permits' },
    { value: 'plan', label: 'Plans' },
    { value: 'specification', label: 'Specifications' },
    { value: 'correspondence', label: 'Correspondence' },
    { value: 'other', label: 'Other' }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadData(prev => ({ ...prev, file: e.dataTransfer.files[0] || null }));
      setShowUploadModal(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData(prev => ({ ...prev, file: e.target.files![0] || null }));
      setShowUploadModal(true);
    }
  };

  const handleUploadSubmit = () => {
    if (uploadData.file) {
      onUpload(uploadData.file, uploadData.category, uploadData.description);
      setShowUploadModal(false);
      setUploadData({ file: null, category: 'other', description: '' });
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('doc')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
    return '📎';
  };

  const getCategoryColor = (category: Document['category']) => {
    const colors = {
      contract: 'bg-coral/10 text-coral',
      permit: 'bg-navy/10 text-navy',
      plan: 'bg-blue-100 text-blue-800',
      specification: 'bg-green-100 text-green-800',
      correspondence: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const handleDelete = async (documentId: string) => {
    if (!onDelete) return;
    
    const confirmed = confirm('Are you sure you want to delete this document? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await onDelete(documentId);
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-space font-semibold text-lg text-navy">Documents</h3>
          <p className="text-sm text-muted-foreground">Manage project documents and files</p>
        </div>
        <Button 
          variant="coral" 
          onClick={() => fileRef.current?.click()}
          size="sm"
        >
          + Upload Document
        </Button>
        <input
          ref={fileRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.txt"
        />
      </div>

      {/* Filters */}
      <div className="bg-muted/50 p-4 rounded-lg [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Drop Zone */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-coral bg-coral/5' 
            : 'border-border bg-muted/20 hover:border-coral/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-4xl mb-2">📁</div>
        <p className="text-muted-foreground">
          Drag and drop files here or click the upload button above
        </p>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-muted-foreground">
            {documents.length === 0 ? 'No documents uploaded yet' : 'No documents match your search criteria'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map(doc => (
            <div 
              key={doc.id} 
              className="bg-card border border-border p-4 rounded-lg [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)] hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-2xl">{getFileIcon(doc.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-navy truncate">{doc.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(doc.category)}`}>
                        {doc.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>•</span>
                      <span>Uploaded by {doc.uploaded_by}</span>
                      <span>•</span>
                      <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                    </div>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]">
            <h3 className="font-space font-semibold text-lg text-navy mb-4">Upload Document</h3>
            
            {uploadData.file && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getFileIcon(uploadData.file.type)}</span>
                  <div>
                    <p className="font-medium">{uploadData.file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(uploadData.file.size)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Category</label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value as Document['category'] }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                >
                  <option value="contract">Contract</option>
                  <option value="permit">Permit</option>
                  <option value="plan">Plan</option>
                  <option value="specification">Specification</option>
                  <option value="correspondence">Correspondence</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-2">Description (Optional)</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this document..."
                  rows={3}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadData({ file: null, category: 'other', description: '' });
                  if (fileRef.current) {
                    fileRef.current.value = '';
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="coral"
                onClick={handleUploadSubmit}
                disabled={!uploadData.file}
              >
                Upload Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}