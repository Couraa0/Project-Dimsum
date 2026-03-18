'use client';
import { useState, useEffect } from 'react';
import { RefreshCw, Filter, Eye, ChevronDown } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/types';
import { formatCurrency, getStatusColor, getStatusLabel, getTypeLabel, timeAgo } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
const STATUS_FLOW: Record<string, string> = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'delivered' };

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        const params: Record<string, string> = {};
        if (statusFilter) params.status = statusFilter;
        if (typeFilter) params.type = typeFilter;
        ordersApi.getAll(params).then(res => setOrders(res.data.data)).finally(() => setLoading(false));
    };

    useEffect(load, [statusFilter, typeFilter]);
    useEffect(() => { const t = setInterval(load, 30000); return () => clearInterval(t); }, [statusFilter, typeFilter]);

    const updateStatus = async (id: string, status: string) => {
        if (!window.confirm(`Ubah status pesanan menjadi ${getStatusLabel(status)}?`)) return;
        setUpdatingId(id);
        try {
            await ordersApi.updateStatus(id, status);
            toast.success(`Status diperbarui: ${getStatusLabel(status)}`);
            load();
            if (selectedOrder?._id === id) setSelectedOrder(prev => prev ? { ...prev, status: status as any } : null);
        } catch { toast.error('Gagal update status'); }
        finally { setUpdatingId(null); }
    };

    const updatePayment = async (id: string, paymentStatus: string) => {
        if (!window.confirm(`Ubah status pembayaran menjadi Lunas?`)) return;
        await ordersApi.updatePayment(id, paymentStatus);
        toast.success('Status pembayaran diperbarui!');
        load();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-gray-900">Kelola Pesanan</h1>
                    <p className="text-gray-400 text-sm mt-1">{orders.length} pesanan</p></div>
                <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C1121F] bg-white">
                    <option value="">Semua Status</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                </select>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C1121F] bg-white">
                    <option value="">Semua Tipe</option>
                    <option value="dine-in">Dine In</option>
                    <option value="takeaway">Take Away</option>
                    <option value="delivery">Delivery</option>
                </select>
                {/* Status count pills */}
                <div className="flex gap-2 flex-wrap">
                    {['pending', 'preparing'].map(s => {
                        const cnt = orders.filter(o => o.status === s).length;
                        return cnt > 0 ? (
                            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(s)} border`}>
                                {cnt} {getStatusLabel(s)}
                            </button>
                        ) : null;
                    })}
                </div>
            </div>

            {/* Grid Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Orders List */}
                <div className={`${selectedOrder ? 'w-full lg:w-1/2' : 'w-full'} transition-all`}>
                    {loading ? (
                        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl">
                            <div className="text-4xl mb-2">📋</div><p>Tidak ada pesanan</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map(order => (
                                <div key={order._id} onClick={() => setSelectedOrder(order)}
                                    className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-all ${selectedOrder?._id === order._id ? 'border-[#C1121F] ring-2 ring-red-100' : 'border-gray-100'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <span className="font-bold text-gray-800 text-sm">{order.orderNumber}</span>
                                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">{timeAgo(order.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-gray-500">
                                            {order.customer.name} · {getTypeLabel(order.type)} {order.tableNumber ? `· Meja ${order.tableNumber}` : ''}
                                        </div>
                                        <div className="font-bold text-[#C1121F] text-sm">{formatCurrency(order.total)}</div>
                                    </div>
                                    {/* Quick action */}
                                    {STATUS_FLOW[order.status] && (
                                        <button onClick={e => { e.stopPropagation(); updateStatus(order._id, STATUS_FLOW[order.status]); }}
                                            disabled={updatingId === order._id}
                                            className="mt-3 w-full py-2 bg-[#C1121F] text-white rounded-xl text-xs font-semibold hover:bg-[#a50f1a] transition-colors disabled:opacity-50">
                                            {updatingId === order._id ? '...' : `→ ${getStatusLabel(STATUS_FLOW[order.status])}`}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Order Detail */}
                {selectedOrder && (
                    <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-fit sticky top-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-gray-900">{selectedOrder.orderNumber}</h3>
                                <p className="text-sm text-gray-400">{timeAgo(selectedOrder.createdAt)}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        {/* Info */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="text-xs text-gray-400 mb-1">Tipe</div>
                                <div className="font-semibold text-sm">{getTypeLabel(selectedOrder.type)}</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="text-xs text-gray-400 mb-1">Pembayaran</div>
                                <div className="font-semibold text-sm capitalize">{selectedOrder.paymentMethod}</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="text-xs text-gray-400 mb-1">Pelanggan</div>
                                <div className="font-semibold text-sm">{selectedOrder.customer.name || '-'}</div>
                            </div>
                            {selectedOrder.tableNumber && (
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <div className="text-xs text-gray-400 mb-1">Meja</div>
                                    <div className="font-semibold text-sm">{selectedOrder.tableNumber}</div>
                                </div>
                            )}
                        </div>
                        {/* Items */}
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Item Pesanan</h4>
                            <div className="space-y-2">
                                {selectedOrder.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-gray-700">{item.name} × {item.quantity}</span>
                                        <span className="font-semibold text-gray-800">{formatCurrency(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-bold">
                                <span>Total</span><span className="text-[#C1121F]">{formatCurrency(selectedOrder.total)}</span>
                            </div>
                        </div>
                        {/* Status Controls */}
                        <div className="space-y-2">
                            <select value={selectedOrder.status} onChange={e => updateStatus(selectedOrder._id, e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C1121F]">
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                            </select>
                            <div className="flex gap-2">
                                <button onClick={() => updatePayment(selectedOrder._id, 'paid')} disabled={selectedOrder.paymentStatus === 'paid'}
                                    className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 disabled:opacity-40 transition-colors">
                                    ✅ Tandai Lunas
                                </button>
                                <button onClick={() => updateStatus(selectedOrder._id, 'cancelled')}
                                    className="flex-1 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
                                    ❌ Batalkan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
