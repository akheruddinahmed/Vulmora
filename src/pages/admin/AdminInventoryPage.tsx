import React, { useEffect, useState } from 'react';
import {
  Warehouse,
  Plus,
  Minus,
  Edit3,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';
import { Product } from '@/types/product';
import { InventoryLog } from '@/types/inventory';
import { getAllProductsAdmin, adjustInventoryStock } from '@/services/products/productService';
import { getInventoryLogs } from '@/services/inventory/inventoryService';
import { formatDate } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export const AdminInventoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stock Adjustment Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<
    'MANUAL_RESTOCK' | 'MANUAL_CORRECTION' | 'DAMAGE_WRITE_OFF'
  >('MANUAL_RESTOCK');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prods, auditLogs] = await Promise.all([
        getAllProductsAdmin(),
        getInventoryLogs(50),
      ]);
      setProducts(prods);
      setLogs(auditLogs);
    } catch (err: any) {
      error('Failed to load inventory', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdjustmentModal = (prod: Product) => {
    setSelectedProduct(prod);
    setNewStock(prod.stock);
    setAdjustmentReason('MANUAL_RESTOCK');
    setAdjustmentNotes('');
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !currentUser) return;

    if (newStock < 0) {
      error('Invalid Quantity', 'Stock quantity cannot be negative.');
      return;
    }

    setIsAdjusting(true);
    try {
      await adjustInventoryStock(
        selectedProduct.id,
        newStock,
        adjustmentReason,
        currentUser.uid,
        currentUser.email || 'Admin',
        adjustmentNotes
      );
      success('Inventory Adjusted', `Stock for "${selectedProduct.name}" set to ${newStock}.`);
      setSelectedProduct(null);
      await fetchData();
    } catch (err: any) {
      error('Adjustment Failed', err.message);
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Inventory Management & Audit Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock controls, manual restock adjustments, and tamper-evident inventory movement logs
          </p>
        </div>
      </div>

      {/* Product Stock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-subtle space-y-4 p-6">
        <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
          Current Product Stock Levels
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 px-3 font-semibold">Product</th>
                <th className="pb-3 px-3 font-semibold">SKU</th>
                <th className="pb-3 px-3 font-semibold">Available Stock</th>
                <th className="pb-3 px-3 font-semibold">Threshold</th>
                <th className="pb-3 px-3 font-semibold">Health Status</th>
                <th className="pb-3 px-3 font-semibold text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {products.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const isLowStock = !isOutOfStock && p.stock <= p.lowStockThreshold;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white truncate max-w-[200px]">{p.name}</p>
                      <p className="text-[11px] text-slate-500">{p.brand || 'VULMORA'}</p>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-400">{p.sku}</td>

                    <td className="py-3 px-3 font-bold text-sm text-white">{p.stock} units</td>

                    <td className="py-3 px-3 text-slate-400">{p.lowStockThreshold} units</td>

                    <td className="py-3 px-3">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Low Stock Alert
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Healthy
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => openAdjustmentModal(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-subtle space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Immutable Inventory Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Logs records every order placement deduction, cancellation restoration, and manual stock change
            </p>
          </div>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No inventory changes recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 px-3 font-semibold">Timestamp</th>
                  <th className="pb-3 px-3 font-semibold">Product</th>
                  <th className="pb-3 px-3 font-semibold">Before</th>
                  <th className="pb-3 px-3 font-semibold">Change</th>
                  <th className="pb-3 px-3 font-semibold">After</th>
                  <th className="pb-3 px-3 font-semibold">Reason</th>
                  <th className="pb-3 px-3 font-semibold">Actor / Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 whitespace-nowrap text-slate-400">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-white truncate max-w-[180px]">
                        {log.productName}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500">{log.sku}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{log.quantityBefore}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold font-mono ${
                          log.quantityChange > 0
                            ? 'text-emerald-400'
                            : log.quantityChange < 0
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{log.quantityAfter}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-blue-300 border border-slate-700">
                        {log.reason}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      <p className="truncate max-w-[140px]">{log.actorEmail || log.actorUid}</p>
                      {log.relatedOrderId && (
                        <p className="text-[10px] font-mono text-slate-500">
                          {log.relatedOrderId}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Adjust Stock Level</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
                <p className="text-slate-400 font-medium">Target Product:</p>
                <p className="font-bold text-white text-sm mt-0.5">{selectedProduct.name}</p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  SKU: {selectedProduct.sku} • Current Stock: {selectedProduct.stock} units
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">New Available Stock *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Adjustment Reason *</label>
                <select
                  value={adjustmentReason}
                  onChange={(e: any) => setAdjustmentReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="MANUAL_RESTOCK">Manual Restock (Received Inventory)</option>
                  <option value="MANUAL_CORRECTION">Manual Inventory Count Correction</option>
                  <option value="DAMAGE_WRITE_OFF">Damaged / Defective Stock Write-off</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Notes / Supplier AWB (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Received shipment lot #B291"
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-500/25 disabled:opacity-50"
                >
                  {isAdjusting ? 'Saving...' : 'Commit Stock Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
