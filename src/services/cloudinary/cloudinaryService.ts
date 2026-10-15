const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'vulmora';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'vulmora_preset';

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'thumb' | 'scale' | 'pad';
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
}

/**
 * Transforms Cloudinary URLs for responsive, optimized delivery
 * Example: injects w_600,h_600,c_fill,q_auto,f_auto into /upload/
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageTransformOptions = {}
): string {
  if (!originalUrl) return '';

  // If not a Cloudinary URL, return as is
  if (!originalUrl.includes('cloudinary.com') || !originalUrl.includes('/upload/')) {
    return originalUrl;
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transforms: string[] = [`q_${quality}`, `f_${format}`];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop && (width || height)) transforms.push(`c_${crop}`);

  const transformString = transforms.join(',');

  // Replace /upload/ with /upload/{transforms}/
  return originalUrl.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Uploads an image file to Cloudinary with real-time upload progress tracking
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = 'products',
  onProgress?: (progressPercent: number) => void
): Promise<CloudinaryUploadResult> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Unsupported file format. Please upload JPG, PNG, WEBP, or AVIF.');
  }

  // Validate file size (max 8MB)
  const MAX_SIZE_BYTES = 8 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Image size exceeds 8MB limit. Please compress or select a smaller image.');
  }

  // If running in development without configured upload preset
  if (
    !import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
    !import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  ) {
    // Graceful fallback to client Object URL / Base64 for instant testing without setup friction
    return new Promise((resolve) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 25;
        if (onProgress) onProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            resolve({
              url: dataUrl,
              secure_url: dataUrl,
              public_id: `local_dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              format: file.type.split('/')[1] || 'png',
              width: 800,
              height: 800,
              bytes: file.size,
            });
          };
          reader.readAsDataURL(file);
        }
      }, 150);
    });
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', `vulmora_store/${folder}`);

  const uploadEndpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadEndpoint, true);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(
            new Error(
              errorResponse.error?.message ||
                `Cloudinary upload failed with status ${xhr.status}`
            )
          );
        } catch {
          reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during image upload to Cloudinary.'));
    };

    xhr.send(formData);
  });
}
