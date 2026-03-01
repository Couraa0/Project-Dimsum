'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Minus, Plus, Trash2,
    UtensilsCrossed, Package, Truck,
    ShoppingBag, ChevronRight, MapPin, Tag,
    QrCode, CheckCircle2, ScanLine, X
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import QRScannerModal from '@/components/ui/QRScannerModal';

const ORDER_TYPES = [
    { value: 'dine-in', label: 'Dine In', icon: UtensilsCrossed, desc: 'Makan di tempat' },
    { value: 'takeaway', label: 'Take Away', icon: Package, desc: 'Bawa pulang' },
    { value: 'delivery', label: 'Delivery', icon: Truck, desc: 'Antar ke lokasi' },
] as const;

export default function CartPage() {
    const router = useRouter();
    const {
        items, orderType, tableNumber,
        updateQuantity, removeItem,
        setOrderType, setTableNumber,
        getTotal, getCount,
    } = useCartStore();

    const [showScanner, setShowScanner] = useState(false);
    const total = getTotal();
    const count = getCount();

    /* ── empty state ──────────────────────────────────────── */
    if (items.length === 0) return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* header */}
            <div className="bg-white border-b border-gray-100 pt-5 pb-6">
                <div className="max-w-2xl mx-auto px-4 sm:px-6">
                    <Link href="/menu" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#C1121F] transition-colors mb-4">
                        <ArrowLeft size={15} /> Kembali ke Menu
                    </Link>
                    <h1 className="text-2xl font-extrabold text-gray-900">Keranjang</h1>
                </div>
            </div>
            {/* body */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 -mt-10">
                <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mb-5">
                    <ShoppingBag size={40} className="text-[#C1121F]" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-2">Keranjang Kosong</h2>
                <p className="text-gray-400 text-sm mb-8 max-w-xs">
                    Tambahkan menu favorit Anda untuk mulai memesan
                </p>
                <Link href="/menu"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#C1121F] text-white rounded-2xl font-bold hover:bg-[#a50f1a] transition-all shadow-lg shadow-red-200 hover:scale-[1.02]">
                    Pilih Menu <ChevronRight size={18} />
                </Link>
            </div>
        </div>
    );

    /* ── main view ────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header ─────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <Link href="/menu"
                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-base font-extrabold text-gray-900 leading-none">Keranjang Saya</h1>
                        <p className="text-xs text-gray-400 mt-0.5">{count} item dipilih</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 pb-10 space-y-4">

                {/* ── Order Type ─────────────────────────── */}
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-700 mb-3">Jenis Pesanan</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {ORDER_TYPES.map(({ value, label, icon: Icon, desc }) => {
                            const active = orderType === value;
                            return (
                                <button key={value}
                                    onClick={() => { setOrderType(value); if (value !== 'dine-in') setTableNumber(''); }}
                                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all ${active ? 'border-[#C1121F] bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? 'bg-[#C1121F] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Icon size={17} />
                                    </div>
                                    <span className={`text-xs font-bold ${active ? 'text-[#C1121F]' : 'text-gray-700'}`}>{label}</span>
                                    <span className="text-[10px] text-gray-400 leading-tight text-center">{desc}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Meja (Dine In) ─ kini via QR scan */}
                    {orderType === 'dine-in' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            {tableNumber ? (
                                /* Meja sudah terisi dari QR scan */
                                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-green-800">Meja {tableNumber}</p>
                                        <p className="text-xs text-green-600">Terdeteksi dari QR code</p>
                                    </div>
                                    <button onClick={() => setTableNumber('')}
                                        className="text-green-400 hover:text-red-400 transition-colors p-1">
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                /* Belum scan QR ─ buka kamera */
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <ScanLine size={20} className="text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-amber-800">Scan QR Code Meja</p>
                                            <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                                                Untuk Dine In, scan QR code yang ada di meja Anda agar nomor meja terisi otomatis.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowScanner(true)}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 active:scale-95 transition-all">
                                        <QrCode size={15} /> Buka Kamera &amp; Scan QR
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Delivery hint */}
                    {orderType === 'delivery' && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                            <MapPin size={14} className="text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-blue-600 leading-relaxed">
                                Alamat pengiriman akan dilengkapi pada halaman checkout berikutnya.
                            </p>
                        </div>
                    )}
                </section>

                {/* ── Cart Items ─────────────────────────── */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <h2 className="text-sm font-bold text-gray-700">Item Pesanan</h2>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count} item</span>
                    </div>
                    <ul className="divide-y divide-gray-50">
                        {items.map(({ menuItem, quantity }) => (
                            <li key={menuItem._id} className="flex gap-3 p-4 hover:bg-gray-50/60 transition-colors">
                                {/* image */}
                                <div className="w-[68px] h-[68px] relative rounded-xl overflow-hidden shrink-0 bg-gray-100">
                                    <Image src={getImageUrl(menuItem.image)} alt={menuItem.name} fill className="object-cover" />
                                </div>
                                {/* info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{menuItem.name}</p>
                                    <p className="text-[#C1121F] font-bold text-sm mt-0.5">{formatCurrency(menuItem.price)}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {/* qty controls */}
                                        <button onClick={() => updateQuantity(menuItem._id, quantity - 1)}
                                            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 text-gray-500 transition-colors">
                                            <Minus size={11} />
                                        </button>
                                        <span className="w-5 text-center text-sm font-bold text-gray-800">{quantity}</span>
                                        <button onClick={() => updateQuantity(menuItem._id, quantity + 1)}
                                            className="w-7 h-7 rounded-full bg-[#C1121F] text-white flex items-center justify-center hover:bg-[#a50f1a] transition-colors">
                                            <Plus size={11} />
                                        </button>
                                        {/* subtotal */}
                                        <span className="ml-auto text-sm font-extrabold text-gray-700">
                                            {formatCurrency(menuItem.price * quantity)}
                                        </span>
                                        {/* delete */}
                                        <button onClick={() => removeItem(menuItem._id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* ── Price Summary ──────────────────────── */}
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-700 mb-3">Ringkasan Harga</h2>
                    <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal ({count} item)</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span className="flex items-center gap-1.5"><Tag size={12} className="text-green-500" /> Biaya layanan</span>
                            <span className="text-green-600 font-semibold">Gratis</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-800">Total Pembayaran</span>
                        <span className="text-xl font-extrabold text-[#C1121F]">{formatCurrency(total)}</span>
                    </div>
                </section>

                {/* ── Checkout CTA ───────────────────────── */}
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Pembayaran</div>
                            <div className="text-2xl font-extrabold text-[#C1121F] leading-tight mt-0.5">{formatCurrency(total)}</div>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                            <div>{count} item</div>
                            <div className="text-green-500 font-medium">Gratis ongkir</div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (orderType === 'dine-in' && !tableNumber)
                                return toast.error('Scan QR code meja terlebih dahulu', { icon: '📷' });
                            router.push('/order');
                        }}
                        className="w-full py-4 bg-[#C1121F] text-white rounded-2xl font-bold text-sm hover:bg-[#a50f1a] transition-all shadow-lg shadow-red-200 hover:scale-[1.01] flex items-center justify-center gap-2">
                        Lanjut ke Checkout <ChevronRight size={17} />
                    </button>
                </section>

            </div>

            {/* ── QR Scanner Modal ────────────────────────── */}
            {showScanner && (
                <QRScannerModal
                    onScan={(tableNum) => {
                        setTableNumber(tableNum);
                        setOrderType('dine-in');
                        setShowScanner(false);
                        toast.success(`Meja ${tableNum} berhasil terdeteksi! ✅`);
                    }}
                    onClose={() => setShowScanner(false)}
                />
            )}

        </div>
    );
}
