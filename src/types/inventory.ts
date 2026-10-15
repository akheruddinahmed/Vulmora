export type InventoryChangeReason =
  | 'ORDER_PLACED'
  | 'ORDER_CANCELLED'
  | 'MANUAL_RESTOCK'
  | 'MANUAL_CORRECTION'
  | 'DAMAGE_WRITE_OFF';

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantityBefore: number;
  quantityAfter: number;
  quantityChange: number;
  reason: InventoryChangeReason;
  actorUid: string;
  actorEmail?: string;
  relatedOrderId?: string;
  notes?: string;
  createdAt: any;
}
