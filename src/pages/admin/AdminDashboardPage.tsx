import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowUpRight,
  Eye,
  Filter,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { Product } from '@/types/product';
import { getAllOrdersAdmin } from '@/services/orders/orderService';
import { getAllProductsAdmin } from '@/services/products/productService';
import { getAllCustomersAdmin } from '@/services/users/userService';
import { formatINR, formatDate } from '@/utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [ordersData, prodsData, customersData] = await Promise.all([
          getAllOrdersAdmin(),
          getAllProductsAdmin(),
          getAllCustomersAdmin(),
        ]);
        setOrders(ordersData);
        setProducts(prodsData);
        setCustomersCount(customersData.length);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (dateFilter === 'all') return orders;

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      const orderTime = o.createdAt?.seconds
        ? o.createdAt.seconds * 1000
        : o.createdAt instanceof Date
        ? o.createdAt.getTime()
        : 0;

      if (dateFilter === 'today') {
        return now - orderTime < oneDay;
      }
      if (dateFilter === '7days') {
        return now - orderTime < 7 * oneDay;
      }
      if (dateFilter === '30days') {
        return now - orderTime < 30 * oneDay;
      }
      return true;
    });
  }, [orders, dateFilter]);

  // Metric calculations
  const totalOrdersCount = filteredOrders.length;
  const newOrdersCount = filteredOrders.filter((o) => o.orderStatus === 'Placed').length;
  const confirmedOrdersCount = filteredOrders.filter((o) => o.orderStatus === 'Confirmed').length;
  const shippedOrdersCount = filteredOrders.filter((o) => o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery').length;
  const deliveredOrdersCount = filteredOrders.filter((o) => o.orderStatus === 'Delivered').length;
  const cancelledOrdersCount = filteredOrders.filter((o) => o.orderStatus === 'Cancelled').length;

  // Net Sales: strictly exclude cancelled orders
  const netSales = filteredOrders
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Product metrics
  const totalProductsCount = products.length;
  const activeProductsCount = products.filter((p) => p.status === 'active').length;
  const outOfStockProducts = products.filter((p) => p.stock <= 0);
  const lowStockProducts = products.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  );

  // Status breakdown for visual distribution
  const statusCounts: Record<string, number> = {
    Placed: newOrdersCount,
    Confirmed: confirmedOrdersCount,
    Shipped: shippedOrdersCount,
    Delivered: deliveredOrdersCount,
    Cancelled: cancelledOrdersCount,
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Executive Performance Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics and inventory health powered by Cloud Firestore
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl self-start sm:self-auto text-xs">
          {(['all', 'today', '7days', '30days'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setDateFilter(mode)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                dateFilter === mode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode === 'all'
                ? 'All Time'
                : mode === 'today'
                ? 'Today'
                : mode === '7days'
                ? 'Last 7 Days'
                : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Net Sales */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Net Sales (COD)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-white">{formatINR(netSales)}</p>
            <p className="text-[11px] text-slate-500">Excludes cancelled transactions</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-white">{totalOrdersCount}</p>
            <p className="text-[11px] text-blue-400 font-medium">
              {newOrdersCount} awaiting review & dispatch
            </p>
          </div>
        </div>

        {/* Products in Catalog */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Catalog Items</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-white">{totalProductsCount}</p>
            <p className="text-[11px] text-slate-500">
              {activeProductsCount} active for purchase
            </p>
          </div>
        </div>

        {/* Registered Customers */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Registered Buyers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-white">{customersCount}</p>
            <p className="text-[11px] text-slate-500">Verified customer accounts</p>
          </div>
        </div>
      </div>

      {/* Order Status Funnel Metrics */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>Order Pipeline & Status Distribution</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <span className="text-xs text-slate-400">Placed (New)</span>
            <p className="text-xl font-bold text-blue-400 mt-1">{newOrdersCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <span className="text-xs text-slate-400">Confirmed</span>
            <p className="text-xl font-bold text-indigo-400 mt-1">{confirmedOrdersCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <span className="text-xs text-slate-400">In Transit / Shipped</span>
            <p className="text-xl font-bold text-cyan-400 mt-1">{shippedOrdersCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <span className="text-xs text-slate-400">Delivered</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">{deliveredOrdersCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <span className="text-xs text-slate-400">Cancelled</span>
            <p className="text-xl font-bold text-rose-400 mt-1">{cancelledOrdersCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <span className="text-xs text-slate-400">Out of Stock</span>
            <p className="text-xl font-bold text-amber-400 mt-1">{outOfStockProducts.length}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders (7 cols) and Stock Alerts (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table (7 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Recent Customer Orders</h3>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View all orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {filteredOrders.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No orders recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredOrders.slice(0, 6).map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/40">
                      <td className="py-3 font-mono font-bold text-white">{order.orderId}</td>
                      <td className="py-3">
                        <p className="font-semibold text-white truncate max-w-[140px]">
                          {order.customerName}
                        </p>
                        <p className="text-[11px] text-slate-500">{order.customerPhone}</p>
                      </td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-white">{formatINR(order.total)}</td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inventory Stock Alerts (5 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Stock Alerts</span>
            </h3>
            <Link
              to="/admin/inventory"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Audit
            </Link>
          </div>

          {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
              <p className="font-semibold text-slate-400">Inventory levels are healthy</p>
              <p>No products are currently low or out of stock.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {outOfStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-rose-300 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400">SKU: {p.sku}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shrink-0">
                    Out of Stock
                  </span>
                </div>
              ))}

              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-amber-300 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400">
                      SKU: {p.sku} • Threshold: {p.lowStockThreshold}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-900 shrink-0">
                    {p.stock} units left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
