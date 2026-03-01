'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowLeft, UtensilsCrossed, Package, Truck, QrCode, CreditCard, Smartphone, Banknote, ChevronRight, CheckCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { ordersApi } from '@/lib/api';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const ORDER_TYPES = [
    { value: 'dine-in', label: 'Dine In', icon: UtensilsCrossed, desc: 'Makan di tempat' },
    { value: 'takeaway', label: 'Take Away', icon: Package, desc: 'Bawa pulang' },
    { value: 'delivery', label: 'Delivery', icon: Truck, desc: 'Antar ke lokasi' },
];
const PAYMENT_METHODS = [
    { value: 'cash', label: 'Bayar di Tempat', icon: Banknote, desc: 'Tunai / kasir' },
    { value: 'qris', label: 'QRIS', icon: QrCode, desc: 'Semua e-wallet' },
    { value: 'transfer', label: 'Transfer Bank', icon: CreditCard, desc: 'BCA / Mandiri / BNI' },
];

export default function OrderPage() {
    const router = useRouter();
    const { items, orderType, paymentMethod, customer, tableNumber, updateQuantity, removeItem, clearCart, setOrderType, setPaymentMethod, setCustomer, setTableNumber, getTotal, getCount } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'cart' | 'info' | 'payment' | 'success'>('cart');
    const [orderId, setOrderId] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const total = getTotal();

    const handlePlaceOrder = async () => {
        if (items.length === 0) return toast.error('Keranjang kosong!');
        if (!customer.name) return toast.error('Nama wajib diisi');
        if (orderType === 'delivery' && !customer.address) return toast.error('Alamat wajib diisi untuk delivery');

        setLoading(true);
        try {
            const payload = {
                type: orderType,
                paymentMethod,
                tableNumber,
                customer,
                items: items.map(i => ({ menuItemId: i.menuItem._id, name: i.menuItem.name, quantity: i.quantity, notes: i.notes })),
            };
            const res = await ordersApi.create(payload);
            setOrderId(res.data.data._id);
            setOrderNumber(res.data.data.orderNumber);
            clearCart();
            setStep('success');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal membuat pesanan');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="max-w-md mx-auto px-4 py-20 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle size={48} className="text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Berhasil! 🎉</h1>
                <p className="text-gray-500 mb-2">Nomor Pesanan Anda:</p>
                <div className="text-2xl font-bold text-[#C1121F] mb-6 bg-red-50 px-6 py-4 rounded-2xl border border-red-100">{orderNumber}</div>
                <p className="text-gray-500 text-sm mb-8">Pesanan Anda sedang diproses. Estimasi waktu 15-20 menit.</p>
                <div className="flex flex-col gap-3">
                    <Link href="/menu" className="px-6 py-4 bg-[#C1121F] text-white rounded-2xl font-semibold hover:bg-[#a50f1a] transition-colors">
                        Pesan Lagi
                    </Link>
                    <Link href="/" className="px-6 py-4 border border-gray-200 text-gray-600 rounded-2xl font-semibold hover:bg-gray-50 transition-colors">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <button onClick={() => step === 'cart' ? router.back() : setStep('cart')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {step === 'cart' ? 'Keranjang Belanja' : step === 'info' ? 'Data Pemesan' : 'Metode Pembayaran'}
                    </h1>
                    <p className="text-gray-400 text-sm">{getCount()} item dipilih</p>
                </div>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center gap-2 mb-8">
                {['cart', 'info', 'payment'].map((s, i) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s || (i < ['cart', 'info', 'payment'].indexOf(step)) ? 'bg-[#C1121F] text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {i + 1}
                        </div>
                        {i < 2 && <div className={`flex-1 h-1 rounded-full ${i < ['cart', 'info', 'payment'].indexOf(step) ? 'bg-[#C1121F]' : 'bg-gray-100'}`} />}
                    </div>
                ))}
            </div>

            {/* ── CART STEP ── */}
            {step === 'cart' && (
                <div>
                    {items.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🛒</div>
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Keranjang kosong</h2>
                            <p className="text-gray-400 mb-6 text-sm">Belum ada menu yang dipilih</p>
                            <Link href="/menu" className="px-8 py-3 bg-[#C1121F] text-white rounded-2xl font-semibold hover:bg-[#a50f1a] transition-colors">
                                Pilih Menu
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Order Type */}
                            <div className="grid grid-cols-3 gap-2 mb-6">
                                {ORDER_TYPES.map(type => {
                                    const Icon = type.icon;
                                    return (
                                        <button key={type.value} onClick={() => setOrderType(type.value as any)}
                                            className={`p-4 rounded-2xl border-2 transition-all text-left ${orderType === type.value ? 'border-[#C1121F] bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                            <Icon size={20} className={orderType === type.value ? 'text-[#C1121F]' : 'text-gray-400'} />
                                            <div className={`font-semibold text-sm mt-2 ${orderType === type.value ? 'text-[#C1121F]' : 'text-gray-700'}`}>{type.label}</div>
                                            <div className="text-xs text-gray-400">{type.desc}</div>
                                        </button>
                                    );
                                })}
                            </div>
                            {orderType === 'dine-in' && (
                                <div className="mb-4">
                                    <input type="text" placeholder="Nomor Meja (cth: 01)" value={tableNumber}
                                        onChange={e => setTableNumber(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C1121F] text-sm" />
                                </div>
                            )}

                            {/* Items */}
                            <div className="space-y-3 mb-6">
                                {items.map(({ menuItem, quantity, notes }) => (
                                    <div key={menuItem._id} className="flex gap-4 bg-gray-50 rounded-2xl p-4">
                                        <div className="w-16 h-16 relative rounded-xl overflow-hidden shrink-0 bg-gray-200">
                                            <Image src={getImageUrl(menuItem.image)} alt={menuItem.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 text-sm">{menuItem.name}</p>
                                            <p className="text-[#C1121F] font-bold">{formatCurrency(menuItem.price)}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <button onClick={() => updateQuantity(menuItem._id, quantity - 1)} className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-red-100 transition-colors">
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-6 text-center font-bold text-sm">{quantity}</span>
                                                <button onClick={() => updateQuantity(menuItem._id, quantity + 1)} className="w-7 h-7 rounded-full bg-[#C1121F] text-white flex items-center justify-center hover:bg-[#a50f1a] transition-colors">
                                                    <Plus size={12} />
                                                </button>
                                                <span className="ml-auto text-sm font-semibold text-gray-600">{formatCurrency(menuItem.price * quantity)}</span>
                                                <button onClick={() => removeItem(menuItem._id)} className="text-gray-400 hover:text-red-500">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                                <div className="flex justify-between text-sm text-gray-500 mb-1"><span>Subtotal</span><span>{formatCurrency(total)}</span></div>
                                <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span className="text-[#C1121F]">{formatCurrency(total)}</span></div>
                            </div>

                            <button onClick={() => setStep('info')} className="w-full py-4 bg-[#C1121F] text-white rounded-2xl font-semibold hover:bg-[#a50f1a] transition-colors shadow-red flex items-center justify-center gap-2">
                                Lanjutkan <ChevronRight size={18} />
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* ── INFO STEP ── */}
            {step === 'info' && (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama *</label>
                        <input type="text" placeholder="Nama Anda" value={customer.name} onChange={e => setCustomer({ name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C1121F] text-sm" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">No. WhatsApp</label>
                        <input type="tel" placeholder="08xxxxxxxxxx" value={customer.phone} onChange={e => setCustomer({ phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C1121F] text-sm" />
                    </div>
                    {orderType === 'delivery' && (
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Alamat Lengkap *</label>
                            <textarea rows={3} placeholder="Jl. ..." value={customer.address} onChange={e => setCustomer({ address: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C1121F] text-sm resize-none" />
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Catatan (opsional)</label>
                        <textarea rows={2} placeholder="Permintaan khusus, dll." value={customer.notes} onChange={e => setCustomer({ notes: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C1121F] text-sm resize-none" />
                    </div>
                    <button onClick={() => setStep('payment')} className="w-full py-4 bg-[#C1121F] text-white rounded-2xl font-semibold hover:bg-[#a50f1a] transition-colors shadow-red flex items-center justify-center gap-2 mt-4">
                        Pilih Pembayaran <ChevronRight size={18} />
                    </button>
                </div>
            )}

            {/* ── PAYMENT STEP ── */}
            {step === 'payment' && (
                <div>
                    <div className="space-y-3 mb-8">
                        {PAYMENT_METHODS.map(method => {
                            const Icon = method.icon;
                            return (
                                <button key={method.value} onClick={() => setPaymentMethod(method.value as any)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${paymentMethod === method.value ? 'border-[#C1121F] bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === method.value ? 'bg-[#C1121F] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <div className={`font-semibold text-sm ${paymentMethod === method.value ? 'text-[#C1121F]' : 'text-gray-700'}`}>{method.label}</div>
                                        <div className="text-xs text-gray-400">{method.desc}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3">Ringkasan Pesanan</h3>
                        {items.map(({ menuItem, quantity }) => (
                            <div key={menuItem._id} className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>{menuItem.name} x{quantity}</span>
                                <span>{formatCurrency(menuItem.price * quantity)}</span>
                            </div>
                        ))}
                        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold">
                            <span>Total</span>
                            <span className="text-[#C1121F]">{formatCurrency(total)}</span>
                        </div>
                    </div>

                    <button onClick={handlePlaceOrder} disabled={loading}
                        className="w-full py-4 bg-[#C1121F] text-white rounded-2xl font-semibold hover:bg-[#a50f1a] disabled:opacity-60 transition-colors shadow-red flex items-center justify-center gap-2">
                        {loading ? (
                            <><span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Memproses...</>
                        ) : (
                            <><CheckCircle size={20} /> Konfirmasi Pesanan</>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
