'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { Search, Package, Clock, CheckCircle, XCircle, ChefHat, Truck, ArrowLeft, Receipt, CreditCard, ChevronRight } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { toast } from 'react-hot-toast';

declare global {
    interface Window {
        snap: {
            pay: (token: string, options: {
                onSuccess?: (result: any) => void;
                onPending?: (result: any) => void;
                onError?: (result: any) => void;
                onClose?: () => void;
            }) => void;
        };
    }
}

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
const MIDTRANS_IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
const SNAP_JS_URL = MIDTRANS_IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

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
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    
    const [orderNumber, setOrderNumber] = useState(searchParams.get('q') || '');
    const [order, setOrder] = useState<any>(null);
    const [myOrders, setMyOrders] = useState<any[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [loadingList, setLoadingList] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/track');
            return;
        }
        fetchMyOrders();
    }, [isAuthenticated, router]);

    const fetchMyOrders = async () => {
        try {
            setLoadingList(true);
            const { data } = await ordersApi.getMyOrders();
            setMyOrders(data.data);
        } catch (err) {
            toast.error('Gagal memuat daftar pesanan');
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        const q = searchParams.get('q');
        if (q && isAuthenticated) {
            setOrderNumber(q.toUpperCase());
            doTrack(q.toUpperCase());
        }
    }, [searchParams, isAuthenticated]);

    const doTrack = async (num: string) => {
        if (!num.trim()) return;
        setLoading(true);
        setError('');
        setOrder(null);
        try {
            const res = await ordersApi.trackOrder(num.trim().toUpperCase());
            setOrder(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Pesanan tidak ditemukan.');
        } finally {
            setLoading(false);
        }
    };

    const currentStep = order ? getStepIndex(order.status) : -1;
    const isCancelled = order?.status === 'cancelled';

    const handlePayNow = () => {
        if (order?.snapToken && window.snap) {
            window.snap.pay(order.snapToken, {
                onSuccess: () => {
                    toast.success('Pembayaran berhasil! 🎉');
                    doTrack(order.orderNumber);
                },
                onPending: () => {
                    toast('Menunggu pembayaran...', { icon: '⏳' });
                },
                onError: () => {
                    toast.error('Pembayaran gagal. Silakan coba lagi.');
                },
                onClose: () => {
                    toast('Popup pembayaran ditutup.', { icon: '⚠️' });
                },
            });
        }
    };

    const handleDummyPay = async () => {
        try {
            await ordersApi.dummyPay(order.orderNumber);
            toast.success('Simulasi Pembayaran Berhasil! 🎉');
            doTrack(order.orderNumber);
        } catch (err) {
            toast.error('Gagal simulasi pembayaran');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Midtrans Snap.js Script */}
            <Script
                src={SNAP_JS_URL}
                data-client-key={MIDTRANS_CLIENT_KEY}
                strategy="lazyOnload"
            />

            {/* Page Header */}
            <div className="bg-gradient-to-br from-[var(--color-primary)] to-[#8b0e16] pt-24 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors mb-5">
                        <ArrowLeft size={14} /> Kembali ke Beranda
                    </Link>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Cek Status Pesanan</h1>
                    <p className="text-white/70 mt-1 text-sm">Masukkan nomor pesanan untuk melihat status terkini</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 pb-16">

                {/* Error State */}
                {error && (
                    <div className="bg-[var(--color-50)] border border-[var(--color-200)] rounded-2xl p-6 text-center mb-6">
                        <XCircle size={40} className="text-red-400 mx-auto mb-3" />
                        <h3 className="font-bold text-red-800 mb-1">Terjadi Kesalahan</h3>
                        <p className="text-[var(--color-hover)] text-sm">{error}</p>
                        <button onClick={() => { setError(''); setOrderNumber(''); }} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold">Kembali ke Daftar</button>
                    </div>
                )}

                {/* List Orders (ketika belum milih order) */}
                {!order && !error && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">Daftar Pesanan Anda</h2>
                        </div>
                        {loadingList ? (
                            <div className="p-10 flex justify-center">
                                <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
                            </div>
                        ) : myOrders.length === 0 ? (
                            <div className="p-10 text-center">
                                <Receipt size={40} className="text-gray-300 mx-auto mb-3" />
                                <h3 className="font-bold text-gray-700 mb-1">Belum ada pesanan</h3>
                                <p className="text-gray-400 text-sm mb-5">Anda belum pernah melakukan pemesanan.</p>
                                <Link href="/menu" className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-[var(--color-hover)] transition-colors inline-block">Mulai Pesan</Link>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-50">
                                {myOrders.map((o) => (
                                    <li key={o.id}>
                                        <button onClick={() => { setOrderNumber(o.orderNumber); doTrack(o.orderNumber); }} className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono font-bold text-[var(--color-primary)]">{o.orderNumber}</span>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${getStatusColor(o.status)}`}>{getStatusLabel(o.status)}</span>
                                                </div>
                                                <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                                <p className="text-sm font-semibold text-gray-800 mt-1">{o.items.length} item • {formatCurrency(o.total)}</p>
                                            </div>
                                            <ChevronRight size={20} className="text-gray-300" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
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
                                    <h2 className="text-2xl font-extrabold text-[var(--color-primary)] font-mono tracking-wider">{order.orderNumber}</h2>
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
                                    <p className="font-bold text-[var(--color-primary)]">{formatCurrency(order.total)}</p>
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
                                            className="h-full bg-[var(--color-primary)] transition-all duration-700"
                                            style={{ width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                                        />
                                    </div>
                                    <div className="relative flex justify-between">
                                        {STATUS_STEPS.map((step, i) => {
                                            const Icon = step.icon;
                                            const done = i <= currentStep;
                                            const active = i === currentStep;
                                            return (
                                                <div key={step.key} className="flex flex-col items-center gap-2 w-12 sm:w-16 z-10 bg-white">
                                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${done ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[0_8px_24px_rgba(var(--color-rgb),0.15)]' : 'bg-gray-100 text-gray-400'} ${active ? 'scale-110 ring-4 ring-[var(--color-100)]' : ''}`}>
                                                        <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                                                    </div>
                                                    <span className={`text-[9px] sm:text-[10px] text-center font-semibold leading-tight ${done ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                {order.estimatedTime && order.status === 'preparing' && (
                                    <div className="mt-5 bg-[var(--color-50)] rounded-xl px-4 py-3 flex items-center gap-2">
                                        <Clock size={16} className="text-[var(--color-primary)] shrink-0" />
                                        <p className="text-sm text-[var(--color-primary)] font-medium">Estimasi siap dalam ~{order.estimatedTime} menit</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-[var(--color-50)] border border-[var(--color-200)] rounded-2xl p-5 flex items-center gap-3">
                                <XCircle size={24} className="text-[var(--color-primary)] shrink-0" />
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
                                <span className="text-[var(--color-primary)]">{formatCurrency(order.total)}</span>
                            </div>
                        </div>

                        {/* Pay Now button for pending online payments */}
                        {order.paymentStatus !== 'paid' && order.paymentMethod !== 'cash' && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">Pembayaran Belum Selesai</h3>
                                        <p className="text-xs text-gray-400">Klik tombol di bawah untuk melanjutkan pembayaran</p>
                                    </div>
                                </div>
                                
                                {order.snapToken && (
                                    <button onClick={handlePayNow}
                                        className="w-full py-3.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-md flex items-center justify-center gap-2 mb-2">
                                        <CreditCard size={16} /> Bayar Sekarang (Midtrans)
                                    </button>
                                )}
                                
                                <button onClick={handleDummyPay}
                                    className="w-full py-3.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-md flex items-center justify-center gap-2">
                                    <CheckCircle size={16} /> Simulasi Pembayaran (Dummy Dev)
                                </button>
                            </div>
                        )}

                        {/* Back to order */}
                        <div className="flex items-center justify-center gap-3">
                            <button onClick={() => { setOrder(null); setOrderNumber(''); }} className="px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all shadow-sm">
                                Kembali ke Daftar
                            </button>
                            <Link href="/menu" className="px-8 py-4 bg-[var(--color-primary)] text-white rounded-2xl font-bold hover:bg-[var(--color-hover)] transition-all shadow-lg shadow-[0_8px_24px_rgba(var(--color-rgb),0.15)] hover:scale-[1.02]">
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
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" /></div>}>
            <TrackContent />
        </Suspense>
    );
}
