'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/store/settingsStore';

import {
    ArrowLeft, CheckCircle, ChevronRight,
    Banknote, Smartphone, CreditCard,
    User, Phone, MapPin, FileText,
    UtensilsCrossed, Package, Truck,
    Copy, Check, Printer, ExternalLink
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { ordersApi } from '@/lib/api';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

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

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Bayar di Kasir', icon: Banknote, desc: 'Bayar tunai saat di tempat' },
    { value: 'qris', label: 'QRIS / E-Wallet', icon: Smartphone, desc: 'GoPay, OVO, Dana, ShopeePay' },
    { value: 'transfer', label: 'Transfer Bank', icon: CreditCard, desc: 'BCA, Mandiri, BNI, BRI' },
] as const;

type Step = 'info' | 'payment' | 'success';

const ORDER_TYPE_LABEL: Record<string, string> = {
    'dine-in': 'Dine In',
    'takeaway': 'Take Away',
    'delivery': 'Delivery',
};

export default function OrderPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const settings = useSettingsStore(s => s.settings);
    const storeName = (mounted && settings?.storeName) ? settings.storeName : 'Dimsum Ratu';

    const [step, setStep] = useState<Step>('info');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [orderSnapshot, setOrderSnapshot] = useState<{
        type: string; paymentMethod: string; tableNumber: string;
        customer: { name: string; phone: string; address?: string; notes?: string };
        items: { name: string; quantity: number; price: number }[];
        total: number;
        createdAt: string;
    } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const {
        items, orderType, paymentMethod, customer, tableNumber,
        setPaymentMethod, setCustomer, clearCart,
        getTotal, getCount,
    } = useCartStore();
    const { user } = useAuthStore();

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Memuat halaman...</p>
                </div>
            </div>
        );
    }

    const subtotal = getTotal();
    const taxRate = settings?.taxRate ?? 10;
    const tax = Math.round(subtotal * (taxRate / 100));
    const total = subtotal + tax;
    const count = getCount();

    /* ── redirect if empty ───────────────────────────────── */
    if (items.length === 0 && step !== 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <div className="text-5xl mb-4">🛒</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Keranjang kosong</h2>
                    <Link href="/menu" className="text-[var(--color-primary)] font-semibold hover:underline">
                        Pilih menu terlebih dahulu →
                    </Link>
                </div>
            </div>
        );
    }

    /* ── submit order ────────────────────────────────────── */
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const orderCustomer = { ...customer, email: user?.email, name: customer.name || user?.name || 'Guest', phone: customer.phone || '' };
            
            // simpan snapshot SEBELUM clearCart()
            const snap = {
                type: orderType,
                paymentMethod,
                tableNumber,
                customer: orderCustomer,
                items: items.map(i => ({ name: i.menuItem.name, quantity: i.quantity, price: i.menuItem.price })),
                subtotal,
                tax,
                total,
                createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }),
            };
            const res = await ordersApi.create({
                type: orderType,
                paymentMethod,
                tableNumber,
                customer: orderCustomer,
                items: items.map(i => ({
                    menuItemId: i.menuItem._id,
                    name: i.menuItem.name,
                    quantity: i.quantity,
                    notes: i.notes,
                })),
            });

            const orderData = res.data.data;
            const snapToken = orderData.snapToken;

            // Jika pembayaran online (bukan cash) dan ada snapToken → buka Midtrans Snap
            if (paymentMethod !== 'cash' && snapToken && window.snap) {
                window.snap.pay(snapToken, {
                    onSuccess: () => {
                        setIsPaid(true);
                        setOrderNumber(orderData.orderNumber);
                        setOrderSnapshot(snap);
                        clearCart();
                        setStep('success');
                        toast.success('Pembayaran berhasil! 🎉');
                    },
                    onPending: () => {
                        setIsPaid(false);
                        setOrderNumber(orderData.orderNumber);
                        setOrderSnapshot(snap);
                        clearCart();
                        setStep('success');
                        toast('Menunggu pembayaran...', { icon: '⏳' });
                    },
                    onError: () => {
                        setIsPaid(false);
                        toast.error('Pembayaran gagal. Anda bisa mencoba lagi dari halaman Cek Pesanan.');
                        setOrderNumber(orderData.orderNumber);
                        setOrderSnapshot(snap);
                        clearCart();
                        setStep('success');
                    },
                    onClose: () => {
                        // Popup ditutup tanpa selesai bayar
                        setIsPaid(false);
                        toast('Pembayaran belum selesai. Anda bisa melanjutkan dari halaman Cek Pesanan.', { icon: '⚠️' });
                        setOrderNumber(orderData.orderNumber);
                        setOrderSnapshot(snap);
                        clearCart();
                        setStep('success');
                    },
                });
            } else {
                // Cash payment — langsung sukses
                setIsPaid(true);
                setOrderNumber(orderData.orderNumber);
                setOrderSnapshot(snap);
                clearCart();
                setStep('success');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal membuat pesanan. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleDummyPaySuccessPage = async () => {
        try {
            await ordersApi.dummyPay(orderNumber);
            setIsPaid(true);
            toast.success('Simulasi Pembayaran Berhasil! 🎉');
        } catch (err) {
            toast.error('Gagal simulasi pembayaran');
        }
    };



    /* ── helper: salin nomor pesanan ───────────────────── */
    const handleCopy = () => {
        navigator.clipboard.writeText(orderNumber).then(() => {
            setCopied(true);
            toast.success('Nomor pesanan disalin!');
            setTimeout(() => setCopied(false), 2500);
        });
    };

    /* ── helper: cetak struk ───────────────────────────── */
    const handlePrint = () => window.print();

    /* ── SUCCESS ──────────────────────────────────────────── */
    if (step === 'success') return (
        <div className="min-h-screen bg-gray-50">

            {/* ─ Print style: sembunyikan tombol saat print ── */}
            <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

            {/* Hero */}
            <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-hover)] pt-12 pb-20 no-print">
                <div className="max-w-md mx-auto px-4 text-center">
                    <div className="w-20 h-20 bg-white/15 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                        <CheckCircle size={42} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white mb-2">Pesanan Berhasil!</h1>
                    <p className="text-white/65 text-sm">Pesanan Anda sedang diproses oleh dapur kami</p>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 -mt-10 pb-16 print:mt-0 print:max-w-full print:px-6">

                {/* ─ Struk / Receipt ───────────────────────── */}
                <div id="receipt" className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

                    {/* Receipt header */}
                    <div className="text-center px-6 pt-6 pb-4 border-b border-dashed border-gray-200">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{storeName}</p>
                        <p className="text-[10px] text-gray-400">{orderSnapshot?.createdAt ?? new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                        <p className="text-xs text-gray-400 mt-1">Nomor Pesanan</p>
                        {/* Order number + copy button */}
                        <div className="flex items-center justify-center gap-2 mt-1 mb-1">
                            <span className="text-2xl font-extrabold text-[var(--color-primary)] font-mono tracking-wider">{orderNumber}</span>
                            <button onClick={handleCopy} title="Salin nomor pesanan"
                                className="no-print w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-[var(--color-50)] hover:text-[var(--color-primary)] transition-colors">
                                {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} className="text-gray-500" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400">Simpan untuk cek status pesanan</p>
                    </div>

                    {/* Order info */}
                    {orderSnapshot && (
                        <>
                            <div className="px-6 py-4 space-y-2 text-sm border-b border-dashed border-gray-200">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Jenis</span>
                                    <span className="font-semibold text-gray-800">
                                        {ORDER_TYPE_LABEL[orderSnapshot.type]}
                                        {orderSnapshot.type === 'dine-in' && orderSnapshot.tableNumber ? ` · Meja ${orderSnapshot.tableNumber}` : ''}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Pembayaran</span>
                                    <span className="font-semibold text-gray-800">
                                        {PAYMENT_METHODS.find(p => p.value === orderSnapshot.paymentMethod)?.label ?? orderSnapshot.paymentMethod}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Nama</span>
                                    <span className="font-semibold text-gray-800">{orderSnapshot.customer.name}</span>
                                </div>
                                {orderSnapshot.customer.phone && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">No. HP</span>
                                        <span className="font-semibold text-gray-800">{orderSnapshot.customer.phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Items */}
                            <div className="px-6 py-4 border-b border-dashed border-gray-200">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Item Pesanan</p>
                                <div className="space-y-2">
                                    {orderSnapshot.items.map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                                            <span className="font-semibold text-gray-800">{formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="px-6 py-4 flex justify-between items-center">
                                <span className="font-extrabold text-gray-800">TOTAL</span>
                                <span className="text-xl font-extrabold text-[var(--color-primary)]">{formatCurrency(orderSnapshot.total)}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* ─ Action buttons ───────────────────────────── */}
                <div className="no-print mt-4 grid grid-cols-2 gap-3">
                    {/* Salin */}
                    <button onClick={handleCopy}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-200 font-semibold text-sm text-gray-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all">
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        {copied ? 'Tersalin!' : 'Salin No.'}
                    </button>
                    {/* Simpan Struk / Print */}
                    <button onClick={handlePrint}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-200 font-semibold text-sm text-gray-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all">
                        <Printer size={16} /> Simpan Struk
                    </button>
                </div>

                {/* ─ Nav buttons ──────────────────────────────── */}
                <div className="no-print mt-3 flex flex-col gap-3">
                    {orderSnapshot?.paymentMethod !== 'cash' && !isPaid && (
                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                            <p className="text-xs text-amber-700 font-medium mb-3 text-center">Pembayaran belum diselesaikan. Simulasi untuk Dev:</p>
                            <button onClick={handleDummyPaySuccessPage}
                                className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow flex items-center justify-center gap-2">
                                <CheckCircle size={16} /> Lunas (Dummy Dev)
                            </button>
                        </div>
                    )}
                    <Link href={`/track?q=${orderNumber}`}
                        className="w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-bold hover:bg-[var(--color-hover)] transition-all shadow-lg shadow-[0_8px_24px_rgba(var(--color-rgb),0.15)] flex items-center justify-center gap-2 hover:scale-[1.01]">
                        <ExternalLink size={16} /> Pantau Status Pesanan
                    </Link>
                    <Link href="/menu"
                        className="w-full py-3.5 border-2 border-gray-200 text-gray-600 rounded-2xl font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all flex items-center justify-center">
                        Pesan Lagi
                    </Link>
                    <Link href="/" className="text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">
                        Kembali ke Beranda
                    </Link>
                </div>

            </div>
        </div>
    );

    /* ── STEP BAR ────────────────────────────────────────── */
    const STEPS = [
        { key: 'info', num: 1, label: 'Info' },
        { key: 'payment', num: 2, label: 'Bayar' },
    ];
    const stepIdx = STEPS.findIndex(s => s.key === step);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Midtrans Snap.js Script */}
            <Script
                src={SNAP_JS_URL}
                data-client-key={MIDTRANS_CLIENT_KEY}
                strategy="lazyOnload"
            />

            {/* Header ─────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 pt-5 pb-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center gap-4 mb-6">
                        {step === 'info' ? (
                            <Link href="/cart"
                                className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-colors text-gray-500">
                                <ArrowLeft size={18} />
                            </Link>
                        ) : (
                            <button onClick={() => setStep('info')}
                                className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-colors text-gray-500">
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <div>
                            <h1 className="text-xl font-extrabold text-gray-900 leading-none">
                                {step === 'info' ? 'Informasi Pemesan' : 'Metode Pembayaran'}
                            </h1>
                            <p className="text-xs text-gray-400 mt-1.5 font-medium">
                                {step === 'info' ? 'Lengkapi data diri untuk pesanan ini' : 'Konfirmasi dan selesaikan pembayaran'}
                            </p>
                        </div>
                    </div>

                    {/* Progress steps */}
                    <div className="flex gap-3">
                        {STEPS.map((s, i) => {
                            const done = i < stepIdx;
                            const active = i === stepIdx;
                            return (
                                <div key={s.key} className="flex-1 relative">
                                    <div className={`text-[11px] uppercase tracking-widest font-extrabold mb-2.5 ${active ? 'text-[var(--color-primary)]' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                                        Tahap {s.num} • {s.label}
                                    </div>
                                    <div className={`h-1.5 rounded-full transition-all duration-300 ${active ? 'bg-[var(--color-primary)] shadow-[0_2px_10px_rgba(var(--color-rgb),0.2)]' : done ? 'bg-[var(--color-primary)] opacity-30' : 'bg-gray-100'}`} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                    {/* ── KIRI: Form Input ───────────────────────── */}
                    <div className="lg:col-span-2 space-y-6">
                        {step === 'info' && (
                            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2">
                                    <User className="text-[var(--color-primary)]" size={18} />
                                    <h2 className="text-base font-bold text-gray-800">Data Pemesan</h2>
                                </div>
                                <div className="p-6 space-y-5">
                                    {/* name */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            Nama Lengkap <span className="text-[var(--color-primary)]">*</span>
                                        </label>
                                        <input type="text" placeholder="Contoh: Budi Santoso"
                                            value={customer.name}
                                            onChange={e => setCustomer({ name: e.target.value })}
                                            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-100)] bg-gray-50/50 hover:bg-white transition-all" />
                                    </div>
                                    {/* phone */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            No. HP / WhatsApp
                                        </label>
                                        <input type="tel" placeholder="Contoh: 08123456789"
                                            value={customer.phone}
                                            onChange={e => setCustomer({ phone: e.target.value })}
                                            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-100)] bg-gray-50/50 hover:bg-white transition-all" />
                                    </div>
                                    {/* address (delivery only) */}
                                    {orderType === 'delivery' && (
                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                Alamat Pengiriman <span className="text-[var(--color-primary)]">*</span>
                                            </label>
                                            <textarea rows={3} placeholder="Masukkan alamat lengkap pengiriman..."
                                                value={customer.address}
                                                onChange={e => setCustomer({ address: e.target.value })}
                                                className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-100)] bg-gray-50/50 hover:bg-white resize-none transition-all" />
                                        </div>
                                    )}
                                    {/* notes */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            Catatan Tambahan
                                        </label>
                                        <textarea rows={2} placeholder="Contoh: tidak pedas, tanpa bawang..."
                                            value={customer.notes}
                                            onChange={e => setCustomer({ notes: e.target.value })}
                                            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-100)] bg-gray-50/50 hover:bg-white resize-none transition-all" />
                                    </div>
                                </div>
                            </section>
                        )}

                        {step === 'payment' && (
                            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2">
                                    <CreditCard className="text-[var(--color-primary)]" size={18} />
                                    <h2 className="text-base font-bold text-gray-800">Pilih Metode Pembayaran</h2>
                                </div>
                                <div className="p-6 space-y-3">
                                    {PAYMENT_METHODS.map(({ value, label, icon: Icon, desc }) => {
                                        const active = paymentMethod === value;
                                        const isOnline = value !== 'cash';
                                        return (
                                            <button key={value} onClick={() => setPaymentMethod(value)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${active ? 'border-[var(--color-primary)] bg-[var(--color-50)]' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}>
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    <Icon size={22} />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-base font-bold ${active ? 'text-[var(--color-primary)]' : 'text-gray-800'}`}>{label}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${active ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-gray-200'}`}>
                                                    {active && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* ── KANAN: Ringkasan & CTA ───────────────────────── */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {step === 'info' && (
                            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileText size={16} className="text-gray-400" /> Ringkasan Pesanan
                                </h2>
                                <div className="space-y-3.5 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Jenis Pesanan</span>
                                        <div className="flex items-center gap-1.5 font-semibold text-gray-800 bg-gray-50 px-2 py-1 rounded-lg">
                                            {orderType === 'dine-in' && <UtensilsCrossed size={14} className="text-[var(--color-primary)]" />}
                                            {orderType === 'takeaway' && <Package size={14} className="text-[var(--color-primary)]" />}
                                            {orderType === 'delivery' && <Truck size={14} className="text-[var(--color-primary)]" />}
                                            {ORDER_TYPE_LABEL[orderType]}
                                            {orderType === 'dine-in' && tableNumber && <span className="text-gray-400">· Meja {tableNumber}</span>}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Jumlah Item</span>
                                        <span className="font-semibold text-gray-800">{count} item</span>
                                    </div>
                                    <div className="flex justify-between pt-4 border-t border-dashed border-gray-200">
                                        <span className="font-bold text-gray-800">Total Harga</span>
                                        <span className="font-extrabold text-[var(--color-primary)] text-lg">{formatCurrency(total)}</span>
                                    </div>
                                </div>

                                {/* CTA button inside sticky card */}
                                <button onClick={() => {
                                    if (!customer.name.trim()) return toast.error('Nama wajib diisi');
                                    if (orderType === 'delivery' && !customer.address?.trim()) return toast.error('Alamat pengiriman wajib diisi');
                                    setStep('payment');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }} className="mt-6 w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-bold hover:bg-[var(--color-hover)] transition-all shadow-lg shadow-[0_8px_24px_rgba(var(--color-rgb),0.15)] flex items-center justify-center gap-2 hover:scale-[1.01]">
                                    Lanjut Pembayaran <ChevronRight size={17} />
                                </button>
                            </section>
                        )}

                        {step === 'payment' && (
                            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileText size={16} className="text-gray-400" /> Konfirmasi Akhir
                                </h2>
                                
                                <div className="space-y-3 text-sm pb-4 border-b border-gray-100">
                                    <div className="flex justify-between"><span className="text-gray-500">Pemesan</span><span className="font-semibold text-gray-800 text-right">{customer.name}</span></div>
                                    {customer.phone && <div className="flex justify-between"><span className="text-gray-500">No. HP</span><span className="font-semibold text-gray-800 text-right">{customer.phone}</span></div>}
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Pesanan</span>
                                        <span className="font-semibold text-[var(--color-primary)] text-right">
                                            {ORDER_TYPE_LABEL[orderType]}{orderType === 'dine-in' && tableNumber ? ` · Meja ${tableNumber}` : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Metode</span>
                                        <span className="font-semibold text-gray-800 text-right">
                                            {PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label}
                                        </span>
                                    </div>
                                </div>

                                {/* item list */}
                                <div className="py-4 border-b border-dashed border-gray-200 space-y-3">
                                    {items.map(({ menuItem, quantity }) => (
                                        <div key={menuItem._id} className="flex gap-3">
                                            <div className="w-10 h-10 relative rounded-xl overflow-hidden shrink-0 bg-gray-100">
                                                <Image src={getImageUrl(menuItem.image)} alt={menuItem.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{menuItem.name}</p>
                                                <p className="text-[10px] text-gray-400">×{quantity}</p>
                                            </div>
                                            <span className="text-xs font-bold text-gray-800 shrink-0">{formatCurrency(menuItem.price * quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* total */}
                                <div className="pt-4 space-y-2 mb-6">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Pajak ({taxRate}%)</span>
                                        <span className="font-semibold text-gray-800">{formatCurrency(tax)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-dashed border-gray-200 flex justify-between items-center">
                                        <span className="font-bold text-gray-500">Total Pembayaran</span>
                                        <span className="text-2xl font-extrabold text-[var(--color-primary)]">{formatCurrency(total)}</span>
                                    </div>
                                </div>

                                <button onClick={handleSubmit} disabled={loading}
                                    className="w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-bold hover:bg-[var(--color-hover)] disabled:opacity-60 transition-all shadow-lg shadow-[0_8px_24px_rgba(var(--color-rgb),0.15)] flex items-center justify-center gap-2 hover:scale-[1.01]">
                                    {loading
                                        ? <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Memproses...</>
                                        : <><CheckCircle size={18} /> {paymentMethod === 'cash' ? 'Konfirmasi & Pesan' : 'Bayar Sekarang'}</>
                                    }
                                </button>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
