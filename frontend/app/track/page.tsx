'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, Clock, CheckCircle, XCircle, ChefHat, Truck, ArrowLeft, Receipt } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

const STATUS_STEPS = [
    { key: 'pending', label: 'Diterima', icon: Receipt },
    { key: 'confirmed', label: 'Dikonfirmasi', icon: CheckCircle },
    { key: 'preparing', label: 'Dimasak', icon: ChefHat },
    { key: 'ready', label: 'Siap', icon: Package },
    { key: 'delivered', label: 'Selesai', icon: Truck },
];

function getStepIndex(status: string) {
    return STATUS_STEPS.findIndex(s => s.key === status);
}

function TrackContent() {
    const searchParams = useSearchParams();
    const [orderNumber, setOrderNumber] = useState(searchParams.get('q') || '');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    // Auto-search jika ada query param ?q=
    useEffect(() => {
        const q = searchParams.get('q');
        if (q) {
            setOrderNumber(q.toUpperCase());
            doTrack(q.toUpperCase());
        }
    }, []);

    const doTrack = async (num: string) => {
        if (!num.trim()) return;
        setLoading(true);
        setError('');
        setOrder(null);
        setSearched(true);
        try {
            const res = await ordersApi.trackOrder(num.trim().toUpperCase());
            setOrder(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Pesanan tidak ditemukan. Pastikan nomor pesanan benar.');
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        doTrack(orderNumber);
    };

    const currentStep = order ? getStepIndex(order.status) : -1;
    const isCancelled = order?.status === 'cancelled';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-gradient-to-br from-[#C1121F] to-[#8b0e16] pt-24 pb-10">
                <div className="max-w-2xl mx-auto px-4 sm:px-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors mb-5">
                        <ArrowLeft size={14} /> Kembali ke Beranda
                    </Link>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Cek Status Pesanan</h1>
                    <p className="text-white/70 mt-1 text-sm">Masukkan nomor pesanan untuk melihat status terkini</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-6 pb-16">

                {/* Search Form */}
                <form onSubmit={handleTrack} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
                    <label className="block text-sm font-bold text-gray-800 mb-3">Nomor Pesanan</label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Contoh: DR202503020001"
                            value={orderNumber}
                            onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                            className="flex-1 px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C1121F] focus:ring-2 focus:ring-red-100 text-sm font-mono tracking-wider bg-gray-50"
                        />
                        <button type="submit" disabled={loading || !orderNumber.trim()}
                            className="px-6 py-3.5 bg-[#C1121F] text-white rounded-xl font-bold hover:bg-[#a50f1a] disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-red-200 hover:scale-[1.02]">
                            {loading
                                ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                : <Search size={18} />
                            }
                            <span className="hidden sm:inline">Cek</span>
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2.5">Nomor pesanan dapat ditemukan di struk atau notifikasi pesanan Anda</p>
                </form>

                {/* Error State */}
                {searched && !loading && error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                        <XCircle size={40} className="text-red-400 mx-auto mb-3" />
                        <h3 className="font-bold text-red-800 mb-1">Pesanan Tidak Ditemukan</h3>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Empty state (belum search) */}
                {!searched && !order && (
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                        <div className="w-16 h-16 bg-red-50 text-[#C1121F] rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Receipt size={28} />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">Belum ada pencarian</h3>
                        <p className="text-gray-400 text-sm">Masukkan nomor pesanan di atas untuk melihat status dan detail pesanan Anda</p>
                        <div className="mt-5 grid grid-cols-3 gap-3 pt-5 border-t border-gray-100">
                            {[{ icon: <CheckCircle size={18} />, label: 'Status Real-time' }, { icon: <Package size={18} />, label: 'Detail Item' }, { icon: <Clock size={18} />, label: 'Estimasi Waktu' }].map((tip, i) => (
                                <div key={i} className="text-center">
                                    <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center mx-auto mb-2">{tip.icon}</div>
                                    <p className="text-xs text-gray-400 font-medium">{tip.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Order Result */}
                {order && (
                    <div className="space-y-5">
                        {/* Order Header */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-1">Nomor Pesanan</p>
                                    <h2 className="text-2xl font-extrabold text-[#C1121F] font-mono tracking-wider">{order.orderNumber}</h2>
                                </div>
                                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400 text-xs mb-0.5">Pelanggan</p>
                                    <p className="font-semibold text-gray-800">{order.customer?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs mb-0.5">Jenis Pesanan</p>
                                    <p className="font-semibold text-gray-800 capitalize">
                                        {order.type === 'dine-in' ? 'Dine In' : order.type === 'takeaway' ? 'Take Away' : 'Delivery'}
                                        {order.tableNumber ? ` · Meja ${order.tableNumber}` : ''}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs mb-0.5">Total Pembayaran</p>
                                    <p className="font-bold text-[#C1121F]">{formatCurrency(order.total)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs mb-0.5">Status Bayar</p>
                                    <p className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {order.paymentStatus === 'paid' ? '✓ Lunas' : '⏳ Belum Bayar'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Tracker */}
                        {!isCancelled ? (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-5 text-sm">Progress Pesanan</h3>
                                <div className="relative">
                                    {/* Line */}
                                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100">
                                        <div
                                            className="h-full bg-[#C1121F] transition-all duration-700"
                                            style={{ width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                                        />
                                    </div>
                                    <div className="relative flex justify-between">
                                        {STATUS_STEPS.map((step, i) => {
                                            const Icon = step.icon;
                                            const done = i <= currentStep;
                                            const active = i === currentStep;
                                            return (
                                                <div key={step.key} className="flex flex-col items-center gap-2 w-16">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${done ? 'bg-[#C1121F] text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-400'} ${active ? 'scale-110 ring-4 ring-red-100' : ''}`}>
                                                        <Icon size={18} />
                                                    </div>
                                                    <span className={`text-[10px] text-center font-semibold leading-tight ${done ? 'text-[#C1121F]' : 'text-gray-400'}`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                {order.estimatedTime && order.status === 'preparing' && (
                                    <div className="mt-5 bg-red-50 rounded-xl px-4 py-3 flex items-center gap-2">
                                        <Clock size={16} className="text-[#C1121F] shrink-0" />
                                        <p className="text-sm text-[#C1121F] font-medium">Estimasi siap dalam ~{order.estimatedTime} menit</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3">
                                <XCircle size={24} className="text-red-500 shrink-0" />
                                <p className="text-red-700 font-semibold text-sm">Pesanan ini telah dibatalkan.</p>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 text-sm">Detail Item</h3>
                            <div className="space-y-3">
                                {order.items?.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                                            {item.menuItem?.image ? (
                                                <Image src={getImageUrl(item.menuItem.image)} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl">🥟</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                                            <p className="text-gray-400 text-xs">{item.quantity}x · {formatCurrency(item.price)}</p>
                                        </div>
                                        <p className="font-bold text-gray-800 text-sm">{formatCurrency(item.subtotal)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900">
                                <span>Total</span>
                                <span className="text-[#C1121F]">{formatCurrency(order.total)}</span>
                            </div>
                        </div>

                        {/* Back to order */}
                        <div className="text-center">
                            <Link href="/menu" className="inline-flex items-center gap-2 px-8 py-4 bg-[#C1121F] text-white rounded-2xl font-bold hover:bg-[#a50f1a] transition-all shadow-lg shadow-red-200 hover:scale-[1.02]">
                                Pesan Lagi
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#C1121F] border-t-transparent rounded-full animate-spin" /></div>}>
            <TrackContent />
        </Suspense>
    );
}
