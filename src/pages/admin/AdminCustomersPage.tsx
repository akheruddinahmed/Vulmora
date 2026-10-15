import React, { useEffect, useState, useMemo } from 'react';
import { Users, Search, ShoppingBag, Mail, Phone, Calendar, ArrowUpDown } from 'lucide-react';
import { CustomerWithStats, getAllCustomersAdmin } from '@/services/users/userService';
import { formatINR, formatDate } from '@/utils/formatters';
import { useToast } from '@/contexts/ToastContext';
import { TableRowSkeleton } from '@/components/common/LoadingSkeleton';

export const AdminCustomersPage: React.FC = () => {
  const { error } = useToast();

  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const data = await getAllCustomersAdmin();
        setCustomers(data);
      } catch (err: any) {
        error('Failed to load customers', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        c.fullName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
      );
    });
  }, [customers, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {customers.length} verified customer account(s) • Spending metrics and order engagement history
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by customer name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-slate-900/80">
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Contact</th>
                <th className="py-3.5 px-4 font-semibold">Joined On</th>
                <th className="py-3.5 px-4 font-semibold">Total Orders</th>
                <th className="py-3.5 px-4 font-semibold">Total Spent (COD)</th>
                <th className="py-3.5 px-4 font-semibold text-right">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {isLoading ? (
                <>
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                </>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.uid} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {cust.fullName?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-[150px]">
                            {cust.fullName || 'Registered User'}
                          </p>
                          <p className="text-[11px] font-mono text-slate-500 truncate max-w-[150px]">
                            {cust.uid.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-slate-300 truncate max-w-[180px]">{cust.email}</p>
                      {cust.phone && (
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          +91 {cust.phone}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(cust.createdAt)}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-white">{cust.totalOrders}</span>{' '}
                      <span className="text-slate-500">order(s)</span>
                    </td>

                    <td className="py-3 px-4 font-extrabold text-emerald-400">
                      {formatINR(cust.totalSpent)}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap">
                      {cust.lastOrderDate ? formatDate(cust.lastOrderDate) : 'No orders yet'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
