/**
 * Script to migrate local catalog images to Cloudinary and update Firestore
 * Usage: node scripts/migrateToCloudinary.js <cloudName> <uploadPreset>
 */

const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyAEDhD1Tlpbygx1-jeDjoAZdNgXClhCzHE',
  authDomain: 'vulmora-b26f8.firebaseapp.com',
  projectId: 'vulmora-b26f8',
  storageBucket: 'vulmora-b26f8.firebasestorage.app',
  messagingSenderId: '294098105741',
  appId: '1:294098105741:web:5ecc144e41e7614e8c39c4',
};

const cloudName = process.argv[2] || process.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.argv[3] || process.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!cloudName || !uploadPreset || cloudName === 'vulmora') {
  console.error('Error: Please provide your Cloudinary Cloud Name and Unsigned Upload Preset.');
  console.log('Usage: node scripts/migrateToCloudinary.js <your_cloud_name> <your_upload_preset>');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function uploadFileToCloudinary(filePath, publicId) {
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

  const formData = new FormData();
  formData.append('file', base64Data);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'vulmora_store/products');
  if (publicId) formData.append('public_id', publicId);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `Failed to upload ${filePath} (${res.status})`);
  }

  return data.secure_url;
}

async function run() {
  console.log(`Starting migration to Cloudinary: "${cloudName}" with preset "${uploadPreset}"...`);

  // Sign in as admin to modify Firestore
  await signInWithEmailAndPassword(auth, 'admin@gmail.com', 'admin123');
  console.log('Authenticated as store admin in Firebase.');

  const imagesDir = path.join(__dirname, '../public/images/products');
  const imageFiles = [
    { file: 'vulmora-washing-powder.jpg', slug: 'vulmora-washing-powder' },
    { file: 'vulmora-white-phenyl-1l.jpg', slug: 'vulmora-white-phenyl-floor-cleaner-1l' },
    { file: 'glycerin-ip-50g.jpg', slug: 'glycerin-ip-50g' },
    { file: 'glycerin-ip-100g.jpg', slug: 'glycerin-ip-100g' },
    { file: 'glycerin-ip-labels.jpg', slug: 'glycerin-labels' },
  ];

  const uploadedUrls = {};

  for (const item of imageFiles) {
    const fullPath = path.join(imagesDir, item.file);
    if (fs.existsSync(fullPath)) {
      console.log(`Uploading ${item.file} to Cloudinary...`);
      try {
        const cdnUrl = await uploadFileToCloudinary(fullPath, item.slug);
        uploadedUrls[item.file] = cdnUrl;
        console.log(`✓ Uploaded: ${item.file} -> ${cdnUrl}`);
      } catch (err) {
        console.error(`✗ Failed uploading ${item.file}:`, err.message);
      }
    } else {
      console.warn(`File not found: ${fullPath}`);
    }
  }

  // Update Firestore products
  console.log('\nUpdating Firestore product catalog with Cloudinary URLs...');
  const productsSnap = await getDocs(collection(db, 'products'));
  for (const docSnap of productsSnap.docs) {
    const p = docSnap.data();
    let changed = false;
    const updatedImages = (p.images || []).map((img) => {
      for (const [localFile, cdnUrl] of Object.entries(uploadedUrls)) {
        if (img.url && img.url.includes(localFile)) {
          changed = true;
          return { ...img, url: cdnUrl };
        }
      }
      return img;
    });

    if (changed) {
      await updateDoc(doc(db, 'products', docSnap.id), { images: updatedImages });
      console.log(`✓ Updated product "${p.name}" with Cloudinary CDN URL.`);
    }
  }

  // Update Firestore categories
  console.log('\nUpdating Firestore categories with Cloudinary URLs...');
  const catSnap = await getDocs(collection(db, 'categories'));
  for (const docSnap of catSnap.docs) {
    const cat = docSnap.data();
    for (const [localFile, cdnUrl] of Object.entries(uploadedUrls)) {
      if (cat.imageUrl && cat.imageUrl.includes(localFile)) {
        await updateDoc(doc(db, 'categories', docSnap.id), { imageUrl: cdnUrl });
        console.log(`✓ Updated category "${cat.name}" with Cloudinary CDN URL.`);
        break;
      }
    }
  }

  console.log('\nMigration to Cloudinary successfully completed!');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
