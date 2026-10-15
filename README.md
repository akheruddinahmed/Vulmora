# VULMORA | Household Cleaning & Personal Care E-Commerce Platform

A high-performance, modular full-stack e-commerce web platform engineered for **VULMORA** built with **React 18**, **TypeScript**, **Tailwind CSS**, **Firebase (Auth, Firestore, Cloud Functions)**, and **Cloudinary**. Exclusively tailored for the Indian consumer market with 100% Cash on Delivery (COD) payment.

Featuring dual interfaces:
1. **Customer Storefront**: Authentic VULMORA catalog (Laundry Care, Floor Cleaning, Personal Care), dynamic filtering, real-time stock sync, persistent cart, independent Buy Now direct checkout, and Cash on Delivery (COD) order placement.
2. **Admin Dashboard**: Real-time business KPIs, catalog CRUD, Cloudinary multi-image uploads, order pipeline management, idempotent cancellation inventory restorations, COD cash collection tracking, and stock audit logs.

---

## 1. System Architecture & Tech Stack

```
                     ┌──────────────────────────────────────────┐
                     │          Vite + React 18 + TS            │
                     │          Tailwind CSS + Lucide           │
                     └────────────────────┬─────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌─────────────────────────┐                     ┌─────────────────────────┐
     │   Customer Interface    │                     │     Admin Dashboard     │
     │  - Home, Shop, Details  │                     │  - KPIs & Analytics     │
     │  - Cart (localStorage)  │                     │  - Product & Categories │
     │  - Buy Now (Direct Flow)│                     │  - Order Management     │
     │  - COD Checkout Page    │                     │  - Stock & Audit Logs   │
     │  - My Orders & Tracking │                     │  - Store Settings & Seed│
     └────────────┬────────────┘                     └────────────┬────────────┘
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          │
                 ┌────────────────────────┼────────────────────────┐
                 ▼                        ▼                        ▼
      ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
      │   Firebase Auth    │   │   Cloud Firestore  │   │  Cloudinary Media  │
      │ - Email & Password │   │ - Real-time Data   │   │ - Multi-Upload     │
      │ - Custom Claims    │   │ - Atomic Txns      │   │ - Responsive Fills │
      │ - Role Verification│   │ - Strict Rules     │   │ - Transformations  │
      └────────────────────┘   └────────────────────┘   └────────────────────┘
```

### Frontend
- **Framework**: React 18 with Vite and TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design system, subtle elevation shadows, and Inter typography
- **Routing**: React Router DOM v6 with route-level code splitting (`React.lazy` + `Suspense`)
- **Icons**: Lucide React
- **Form & Validation**: React Hook Form with Zod schemas (Indian phone number `^[6-9]\d{9}$` and 6-digit PIN code `^\d{6}$`)
- **State Management**:
  - `CartContext`: LocalStorage persistence for guest users, stock ceiling checks, subtotal and shipping calculations.
  - `AuthContext`: Firebase Auth listener, custom claims verification, profile sync.
  - `StoreSettingsContext`: Real-time Firestore sync of shipping fees, thresholds, and announcements.
  - `ToastContext`: Floating non-intrusive notification system.

### Backend & Cloud
- **Firebase Authentication**: Customer signup/login, session management, and admin custom claims.
- **Cloud Firestore**: Primary database for products, categories, orders, users, settings, and immutable audit logs.
- **Cloud Functions**: Privileged callable operations (`createOrder`, `promoteAdmin`, `signCloudinaryUpload`).
- **Cloudinary**: High-performance image hosting with automatic format (`f_auto`), quality compression (`q_auto`), and responsive crops.

---

## 2. Project Directory Structure

```
vulmora/
├── public/                    # Static assets & favicon
├── src/
│   ├── components/
│   │   ├── admin/             # Admin layout, route guards, Cloudinary uploader
│   │   ├── common/            # Navbar, Footer, ProductCard, Skeletons, ErrorBoundary
│   │   └── layout/            # CustomerLayout with scroll-to-top handler
│   ├── contexts/              # AuthContext, CartContext, StoreSettingsContext, ToastContext
│   ├── pages/
│   │   ├── admin/             # Dashboard, Products, ProductForm, Categories, Orders, OrderDetails, Customers, Inventory, Settings, AdminLogin
│   │   ├── auth/              # LoginPage, RegisterPage, ForgotPasswordPage
│   │   ├── cart/              # CartPage with free shipping progress bar
│   │   ├── checkout/          # CheckoutPage (COD only), OrderSuccessPage (confetti celebration)
│   │   ├── home/              # HomePage with hero, spotlight, and dynamic catalog
│   │   ├── orders/            # MyOrdersPage with shipment status timeline
│   │   └── shop/              # ShopPage (multi-facet filters), CategoriesPage
│   ├── routes/                # AppRoutes with lazy-loaded code-splitting
│   ├── schemas/               # Zod validation schemas (auth, checkout, product, category)
│   ├── services/
│   │   ├── cloudinary/        # Direct & signed uploads, image URL transformations
│   │   ├── firebase/          # Firebase client SDK initialization
│   │   ├── orders/            # Atomic order placement, status workflow, safe cancellation
│   │   ├── products/          # Active catalog queries, admin CRUD, inventory adjustments
│   │   ├── categories/        # Category queries, delete-protection checks
│   │   ├── users/             # Customer directory and eligible spending calculations
│   │   ├── inventory/         # Immutable audit trail queries
│   │   └── seed/              # 1-click catalog seeder for instant setup
│   ├── types/                 # TypeScript interfaces (Product, Order, Cart, User, Settings)
│   ├── utils/                 # INR currency formatting, date helpers, slug generator
│   ├── styles/                # Tailwind global CSS and scrollbar styling
│   ├── App.tsx                # Context provider wrapper
│   ├── main.tsx               # Entry mount
│   └── vite-env.d.ts          # Vite client types
├── functions/                 # Firebase Cloud Functions (Node 20 TypeScript)
│   ├── src/index.ts           # Callable functions: createOrder, promoteAdmin, signCloudinaryUpload
│   ├── package.json
│   └── tsconfig.json
├── firestore.rules            # Strict security rules (COD validation, admin protections)
├── firestore.indexes.json     # Composite query indexes
├── firebase.json              # Hosting and rules deployment config
├── tailwind.config.js         # Design system tokens
├── vite.config.ts             # Vite bundle and alias configuration
└── .env.example               # Environment template
```

---

## 3. Getting Started Locally

### Prerequisites
- Node.js (v18 or v20 LTS)
- npm or pnpm

### Installation
```bash
# Clone or navigate to the project root
cd vulmora

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```

Visit `http://localhost:3000` to browse the customer store.
Visit `http://localhost:3000/admin/login` to access the admin portal.

### Admin Setup & Catalog Seeding
1. Navigate to `/admin/login` and sign in with your administrator account (`akheruddinahmed@gmail.com`).
2. In the Admin Dashboard, go to **Store Settings**.
3. Click **"Seed Sample Data"** to populate Firestore with the 3 VULMORA departments (*Laundry Care*, *Floor Cleaning*, *Personal Care*) and the 4 authentic initial catalog products (*VULMORA Washing Powder*, *VULMORA White Phenyl Floor Cleaner 1L*, *Glycerin I.P. 50g*, *Glycerin I.P. 100g*), with authentic packaging photos and verified MRPs.

---

## 4. Firebase Configuration Guide

### A. Create Project & Authentication
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project (e.g., `vulmora-b26f8`).
2. Navigate to **Authentication** > **Sign-in method** and enable **Email/Password**.
3. Create your web app in Project Settings and copy the configuration keys into your `.env` file:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=vulmora-b26f8.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=vulmora-b26f8
   VITE_FIREBASE_STORAGE_BUCKET=vulmora-b26f8.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=294098105741
   VITE_FIREBASE_APP_ID=1:...
   ```

### B. Deploy Firestore Security Rules & Indexes
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to your Google account
firebase login

# Set your active project
firebase use your-project-id

# Deploy Firestore Security Rules and Indexes
firebase deploy --only firestore
```

### C. Promoting an Administrator
Administrator status is server-verified through **Firebase Authentication Custom Claims** and the `/admins/{uid}` Firestore collection.

**Method 1: Via Cloud Function**
Call `promoteAdmin` with the user's email:
```json
{
  "targetEmail": "admin@vulmora.in",
  "bootstrapSecret": "YOUR_ADMIN_BOOTSTRAP_SECRET"
}
```

**Method 2: Via Firebase Node Script / Admin SDK**
```javascript
const admin = require('firebase-admin');
admin.initializeApp();

async function makeAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, { admin: true, role: 'admin' });
  await admin.firestore().doc(`admins/${uid}`).set({
    uid,
    role: 'admin',
    promotedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`User ${uid} is now an administrator.`);
}
```

**Method 3: Environment Variable Verification**
Set `VITE_ADMIN_EMAILS=akheruddinahmed@gmail.com,admin@vulmora.in` in `.env`. Any registered user logging in with this email receives administrative verification in the UI.

---

## 5. Cloudinary Configuration Guide

1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. In the Cloudinary Dashboard:
   - Note your **Cloud Name**.
   - Go to **Settings** > **Upload** > **Upload presets**.
   - Click **Add upload preset**:
     - Name: `vulmora_preset` (or matching your `VITE_CLOUDINARY_UPLOAD_PRESET`)
     - Signing Mode: `Unsigned`
     - Folder: `vulmora_store/products`
3. Add to your `.env` file:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=vulmora_preset
   ```
4. For server-side signed uploads (optional), configure `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in your Cloud Functions environment (`functions/.env`).

---

## 6. Core Business Logic & Security Highlights

### A. Cash on Delivery (COD) Only
- Online gateways (cards, UPI, net banking) are explicitly omitted to eliminate payment gateway failures.
- Customers verify items upon delivery before handing cash to the courier.
- Orders are initialized with `paymentStatus: "Pending"`.
- Only authorized admins can mark an order's payment as `"Collected"` after physical receipt.

### B. Concurrency-Safe Order Creation & Anti-Tampering
- Price integrity is guaranteed by Firestore transactions (`runTransaction`).
- Client-submitted prices in localStorage or HTML forms are **never trusted**. Product prices and available inventory are retrieved directly from Firestore inside the atomic transaction.
- If another shopper purchases the last remaining unit concurrently, the transaction rolls back gracefully and notifies the user.

### C. Independent "Buy Now" Flow
- Clicking "Buy Now" validates real-time product stock, isolates the single product in session state, and redirects to `/checkout?buyNow=true`.
- Unrelated items in the customer's shopping cart are preserved and **never** mixed into the Buy Now purchase.

### D. Idempotent Inventory Restoration on Cancellation
- When an order is cancelled by an administrator, the system checks `order.inventoryRestored`.
- If `false`, stock is restored to Firestore products, an audit log is appended to `inventoryLogs`, and `inventoryRestored` is set to `true`.
- Repeated cancellation clicks or retries can **never** duplicate inventory restoration.

---

## 7. Build & Production Deployment

### Build Frontend
```bash
npm run build
```
Generates optimized, code-split production bundles in `dist/`.

### Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### Deploy Backend Functions
```bash
firebase deploy --only functions
```
