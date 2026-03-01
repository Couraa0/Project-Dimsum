'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Plus, Minus, ShoppingCart, X, CheckCircle, UtensilsCrossed, QrCode } from 'lucide-react';
import { menuApi, categoriesApi, tablesApi, ordersApi } from '@/lib/api';
import type { MenuItem, Category } from '@/types';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';

function DineInContent() {
    const searchParams = useSearchParams();
    const tableNum = searchParams.get('meja') || '';
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [tableInfo, setTableInfo] = useState<any>(null);
    const [showCart, setShowCart] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [orderLoading, setOrderLoading] = useState(false);
    const [name, setName] = useState('');
    const { items: cartItems, addItem, updateQuantity, removeItem, clearCart, getTotal, getCount } = useCartStore();
    const total = getTotal();
    const count = getCount();

    useEffect(() => {
        Promise.all([
            categoriesApi.getAll(),
            menuApi.getAll(),
            tableNum ? tablesApi.getByNumber(tableNum).catch(() => null) : Promise.resolve(null),
        ]).then(([catRes, menuRes, tableRes]) => {
            setCategories(catRes.data.data);
            setItems(menuRes.data.data);
            if (tableRes) setTableInfo(tableRes.data.data);
        }).finally(() => setLoading(false));
    }, [tableNum]);

    const filteredItems = selectedCategory ? items.filter(i => {
        const cat = typeof i.category === 'object' ? i.category : null;
        return cat?._id === selectedCategory;
    }) : items;

    const handleOrder = async () => {
        if (cartItems.length === 0) return toast.error('Pilih menu terlebih dahulu!');
        if (!name) return toast.error('Masukkan nama Anda!');
        setOrderLoading(true);
        try {
            const res = await ordersApi.create({
                type: 'dine-in',
                tableNumber: tableNum,
                paymentMethod: 'cash',
                customer: { name, phone: '' },
                items: cartItems.map(i => ({ menuItemId: i.menuItem._id, name: i.menuItem.name, quantity: i.quantity, notes: i.notes })),
            });
            setOrderNumber(res.data.data.orderNumber);
            clearCart();
            setShowCart(false);
            setShowSuccess(true);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal membuat pesanan');
        } finally {
            setOrderLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} className="text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Diterima! 🎉</h1>
                    <div className="text-3xl font-black text-[#C1121F] my-4 bg-red-50 py-4 px-6 rounded-2xl border border-red-100">{orderNumber}</div>
                    <p className="text-gray-500 mb-2">Meja <strong>{tableNum}</strong></p>
                    <p className="text-gray-400 text-sm">Pesanan Anda sedang diproses. Silakan tunggu, staff kami akan segera menyajikan.</p>
                    <button onClick={() => setShowSuccess(false)} className="mt-8 w-full py-4 bg-[#C1121F] text-white rounded-2xl font-semibold hover:bg-[#a50f1a] transition-colors">
                        Pesan Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Dine-in Header */}
            <div className="bg-[#C1121F] text-white px-4 pt-6 pb-10">
                <div className="flex items-center gap-2 mb-1">
                    <QrCode size={18} />
                    <span className="text-sm font-medium opacity-80">Dine In</span>
                </div>
                <h1 className="text-2xl font-bold">
                    {tableNum ? `Meja ${tableNum}` : 'Dimsum Ratu'}
                </h1>
                {tableInfo && <p className="text-sm opacity-75 mt-1">{tableInfo.name} • Kapasitas {tableInfo.capacity} orang</p>}
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-10">
                {/* Category Filter */}
                <div className="bg-white rounded-2xl shadow-sm p-1 mb-4 flex gap-1 overflow-x-auto">
                    <button onClick={() => setSelectedCategory('')}
                        className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${!selectedCategory ? 'bg-[#C1121F] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                        Semua
                    </button>
                    {categories.map(cat => (
                        <button key={cat._id} onClick={() => setSelectedCategory(selectedCategory === cat._id ? '' : cat._id)}
                            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${selectedCategory === cat._id ? 'bg-[#C1121F] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 gap-3">
                        {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-xl h-48 animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredItems.map(item => {
                            const cartItem = cartItems.find(c => c.menuItem._id === item._id);
                            return (
                                <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                                    <div className="relative h-36 bg-gray-100">
                                        <Image src={getImageUrl(item.image)} alt={item.name} fill className="object-cover" />
                                        {item.isBestSeller && (
                                            <span className="absolute top-2 left-2 bg-[#C1121F] text-white text-xs px-2 py-0.5 rounded-full font-bold">🔥 Best</span>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs font-semibold text-gray-800 mb-1 line-clamp-2 leading-snug">{item.name}</p>
                                        <p className="text-[#C1121F] font-bold text-sm mb-2">{formatCurrency(item.price)}</p>
                                        {cartItem ? (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateQuantity(item._id, cartItem.quantity - 1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50">
                                                    <Minus size={12} />
                                                </button>
                                                <span className="font-bold text-sm flex-1 text-center">{cartItem.quantity}</span>
                                                <button onClick={() => updateQuantity(item._id, cartItem.quantity + 1)} className="w-7 h-7 rounded-full bg-[#C1121F] text-white flex items-center justify-center">
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => { addItem(item); toast.success(`${item.name} ditambahkan!`, { icon: '🥟' }); }}
                                                disabled={!item.isAvailable}
                                                className="w-full py-2 bg-[#C1121F] text-white rounded-xl text-xs font-semibold hover:bg-[#a50f1a] disabled:opacity-40 transition-colors">
                                                {item.isAvailable ? '+ Tambah' : 'Habis'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Floating Cart */}
            {count > 0 && !showCart && (
                <button onClick={() => setShowCart(true)}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#C1121F] text-white px-8 py-4 rounded-2xl shadow-red flex items-center gap-3 hover:bg-[#a50f1a] transition-all z-40 min-w-[280px] justify-center">
                    <ShoppingCart size={20} />
                    <span className="font-semibold">{count} item · {formatCurrency(total)}</span>
                </button>
            )}

            {/* Cart Bottom Sheet */}
            {showCart && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end">
                    <div className="flex-1 bg-black/40" onClick={() => setShowCart(false)} />
                    <div className="bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800">Pesanan Meja {tableNum}</h2>
                            <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            {cartItems.map(({ menuItem, quantity }) => (
                                <div key={menuItem._id} className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{menuItem.name}</p>
                                        <p className="text-xs text-gray-400">{formatCurrency(menuItem.price)} × {quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateQuantity(menuItem._id, quantity - 1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Minus size={12} />
                                        </button>
                                        <span className="w-5 text-center text-sm font-bold">{quantity}</span>
                                        <button onClick={() => updateQuantity(menuItem._id, quantity + 1)} className="w-7 h-7 rounded-full bg-[#C1121F] text-white flex items-center justify-center">
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="border-t pt-3">
                                <div className="flex justify-between font-bold text-gray-900 mb-4">
                                    <span>Total</span>
                                    <span className="text-[#C1121F]">{formatCurrency(total)}</span>
                                </div>
                                <input type="text" placeholder="Nama Anda *" value={name} onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:border-[#C1121F]" />
                                <button onClick={handleOrder} disabled={orderLoading}
                                    className="w-full py-4 bg-[#C1121F] text-white rounded-2xl font-semibold hover:bg-[#a50f1a] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                                    {orderLoading ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={18} /> Pesan Sekarang</>}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-2">Bayar di kasir setelah selesai makan</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DineInPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#C1121F] border-t-transparent rounded-full animate-spin" /></div>}>
            <DineInContent />
        </Suspense>
    );
}
