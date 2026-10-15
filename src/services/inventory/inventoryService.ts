import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { InventoryLog } from '@/types/inventory';

const INVENTORY_LOGS_COLLECTION = 'inventoryLogs';

export async function getInventoryLogs(maxResults: number = 100): Promise<InventoryLog[]> {
  try {
    const colRef = collection(db, INVENTORY_LOGS_COLLECTION);
    const snap = await getDocs(colRef);
    const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as InventoryLog[];
    return logs
      .sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      })
      .slice(0, maxResults);
  } catch (err) {
    console.error('Error fetching inventory logs:', err);
    return [];
  }
}
