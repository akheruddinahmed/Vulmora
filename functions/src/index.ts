import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v2 as cloudinary } from 'cloudinary';

admin.initializeApp();
const db = admin.firestore();

// Configure Cloudinary server-side with private environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

/**
 * 1. createOrder: Privileged Cloud Function for atomic order placement
 */
export const createOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be signed in to place an order.'
    );
  }

  const { items, deliveryAddress } = data;
  const userId = context.auth.uid;
  const userEmail = context.auth.token.email || '';

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Cart items cannot be empty.');
  }

  // Load store settings for shipping calculation
  const settingsSnap = await db.doc('settings/general').get();
  const settings = settingsSnap.data() || {
    shippingFee: 99,
    freeShippingThreshold: 999,
  };

  return await db.runTransaction(async (transaction) => {
    let subtotal = 0;
    const snapshotsToDeduct: { ref: FirebaseFirestore.DocumentReference; newStock: number; oldStock: number; product: any; qty: number }[] = [];
    const orderItems: any[] = [];

    for (const item of items) {
      const prodRef = db.doc(`products/${item.productId}`);
      const prodSnap = await transaction.get(prodRef);

      if (!prodSnap.exists) {
        throw new functions.https.HttpsError('not-found', `Product ${item.productId} not found.`);
      }

      const product = prodSnap.data()!;
      if (product.status !== 'active') {
        throw new functions.https.HttpsError('failed-precondition', `Product "${product.name}" is no longer active.`);
      }

      if (product.stock < item.quantity) {
        throw new functions.https.HttpsError('failed-precondition', `Insufficient stock for "${product.name}". Only ${product.stock} available.`);
      }

      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;

      const primaryImg = product.images?.find((img: any) => img.isPrimary)?.url || product.images?.[0]?.url || '';

      orderItems.push({
        productId: prodSnap.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: primaryImg,
        sku: product.sku,
        unitPrice: product.price,
        quantity: item.quantity,
        lineTotal,
      });

      snapshotsToDeduct.push({
        ref: prodRef,
        newStock: product.stock - item.quantity,
        oldStock: product.stock,
        product,
        qty: item.quantity,
      });
    }

    const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
    const total = subtotal + shippingFee;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${dateStr}-${randomSuffix}`;

    // Deduct stock and log movements
    for (const d of snapshotsToDeduct) {
      transaction.update(d.ref, {
        stock: d.newStock,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const logRef = db.collection('inventoryLogs').doc();
      transaction.set(logRef, {
        productId: d.ref.id,
        productName: d.product.name,
        sku: d.product.sku,
        quantityBefore: d.oldStock,
        quantityAfter: d.newStock,
        quantityChange: -d.qty,
        reason: 'ORDER_PLACED',
        actorUid: userId,
        actorEmail: userEmail,
        relatedOrderId: orderId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Create order document
    const orderDocRef = db.collection('orders').doc();
    const orderData = {
      orderId,
      userId,
      customerName: deliveryAddress.fullName,
      customerEmail: userEmail,
      customerPhone: deliveryAddress.phone,
      deliveryAddress,
      items: orderItems,
      itemCount: orderItems.reduce((acc, c) => acc + c.quantity, 0),
      subtotal,
      shippingFee,
      total,
      currency: 'INR',
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Placed',
      statusHistory: [
        {
          status: 'Placed',
          timestamp: new Date().toISOString(),
          notes: 'Cash on Delivery order placed by verified customer.',
        },
      ],
      adminNotes: '',
      inventoryRestored: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    transaction.set(orderDocRef, orderData);

    return {
      success: true,
      id: orderDocRef.id,
      orderId,
      total,
    };
  });
});

/**
 * 2. promoteAdmin: Secure role promotion setting Custom Claims
 */
export const promoteAdmin = functions.https.onCall(async (data, context) => {
  // Verify that the caller is already an admin OR the secret bootstrap key is supplied
  const isExistingAdmin = context.auth?.token.admin === true;
  const isBootstrapMatch = data.bootstrapSecret && data.bootstrapSecret === process.env.ADMIN_BOOTSTRAP_SECRET;

  if (!isExistingAdmin && !isBootstrapMatch) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only existing administrators or bootstrap keys can promote admins.'
    );
  }

  const { targetEmail, targetUid } = data;
  let uid = targetUid;

  if (!uid && targetEmail) {
    const userRecord = await admin.auth().getUserByEmail(targetEmail);
    uid = userRecord.uid;
  }

  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'Target email or UID must be provided.');
  }

  // 1. Set Custom Claims on Firebase Authentication token
  await admin.auth().setCustomUserClaims(uid, {
    admin: true,
    role: 'admin',
  });

  // 2. Also register in /admins/{uid} Firestore document
  await db.doc(`admins/${uid}`).set(
    {
      uid,
      role: 'admin',
      promotedAt: admin.firestore.FieldValue.serverTimestamp(),
      promotedBy: context.auth?.token.email || 'system_bootstrap',
    },
    { merge: true }
  );

  return { success: true, message: `Successfully assigned admin custom claims to ${uid}.` };
});

/**
 * 3. signCloudinaryUpload: Generates server-side Cloudinary signature
 */
export const signCloudinaryUpload = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  // Only admins can request upload signatures for product catalogs
  if (context.auth.token.admin !== true) {
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges required.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = `vulmora_store/${data.folder || 'products'}`;

  const paramsToSign = {
    timestamp,
    folder,
  };

  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';
  if (!apiSecret) {
    throw new functions.https.HttpsError('failed-precondition', 'Cloudinary API secret not configured.');
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
});
