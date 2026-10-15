import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, BuyNowItem } from '@/types/cart';
import { Product } from '@/types/product';
import { useToast } from './ToastContext';
import { useStoreSettings } from './StoreSettingsContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  freeShippingRemaining: number;
  total: number;
  addItem: (product: Product, quantity?: number) => boolean;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  buyNowItem: BuyNowItem | null;
  setBuyNow: (product: Product, quantity?: number) => boolean;
  clearBuyNow: () => void;
}

const CART_STORAGE_KEY = 'vulmora_store_cart_v1';
const BUY_NOW_STORAGE_KEY = 'vulmora_store_buynow_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [buyNowItem, setBuyNowItem] = useState<BuyNowItem | null>(() => {
    try {
      const stored = sessionStorage.getItem(BUY_NOW_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const { settings } = useStoreSettings();
  const { success, warning, error } = useToast();

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [items]);

  // Save buyNow to sessionStorage
  useEffect(() => {
    try {
      if (buyNowItem) {
        sessionStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify(buyNowItem));
      } else {
        sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save buyNow to sessionStorage:', e);
    }
  }, [buyNowItem]);

  const addItem = (product: Product, requestedQuantity: number = 1): boolean => {
    if (product.stock <= 0) {
      error('Out of Stock', `${product.name} is currently out of stock.`);
      return false;
    }

    const existingIndex = items.findIndex((item) => item.productId === product.id);
    const primaryImg =
      product.images.find((img) => img.isPrimary)?.url ||
      product.images[0]?.url ||
      '';

    if (existingIndex > -1) {
      const existing = items[existingIndex];
      const newQty = existing.quantity + requestedQuantity;

      if (newQty > product.stock) {
        warning(
          'Stock Limit Reached',
          `You already have ${existing.quantity} in cart. Only ${product.stock} available in total.`
        );
        return false;
      }

      const updated = [...items];
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        maxStock: product.stock,
        price: product.price, // ensure refreshed price
      };
      setItems(updated);
      success('Cart Updated', `Increased quantity of ${product.name} to ${newQty}.`);
      return true;
    } else {
      const initialQty = Math.min(requestedQuantity, product.stock);
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice,
        image: primaryImg,
        sku: product.sku,
        quantity: initialQty,
        maxStock: product.stock,
      };
      setItems((prev) => [...prev, newItem]);
      success('Added to Cart', `${product.name} has been added to your shopping cart.`);
      return true;
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const clampedQty = Math.min(quantity, item.maxStock);
          if (quantity > item.maxStock) {
            warning('Stock limit reached', `Only ${item.maxStock} units currently available.`);
          }
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => {
      const removed = prev.find((i) => i.productId === productId);
      if (removed) {
        success('Item Removed', `${removed.name} was removed from your cart.`);
      }
      return prev.filter((i) => i.productId !== productId);
    });
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const setBuyNow = (product: Product, quantity: number = 1): boolean => {
    if (product.stock <= 0) {
      error('Out of Stock', `${product.name} is currently out of stock.`);
      return false;
    }

    const primaryImg =
      product.images.find((img) => img.isPrimary)?.url ||
      product.images[0]?.url ||
      '';

    const safeQty = Math.min(Math.max(1, quantity), product.stock);

    const buyNowObj: BuyNowItem = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      image: primaryImg,
      sku: product.sku,
      quantity: safeQty,
      maxStock: product.stock,
    };

    setBuyNowItem(buyNowObj);
    return true;
  };

  const clearBuyNow = () => {
    setBuyNowItem(null);
    try {
      sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
    } catch {}
  };

  // Calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee =
    subtotal === 0 || subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const freeShippingRemaining = Math.max(0, settings.freeShippingThreshold - subtotal);
  const total = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shippingFee,
        freeShippingRemaining,
        total,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        buyNowItem,
        setBuyNow,
        clearBuyNow,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
