'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@cloudreno/ui';

interface Photo {
  id: string;
  url: string;
  name: string;
  description?: string;
  uploadDate: string;
  uploadedBy: string;
  category: 'before' | 'progress' | 'after' | 'other';
}

interface PhotoGalleryManagerProps {
  photos: Photo[];
  onUpload: (files: FileList, category: Photo['category']) => void;
  onDelete?: (photoId: string) => void;
  onUpdateDescription?: (photoId: string, description: string) => void;
}

export default function PhotoGalleryManager({
  photos,
  onUpload,
  onDelete,
  onUpdateDescription
}: PhotoGalleryManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Photo['category']>('progress');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filter, setFilter] = useState<Photo['category'] | 'all'>('all');
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      await onUpload(files, selectedCategory);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getCategoryIcon = (category: Photo['category']) => {
    switch (category) {
      case 'before': return '📷';
      case 'progress': return '🚧';
      case 'after': return '✨';
      case 'other': return '🖼️';
      default: return '📷';
    }
  };

  const getCategoryColor = (category: Photo['category']) => {
    switch (category) {
      case 'before': return 'bg-red-100 text-red-800';
      case 'progress': return 'bg-coral/20 text-coral';
      case 'after': return 'bg-green-100 text-green-800';
      case 'other': return 'bg-navy/20 text-navy';
      default: return 'bg-navy/20 text-navy';
    }
  };

  const filteredPhotos = filter === 'all' 
    ? photos 
    : photos.filter(photo => photo.category === filter);

  const photosByCategory = photos.reduce((acc, photo) => {
    acc[photo.category] = (acc[photo.category] || 0) + 1;
    return acc;
  }, {} as Record<Photo['category'], number>);

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
        <div className="text-4xl mb-4">📷</div>
        <h3 className="text-lg font-medium text-navy mb-2">
          Upload Project Photos
        </h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop photos here or click to browse
        </p>
        
        {/* Category Selection */}
        <div className="flex gap-2 justify-center mb-4">
          {(['before', 'progress', 'after', 'other'] as Photo['category'][]).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedCategory === category 
                  ? getCategoryColor(category)
                  : 'bg-muted text-muted-foreground hover:bg-coral/10'
              }`}
            >
              {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <Button 
          variant="coral" 
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Choose Photos'}
        </Button>
        <input
          ref={fileRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-muted/50 p-3 rounded-lg text-center">
          <div className="text-2xl font-space font-semibold text-navy">{photos.length}</div>
          <div className="text-xs text-muted-foreground">Total Photos</div>
        </div>
        {(['before', 'progress', 'after', 'other'] as Photo['category'][]).map(category => (
          <div key={category} className="bg-muted/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-space font-semibold text-navy">
              {photosByCategory[category] || 0}
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {getCategoryIcon(category)} {category}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
            filter === 'all' 
              ? 'bg-navy/20 text-navy'
              : 'bg-muted text-muted-foreground hover:bg-navy/10'
          }`}
        >
          All Photos ({photos.length})
        </button>
        {(['before', 'progress', 'after', 'other'] as Photo['category'][]).map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
              filter === category 
                ? getCategoryColor(category)
                : 'bg-muted text-muted-foreground hover:bg-coral/10'
            }`}
          >
            {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)} ({photosByCategory[category] || 0})
          </button>
        ))}
      </div>

      {/* Photo Gallery */}
      <div className="space-y-3">
        <h4 className="font-medium text-navy">
          {filter === 'all' ? 'All Photos' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Photos`} 
          ({filteredPhotos.length})
        </h4>
        
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📷</div>
            <p>No photos uploaded yet</p>
            <p className="text-sm">Upload your first photo to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPhotos.map((photo) => (
              <div 
                key={photo.id} 
                className="group relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="w-full h-full bg-gradient-to-br from-coral/20 to-coral/40 flex items-center justify-center">
                  <span className="text-4xl">{getCategoryIcon(photo.category)}</span>
                </div>
                
                {/* Category Badge */}
                <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(photo.category)}`}>
                  {photo.category.toUpperCase()}
                </div>
                
                {/* Delete Button */}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(photo.id);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                )}
                
                {/* Photo Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                  <p className="text-xs font-medium truncate">{photo.name}</p>
                  <p className="text-xs opacity-80">
                    {new Date(photo.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="text-lg font-space font-semibold text-navy">{selectedPhoto.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Uploaded {new Date(selectedPhoto.uploadDate).toLocaleDateString()} by {selectedPhoto.uploadedBy}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedPhoto(null)}
              >
                Close
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Photo Display */}
              <div className="aspect-video bg-gradient-to-br from-coral/20 to-coral/40 rounded-lg flex items-center justify-center">
                <span className="text-8xl">{getCategoryIcon(selectedPhoto.category)}</span>
              </div>
              
              {/* Photo Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Category</label>
                  <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(selectedPhoto.category)}`}>
                    {getCategoryIcon(selectedPhoto.category)} {selectedPhoto.category.charAt(0).toUpperCase() + selectedPhoto.category.slice(1)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Upload Date</label>
                  <div className="text-sm">{new Date(selectedPhoto.uploadDate).toLocaleDateString()}</div>
                </div>
              </div>
              
              {/* Description */}
              {onUpdateDescription && (
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Description</label>
                  <textarea
                    value={selectedPhoto.description || ''}
                    onChange={(e) => onUpdateDescription(selectedPhoto.id, e.target.value)}
                    placeholder="Add a description for this photo..."
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-coral focus:border-coral"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}