import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import {
  Order,
  OrderStatus,
  OrderItemSnapshot,
  DeliveryAddress,
  StatusHistoryEntry,
} from '@/types/order';
import { Product } from '@/types/product';
import { generateOrderId } from '@/utils/formatters';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';
const INVENTORY_LOGS_COLLECTION = 'inventoryLogs';

export interface PlaceOrderInput {
  items: { productId: string; quantity: number }[];
  deliveryAddress: DeliveryAddress;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  configuredShippingFee: number;
  freeShippingThreshold: number;
}

/**
 * Places a Cash on Delivery (COD) order using an atomic Firestore transaction.
 * Validates real-time product prices and stock, prevents overselling,
 * creates immutable snapshots, and logs inventory movements.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const {
    items,
    deliveryAddress,
    userId,
    customerName,
    customerEmail,
    customerPhone,
    configuredShippingFee,
    freeShippingThreshold,
  } = input;

  if (!items || items.length === 0) {
    throw new Error('Cannot place an order with an empty item list.');
  }

  const generatedId = generateOrderId();
  const orderDocRef = doc(collection(db, ORDERS_COLLECTION));

  return await runTransaction(db, async (transaction) => {
    const snapshotsToDeduct: {
      ref: any;
      newStock: number;
      oldStock: number;
      product: Product;
      qty: number;
    }[] = [];

    const orderItems: OrderItemSnapshot[] = [];
    let calculatedSubtotal = 0;

    // 1. Fetch current product information directly from Firestore inside transaction
    for (const item of items) {
      const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      const prodSnap = await transaction.get(prodRef);

      if (!prodSnap.exists()) {
        throw new Error(`Product with ID ${item.productId} was not found.`);
      }

      const product = { id: prodSnap.id, ...prodSnap.data() } as Product;

      if (product.status !== 'active') {
        throw new Error(
          `"${product.name}" is no longer active for purchase. Please remove it from your cart.`
        );
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Only ${product.stock} units remain available.`
        );
      }

      const lineTotal = product.price * item.quantity;
      calculatedSubtotal += lineTotal;

      const primaryImg =
        product.images?.find((img) => img.isPrimary)?.url ||
        product.images?.[0]?.url ||
        '';

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: primaryImg,
        sku: product.sku,
        unitPrice: product.price, // Trusted server-side price from Firestore
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

    // 2. Compute trusted shipping fee and grand total
    const shippingFee =
      calculatedSubtotal >= freeShippingThreshold ? 0 : configuredShippingFee;
    const grandTotal = calculatedSubtotal + shippingFee;

    // 3. Atomically deduct inventory for each product
    for (const deduction of snapshotsToDeduct) {
      transaction.update(deduction.ref, {
        stock: deduction.newStock,
        updatedAt: serverTimestamp(),
      });

      // Write inventory log
      const logRef = doc(collection(db, INVENTORY_LOGS_COLLECTION));
      transaction.set(logRef, {
        productId: deduction.product.id,
        productName: deduction.product.name,
        sku: deduction.product.sku,
        quantityBefore: deduction.oldStock,
        quantityAfter: deduction.newStock,
        quantityChange: -deduction.qty,
        reason: 'ORDER_PLACED',
        actorUid: userId,
        actorEmail: customerEmail,
        relatedOrderId: generatedId,
        createdAt: serverTimestamp(),
      });
    }

    // 4. Create order document
    const initialStatusHistory: StatusHistoryEntry[] = [
      {
        status: 'Placed',
        timestamp: new Date().toISOString(),
        notes: 'Cash on Delivery order placed by customer.',
      },
    ];

    const orderPayload = {
      orderId: generatedId,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      items: orderItems,
      itemCount: orderItems.reduce((acc, cur) => acc + cur.quantity, 0),
      subtotal: calculatedSubtotal,
      shippingFee,
      total: grandTotal,
      currency: 'INR',
      paymentMethod: 'COD',
      paymentStatus: 'Pending', // Never marked paid before delivery collection
      orderStatus: 'Placed',
      statusHistory: initialStatusHistory,
      adminNotes: '',
      inventoryRestored: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    transaction.set(orderDocRef, orderPayload);

    return {
      id: orderDocRef.id,
      ...orderPayload,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Order;
  });
}

/**
 * Fetch orders for the logged-in customer
 */
export async function getCustomerOrders(userId: string): Promise<Order[]> {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];
    // Sort newest first
    return orders.sort((a, b) => {
      const timeA = a.createdAt?.seconds || (a.createdAt instanceof Date ? a.createdAt.getTime() / 1000 : 0);
      const timeB = b.createdAt?.seconds || (b.createdAt instanceof Date ? b.createdAt.getTime() / 1000 : 0);
      return timeB - timeA;
    });
  } catch (err) {
    console.error('Error fetching customer orders:', err);
    throw err;
  }
}

/**
 * Fetch a single order by Firestore ID
 */
export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Order;
  } catch (err) {
    console.error(`Error fetching order ${id}:`, err);
    return null;
  }
}

/**
 * Fetch all orders for the Admin Dashboard
 */
export async function getAllOrdersAdmin(): Promise<Order[]> {
  try {
    const colRef = collection(db, ORDERS_COLLECTION);
    const snap = await getDocs(colRef);
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];
    return orders.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    throw err;
  }
}

/**
 * Valid order status workflow progression
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Placed: ['Confirmed', 'Cancelled'],
  Confirmed: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Out for Delivery', 'Cancelled'],
  'Out for Delivery': ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
};

/**
 * Admin updates order status with transition validation and timeline recording
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  adminUid: string,
  adminEmail: string,
  notes?: string
): Promise<void> {
  if (newStatus === 'Cancelled') {
    return cancelOrderSafely(orderId, adminUid, adminEmail, notes || 'Cancelled by administrator');
  }

  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) throw new Error('Order not found');

  const currentOrder = snap.data() as Order;
  const currentStatus = currentOrder.orderStatus;

  // Validate transition
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new Error(
      `Cannot transition order from "${currentStatus}" to "${newStatus}". Allowed transitions: ${
        allowed ? allowed.join(', ') : 'None'
      }`
    );
  }

  const newHistoryEntry: StatusHistoryEntry = {
    status: newStatus,
    timestamp: new Date().toISOString(),
    updatedBy: adminEmail,
    notes: notes || `Order status updated to ${newStatus}`,
  };

  const updatedHistory = [...(currentOrder.statusHistory || []), newHistoryEntry];

  await updateDoc(orderRef, {
    orderStatus: newStatus,
    statusHistory: updatedHistory,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Atomically cancels an order and restores deducted inventory.
 * Guarantees that stock is restored exactly once using inventoryRestored flag.
 */
export async function cancelOrderSafely(
  orderId: string,
  adminUid: string,
  adminEmail: string,
  reason: string
): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(orderRef);
    if (!snap.exists()) throw new Error('Order not found');

    const order = snap.data() as Order;

    if (order.orderStatus === 'Cancelled') {
      throw new Error('This order is already cancelled.');
    }

    if (order.orderStatus === 'Delivered') {
      throw new Error('Cannot cancel an order that has already been delivered.');
    }

    // Restore stock ONLY if not already restored
    if (!order.inventoryRestored && order.items && order.items.length > 0) {
      for (const item of order.items) {
        const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId);
        const prodSnap = await transaction.get(prodRef);

        if (prodSnap.exists()) {
          const currentStock = prodSnap.data().stock || 0;
          const restoredStock = currentStock + item.quantity;

          transaction.update(prodRef, {
            stock: restoredStock,
            updatedAt: serverTimestamp(),
          });

          // Log inventory restoration
          const logRef = doc(collection(db, INVENTORY_LOGS_COLLECTION));
          transaction.set(logRef, {
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            quantityBefore: currentStock,
            quantityAfter: restoredStock,
            quantityChange: item.quantity,
            reason: 'ORDER_CANCELLED',
            actorUid: adminUid,
            actorEmail: adminEmail,
            relatedOrderId: order.orderId,
            notes: `Stock restored upon order cancellation: ${reason}`,
            createdAt: serverTimestamp(),
          });
        }
      }
    }

    const cancelEntry: StatusHistoryEntry = {
      status: 'Cancelled',
      timestamp: new Date().toISOString(),
      updatedBy: adminEmail,
      notes: reason,
    };

    transaction.update(orderRef, {
      orderStatus: 'Cancelled',
      inventoryRestored: true,
      statusHistory: [...(order.statusHistory || []), cancelEntry],
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * Admin records that cash payment has been collected at doorstep
 */
export async function markCODCollected(
  orderId: string,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) throw new Error('Order not found');

  const order = snap.data() as Order;
  if (order.paymentStatus === 'Collected') {
    throw new Error('Payment has already been marked as Collected.');
  }

  const paymentEntry: StatusHistoryEntry = {
    status: order.orderStatus,
    timestamp: new Date().toISOString(),
    updatedBy: adminEmail,
    notes: 'Cash on Delivery payment received and verified by administrator.',
  };

  await updateDoc(orderRef, {
    paymentStatus: 'Collected',
    paymentCollectedAt: serverTimestamp(),
    paymentCollectedBy: adminEmail,
    statusHistory: [...(order.statusHistory || []), paymentEntry],
    updatedAt: serverTimestamp(),
  });
}
