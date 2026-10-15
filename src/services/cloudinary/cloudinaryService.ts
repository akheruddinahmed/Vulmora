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
 * Retrieves the currently active Cloudinary configuration,
 * checking runtime storage or environment variables.
 */
export function getCloudinaryCredentials(): { cloudName: string; uploadPreset: string } {
  let cloudName = '';
  let uploadPreset = '';

  if (typeof window !== 'undefined') {
    cloudName = localStorage.getItem('vulmora_cloudinary_cloud_name') || '';
    uploadPreset = localStorage.getItem('vulmora_cloudinary_preset') || '';
  }

  if (!cloudName) {
    cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
  }
  if (!uploadPreset) {
    uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
  }

  return { cloudName: cloudName.trim(), uploadPreset: uploadPreset.trim() };
}

/**
 * Persists runtime Cloudinary credentials in local browser storage
 */
export function setCloudinaryCredentials(cloudName: string, uploadPreset: string): void {
  if (typeof window !== 'undefined') {
    if (cloudName) {
      localStorage.setItem('vulmora_cloudinary_cloud_name', cloudName.trim());
    } else {
      localStorage.removeItem('vulmora_cloudinary_cloud_name');
    }

    if (uploadPreset) {
      localStorage.setItem('vulmora_cloudinary_preset', uploadPreset.trim());
    } else {
      localStorage.removeItem('vulmora_cloudinary_preset');
    }
  }
}

/**
 * Tests connection to Cloudinary with an unsigned upload preset
 */
export async function testCloudinaryConnection(
  cloudName: string,
  uploadPreset: string
): Promise<{ success: boolean; message: string }> {
  const cName = cloudName.trim();
  const preset = uploadPreset.trim();

  if (!cName || !preset) {
    return {
      success: false,
      message: 'Both Cloud Name and Unsigned Upload Preset are required to connect.',
    };
  }

  try {
    // 1x1 transparent GIF base64 test pixel
    const testDataUri = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    const formData = new FormData();
    formData.append('file', testDataUri);
    formData.append('upload_preset', preset);
    formData.append('folder', 'vulmora_store/test_connection');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (res.ok && data.secure_url) {
      return {
        success: true,
        message: `Cloudinary verified! Upload successful to cloud "${cName}".`,
      };
    } else {
      return {
        success: false,
        message:
          data.error?.message ||
          `Cloudinary rejected test upload (HTTP ${res.status}). Verify your Upload Preset is set to "Unsigned".`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error connecting to Cloudinary endpoint.',
    };
  }
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
  const { cloudName, uploadPreset } = getCloudinaryCredentials();

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Unsupported file format. Please upload JPG, PNG, WEBP, or AVIF.');
  }

  // Validate file size (max 10MB)
  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Image size exceeds 10MB limit. Please compress or select a smaller image.');
  }

  // Check if Cloudinary is configured
  if (!cloudName || !uploadPreset || cloudName === 'your_cloudinary_cloud_name') {
    throw new Error(
      'Cloudinary credentials are not configured. Please enter your Cloud Name and Unsigned Upload Preset in Admin > Settings.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', `vulmora_store/${folder}`);

  const uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

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
          const errorMsg = errorResponse.error?.message || `Upload failed with status ${xhr.status}`;
          reject(new Error(errorMsg));
        } catch {
          reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during image upload to Cloudinary. Check connection.'));
    };

    xhr.send(formData);
  });
}
