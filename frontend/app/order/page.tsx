'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Bayar di Kasir', icon: Banknote, desc: 'Bayar tunai saat di tempat' },
    { value: 'qris', label: 'QRIS', icon: Smartphone, desc: 'GoPay, OVO, Dana, dll' },
    { value: 'transfer', label: 'Transfer Bank', icon: CreditCard, desc: 'BCA · Mandiri · BNI' },
] as const;

type Step = 'info' | 'payment' | 'success';

const ORDER_TYPE_LABEL: Record<string, string> = {
    'dine-in': 'Dine In',
    'takeaway': 'Take Away',
    'delivery': 'Delivery',
};

export default function OrderPage() {
    const router = useRouter();
    const {
        items, orderType, paymentMethod, customer, tableNumber,
        setPaymentMethod, setCustomer, clearCart,
        getTotal, getCount,
    } = useCartStore();

    const [step, setStep] = useState<Step>('info');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [orderSnapshot, setOrderSnapshot] = useState<{
        type: string; paymentMethod: string; tableNumber: string;
        customer: { name: string; phone: string; address?: string; notes?: string };
        items: { name: string; quantity: number; price: number }[];
        total: number;
        createdAt: string;
    } | null>(null);

    const total = getTotal();
    const count = getCount();

    /* ── redirect if empty ───────────────────────────────── */
    if (items.length === 0 && step !== 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <div className="text-5xl mb-4">🛒</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Keranjang kosong</h2>
                    <Link href="/menu" className="text-[#C1121F] font-semibold hover:underline">
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
            // simpan snapshot SEBELUM clearCart()
            const snap = {
                type: orderType,
                paymentMethod,
                tableNumber,
                customer: { ...customer },
                items: items.map(i => ({ name: i.menuItem.name, quantity: i.quantity, price: i.menuItem.price })),
                total,
                createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }),
            };
            const res = await ordersApi.create({
                type: orderType,
                paymentMethod,
                tableNumber,
                customer,
                items: items.map(i => ({
                    menuItemId: i.menuItem._id,
                    name: i.menuItem.name,
                    quantity: i.quantity,
                    notes: i.notes,
                })),
            });
            setOrderNumber(res.data.data.orderNumber);
            setOrderSnapshot(snap);
            clearCart();
            setStep('success');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal membuat pesanan. Coba lagi.');
        } finally {
            setLoading(false);
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
            <div className="bg-gradient-to-br from-[#C1121F] to-[#8b0e16] pt-12 pb-20 no-print">
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
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Dimsum Ratu</p>
                        <p className="text-[10px] text-gray-400">{orderSnapshot?.createdAt ?? new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                        <p className="text-xs text-gray-400 mt-1">Nomor Pesanan</p>
                        {/* Order number + copy button */}
                        <div className="flex items-center justify-center gap-2 mt-1 mb-1">
                            <span className="text-2xl font-extrabold text-[#C1121F] font-mono tracking-wider">{orderNumber}</span>
                            <button onClick={handleCopy} title="Salin nomor pesanan"
                                className="no-print w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-red-50 hover:text-[#C1121F] transition-colors">
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
                                <span className="text-xl font-extrabold text-[#C1121F]">{formatCurrency(orderSnapshot.total)}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* ─ Action buttons ───────────────────────────── */}
                <div className="no-print mt-4 grid grid-cols-2 gap-3">
                    {/* Salin */}
                    <button onClick={handleCopy}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-200 font-semibold text-sm text-gray-700 hover:border-[#C1121F] hover:text-[#C1121F] transition-all">
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        {copied ? 'Tersalin!' : 'Salin No.'}
                    </button>
                    {/* Simpan Struk / Print */}
                    <button onClick={handlePrint}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-200 font-semibold text-sm text-gray-700 hover:border-[#C1121F] hover:text-[#C1121F] transition-all">
                        <Printer size={16} /> Simpan Struk
                    </button>
                </div>

                {/* ─ Nav buttons ──────────────────────────────── */}
                <div className="no-print mt-3 flex flex-col gap-3">
                    <Link href={`/track?q=${orderNumber}`}
                        className="w-full py-4 bg-[#C1121F] text-white rounded-2xl font-bold hover:bg-[#a50f1a] transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 hover:scale-[1.01]">
                        <ExternalLink size={16} /> Pantau Status Pesanan
                    </Link>
                    <Link href="/menu"
                        className="w-full py-3.5 border-2 border-gray-200 text-gray-600 rounded-2xl font-semibold hover:border-[#C1121F] hover:text-[#C1121F] transition-all flex items-center justify-center">
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

            {/* Header ─────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 px-4 sm:px-6 pt-4 pb-0">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        {step === 'info' ? (
                            <Link href="/cart"
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                                <ArrowLeft size={18} />
                            </Link>
                        ) : (
                            <button onClick={() => setStep('info')}
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <div>
                            <h1 className="text-base font-extrabold text-gray-900 leading-none">
                                {step === 'info' ? 'Informasi Pemesan' : 'Metode Pembayaran'}
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {step === 'info' ? 'Lengkapi data diri Anda' : 'Konfirmasi & selesaikan pesanan'}
                            </p>
                        </div>
                    </div>

                    {/* Progress steps */}
                    <div className="flex gap-1.5">
                        {STEPS.map((s, i) => {
                            const done = i < stepIdx;
                            const active = i === stepIdx;
                            return (
                                <div key={s.key} className="flex-1">
                                    <div className={`h-1.5 rounded-full transition-all duration-300 ${active ? 'bg-[#C1121F]' : done ? 'bg-red-300' : 'bg-gray-100'}`} />
                                    <div className={`text-[10px] font-bold mt-1.5 pb-2 ${active ? 'text-[#C1121F]' : done ? 'text-red-300' : 'text-gray-300'}`}>
                                        {s.num}. {s.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-10 space-y-4">

                {/* ── STEP 1: INFO ───────────────────────── */}
                {step === 'info' && (
                    <>
                        {/* form */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50">
                                <h2 className="text-sm font-bold text-gray-700">Data Pemesan</h2>
                            </div>
                            <div className="p-5 space-y-4">
                                {/* name */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
                                        <User size={12} /> Nama Lengkap <span className="text-[#C1121F]">*</span>
                                    </label>
                                    <input type="text" placeholder="Contoh: Budi Santoso"
                                        value={customer.name}
                                        onChange={e => setCustomer({ name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C1121F] focus:ring-2 focus:ring-red-100 bg-gray-50 transition-all" />
                                </div>
                                {/* phone */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
                                        <Phone size={12} /> No. HP / WhatsApp
                                    </label>
                                    <input type="tel" placeholder="Contoh: 08123456789"
                                        value={customer.phone}
                                        onChange={e => setCustomer({ phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C1121F] focus:ring-2 focus:ring-red-100 bg-gray-50 transition-all" />
                                </div>
                                {/* address (delivery only) */}
                                {orderType === 'delivery' && (
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
                                            <MapPin size={12} /> Alamat Pengiriman <span className="text-[#C1121F]">*</span>
                                        </label>
                                        <textarea rows={3} placeholder="Masukkan alamat lengkap pengiriman..."
                                            value={customer.address}
                                            onChange={e => setCustomer({ address: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C1121F] focus:ring-2 focus:ring-red-100 bg-gray-50 resize-none transition-all" />
                                    </div>
                                )}
                                {/* notes */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2">
                                        <FileText size={12} /> Catatan Pesanan
                                    </label>
                                    <textarea rows={2} placeholder="Contoh: tidak pedas, tanpa bawang..."
                                        value={customer.notes}
                                        onChange={e => setCustomer({ notes: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C1121F] focus:ring-2 focus:ring-red-100 bg-gray-50 resize-none transition-all" />
                                </div>
                            </div>
                        </section>

                        {/* order recap */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h2 className="text-sm font-bold text-gray-700 mb-3">Ringkasan Pesanan</h2>
                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Jenis</span>
                                    <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                                        {orderType === 'dine-in' && <UtensilsCrossed size={13} />}
                                        {orderType === 'takeaway' && <Package size={13} />}
                                        {orderType === 'delivery' && <Truck size={13} />}
                                        {ORDER_TYPE_LABEL[orderType]}
                                        {orderType === 'dine-in' && tableNumber && <span className="text-gray-400">· Meja {tableNumber}</span>}
                                    </div>
                                </div>
                                <div className="flex justify-between"><span className="text-gray-400">Jumlah Item</span><span className="font-semibold text-gray-700">{count} item</span></div>
                                <div className="flex justify-between pt-2.5 border-t border-dashed border-gray-200">
                                    <span className="font-bold text-gray-800">Total</span>
                                    <span className="font-extrabold text-[#C1121F] text-base">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {/* ── STEP 2: PAYMENT ────────────────────── */}
                {step === 'payment' && (
                    <>
                        {/* payment methods */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50">
                                <h2 className="text-sm font-bold text-gray-700">Metode Pembayaran</h2>
                            </div>
                            <div className="p-4 space-y-2">
                                {PAYMENT_METHODS.map(({ value, label, icon: Icon, desc }) => {
                                    const active = paymentMethod === value;
                                    return (
                                        <button key={value} onClick={() => setPaymentMethod(value)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${active ? 'border-[#C1121F] bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-[#C1121F] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className={`text-sm font-bold ${active ? 'text-[#C1121F]' : 'text-gray-800'}`}>{label}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${active ? 'border-[#C1121F] bg-[#C1121F]' : 'border-gray-200'}`}>
                                                {active && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* final confirmation */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h2 className="text-sm font-bold text-gray-700 mb-4">Konfirmasi Pesanan</h2>
                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between"><span className="text-gray-400">Nama</span><span className="font-semibold text-gray-800">{customer.name}</span></div>
                                {customer.phone && <div className="flex justify-between"><span className="text-gray-400">No. HP</span><span className="font-semibold text-gray-800">{customer.phone}</span></div>}
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Jenis Pesanan</span>
                                    <span className="font-semibold text-gray-800">
                                        {ORDER_TYPE_LABEL[orderType]}{orderType === 'dine-in' && tableNumber ? ` · Meja ${tableNumber}` : ''}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Pembayaran</span>
                                    <span className="font-semibold text-gray-800">
                                        {PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label}
                                    </span>
                                </div>
                            </div>
                            {/* item list */}
                            <div className="mt-4 pt-4 border-t border-dashed border-gray-200 space-y-2">
                                {items.map(({ menuItem, quantity }) => (
                                    <div key={menuItem._id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 relative rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                            <Image src={getImageUrl(menuItem.image)} alt={menuItem.name} fill className="object-cover" />
                                        </div>
                                        <span className="flex-1 text-xs text-gray-600 truncate">{menuItem.name} ×{quantity}</span>
                                        <span className="text-xs font-bold text-gray-800">{formatCurrency(menuItem.price * quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            {/* total */}
                            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                <span className="font-bold text-gray-800">Total Pembayaran</span>
                                <span className="text-xl font-extrabold text-[#C1121F]">{formatCurrency(total)}</span>
                            </div>
                        </section>
                    </>
                )}

                {/* CTA button ────────────────────── */}
                {step === 'info' && (
                    <button onClick={() => {
                        if (!customer.name.trim()) return toast.error('Nama wajib diisi');
                        if (orderType === 'delivery' && !customer.address?.trim()) return toast.error('Alamat pengiriman wajib diisi');
                        setStep('payment');
                    }} className="w-full py-4 bg-[#C1121F] text-white rounded-2xl font-bold hover:bg-[#a50f1a] transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 hover:scale-[1.01]">
                        Lanjut ke Pembayaran <ChevronRight size={17} />
                    </button>
                )}
                {step === 'payment' && (
                    <button onClick={handleSubmit} disabled={loading}
                        className="w-full py-4 bg-[#C1121F] text-white rounded-2xl font-bold hover:bg-[#a50f1a] disabled:opacity-60 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 hover:scale-[1.01]">
                        {loading
                            ? <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Memproses...</>
                            : <><CheckCircle size={18} /> Konfirmasi &amp; Pesan</>
                        }
                    </button>
                )}

            </div>
        </div>
    );
}
