import React, { useState, useRef } from 'react';
import { UploadCloud, X, Star, AlertCircle, Loader2 } from 'lucide-react';
import { ProductImage } from '@/types/product';
import { uploadToCloudinary } from '@/services/cloudinary/cloudinaryService';
import { useToast } from '@/contexts/ToastContext';

interface CloudinaryImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  folder?: string;
  maxImages?: number;
}

export const CloudinaryImageUploader: React.FC<CloudinaryImageUploaderProps> = ({
  images,
  onChange,
  folder = 'products',
  maxImages = 6,
}) => {
  const { error, success } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      error('Limit Exceeded', `You can upload up to ${maxImages} images per product.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const newUploadedImages: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const result = await uploadToCloudinary(file, folder, (percent) => {
          setUploadProgress(percent);
        });

        newUploadedImages.push({
          url: result.secure_url || result.url,
          publicId: result.public_id,
          altText: file.name.replace(/\.[^/.]+$/, ''),
          isPrimary: images.length === 0 && newUploadedImages.length === 0, // first image is primary
        });
      } catch (err: any) {
        error('Upload Failed', `Failed to upload "${file.name}": ${err.message}`);
      }
    }

    if (newUploadedImages.length > 0) {
      const updated = [...images, ...newUploadedImages];
      // Ensure at least one primary
      if (!updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      onChange(updated);
      success('Images Uploaded', `Successfully uploaded ${newUploadedImages.length} image(s).`);
    }

    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (images[index].isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!isUploading) handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isUploading
            ? 'border-blue-400 bg-blue-50/50 cursor-wait'
            : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <div className="space-y-1 w-full max-w-xs">
              <p className="text-xs font-bold text-slate-900">
                Uploading to Cloudinary ({uploadProgress}%)...
              </p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">
                Click to browse or drag and drop product photos
              </p>
              <p className="text-[11px] text-slate-500">
                Supports JPG, PNG, WEBP, AVIF up to 8MB • Max {maxImages} images
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview List */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className={`relative group rounded-2xl overflow-hidden border-2 bg-slate-100 aspect-square shadow-subtle ${
                img.isPrimary ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'
              }`}
            >
              <img
                src={img.url}
                alt={img.altText || `Product Image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Badges & Actions Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    title={img.isPrimary ? 'Primary Image' : 'Set as Primary'}
                    className={`p-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm transition-colors ${
                      img.isPrimary
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-white/80 hover:bg-white text-slate-700'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${img.isPrimary ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    title="Remove image"
                    className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {img.isPrimary && (
                  <span className="self-start text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-md shadow-sm">
                    Primary Cover
                  </span>
                )}
              </div>

              {/* Permanent primary tag */}
              {img.isPrimary && (
                <div className="absolute bottom-2 left-2 group-hover:hidden">
                  <span className="text-[10px] font-bold text-white bg-blue-600/90 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm">
                    Cover
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
