import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { UserProfile } from '@/types/user';
import { Order } from '@/types/order';

export interface CustomerWithStats extends UserProfile {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: any;
}

const USERS_COLLECTION = 'users';
const ORDERS_COLLECTION = 'orders';

export async function getAllCustomersAdmin(): Promise<CustomerWithStats[]> {
  try {
    const usersSnap = await getDocs(collection(db, USERS_COLLECTION));
    const ordersSnap = await getDocs(collection(db, ORDERS_COLLECTION));

    const ordersByUser: Record<string, Order[]> = {};
    ordersSnap.docs.forEach((docSnap) => {
      const order = { id: docSnap.id, ...docSnap.data() } as Order;
      if (order.userId) {
        if (!ordersByUser[order.userId]) {
          ordersByUser[order.userId] = [];
        }
        ordersByUser[order.userId].push(order);
      }
    });

    const customers: CustomerWithStats[] = usersSnap.docs.map((docSnap) => {
      const user = { uid: docSnap.id, ...docSnap.data() } as UserProfile;
      const userOrders = ordersByUser[user.uid] || [];

      // Calculate total eligible spending (exclude cancelled orders)
      const validOrders = userOrders.filter((o) => o.orderStatus !== 'Cancelled');
      const totalSpent = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      // Latest order
      const sortedOrders = [...userOrders].sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      return {
        ...user,
        totalOrders: userOrders.length,
        totalSpent,
        lastOrderDate: sortedOrders[0]?.createdAt,
      };
    });

    return customers.sort((a, b) => b.totalSpent - a.totalSpent);
  } catch (err) {
    console.error('Error fetching admin customers:', err);
    throw err;
  }
}
