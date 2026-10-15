import React, { useEffect, useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Filter,
  User,
  Package,
} from 'lucide-react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { useToast } from '@/contexts/ToastContext';
import { TableRowSkeleton } from '@/components/common/LoadingSkeleton';

export interface CustomerInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  orderNumber?: string;
  message: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt?: any;
}

export const AdminInquiriesPage: React.FC = () => {
  const { success, error } = useToast();

  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'resolved'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: CustomerInquiry[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CustomerInquiry, 'id'>),
      }));
      setInquiries(list);
    } catch (err: any) {
      // Fallback query if index is pending
      try {
        const snap = await getDocs(collection(db, 'inquiries'));
        const list: CustomerInquiry[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CustomerInquiry, 'id'>),
        }));
        setInquiries(list);
      } catch (innerErr: any) {
        error('Failed to load inquiries', innerErr.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    newStatus: 'new' | 'contacted' | 'resolved'
  ) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      success('Status Updated', `Inquiry marked as ${newStatus}.`);
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer inquiry?')) return;
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
      success('Deleted', 'Customer inquiry removed.');
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inq.name?.toLowerCase().includes(q) ||
        inq.email?.toLowerCase().includes(q) ||
        inq.phone?.toLowerCase().includes(q) ||
        inq.inquiryType?.toLowerCase().includes(q) ||
        inq.message?.toLowerCase().includes(q) ||
        inq.orderNumber?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchQuery, statusFilter]);

  const counts = useMemo(() => {
    const total = inquiries.length;
    const newCount = inquiries.filter((i) => i.status === 'new').length;
    const contactedCount = inquiries.filter((i) => i.status === 'contacted').length;
    const resolvedCount = inquiries.filter((i) => i.status === 'resolved').length;
    return { total, newCount, contactedCount, resolvedCount };
  }, [inquiries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            <span>Customer Inquiries & Messages</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Incoming direct messages submitted through the Contact Us storefront form
          </p>
        </div>

        {/* Status Count Pills */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            Total: <strong className="text-white">{counts.total}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            New: <strong>{counts.newCount}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            Resolved: <strong>{counts.resolvedCount}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search by customer name, email, phone, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {(['all', 'new', 'contacted', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <TableRowSkeleton cols={5} />
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No Inquiries Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'No messages matched your filter criteria.'
              : 'Customer messages submitted via the Contact Us page will be listed here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inquiries Table / List */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800">
              {filteredInquiries.map((inq) => {
                const isSelected = selectedInquiry?.id === inq.id;
                return (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className={`p-5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-800/80 border-l-4 border-blue-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{inq.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              inq.status === 'new'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : inq.status === 'contacted'
                                ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{inq.email}</p>
                      </div>

                      <span className="text-[11px] font-medium text-slate-500 shrink-0">
                        {inq.inquiryType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                      {inq.message}
                    </p>

                    {inq.orderNumber && (
                      <div className="mt-2 text-[11px] font-mono text-blue-400 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        <span>Order: {inq.orderNumber}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inquiry Detail View */}
          <div className="lg:col-span-5 sticky top-24">
            {selectedInquiry ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white">{selectedInquiry.name}</h2>
                    <p className="text-xs text-blue-400 mt-0.5 font-semibold">
                      {selectedInquiry.inquiryType}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedInquiry.id)}
                    title="Delete Inquiry"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Contact Quick Actions */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Regarding your VULMORA inquiry: ${encodeURIComponent(
                      selectedInquiry.inquiryType
                    )}`}
                    className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800 transition-colors flex items-center gap-2.5 text-slate-200"
                  >
                    <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate">Reply via Email</span>
                  </a>

                  {selectedInquiry.phone ? (
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800 transition-colors flex items-center gap-2.5 text-slate-200"
                    >
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">Call Customer</span>
                    </a>
                  ) : (
                    <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 text-slate-500 flex items-center gap-2.5">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>No Phone Provided</span>
                    </div>
                  )}
                </div>

                {selectedInquiry.orderNumber && (
                  <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs space-y-1">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                      Referenced Order ID
                    </span>
                    <span className="font-mono text-white text-xs font-bold">
                      {selectedInquiry.orderNumber}
                    </span>
                  </div>
                )}

                {/* Full Message Text */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Full Customer Message
                  </span>
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Update Processing State:
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      onClick={() => handleUpdateStatus(selectedInquiry.id, 'new')}
                      className={`py-2 px-2.5 rounded-xl font-bold transition-all text-center ${
                        selectedInquiry.status === 'new'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      New
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedInquiry.id, 'contacted')}
                      className={`py-2 px-2.5 rounded-xl font-bold transition-all text-center ${
                        selectedInquiry.status === 'contacted'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Contacted
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedInquiry.id, 'resolved')}
                      className={`py-2 px-2.5 rounded-xl font-bold transition-all text-center ${
                        selectedInquiry.status === 'resolved'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Resolved
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-10 text-center text-xs text-slate-500">
                Select an inquiry from the list on the left to review details and respond.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiriesPage;
