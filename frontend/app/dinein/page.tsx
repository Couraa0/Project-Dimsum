'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Plus, Minus, ShoppingCart, X, CheckCircle,
    UtensilsCrossed, Star, ChevronRight, Users,
    Search, Package
} from 'lucide-react';
import { menuApi, categoriesApi, tablesApi } from '@/lib/api';
import type { MenuItem, Category } from '@/types';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';

/* ─────────────────────────────────────────────────────── */

function DineInContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tableNum = searchParams.get('meja') || '';

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [tableInfo, setTableInfo] = useState<any>(null);
    const [showCart, setShowCart] = useState(false);
    const [mounted, setMounted] = useState(false);

    const {
        items: cartItems, addItem, updateQuantity,
        getTotal, getCount,
        setOrderType, setTableNumber,
    } = useCartStore();

    const total = getTotal();
    const count = getCount();

    /* set cart store */
    useEffect(() => {
        setMounted(true);
        if (tableNum) { setOrderType('dine-in'); setTableNumber(tableNum); }
    }, [tableNum]);

    /* fetch data */
    useEffect(() => {
        Promise.all([
            categoriesApi.getAll(),
            menuApi.getAll(),
            tableNum ? tablesApi.getByNumber(tableNum).catch(() => null) : Promise.resolve(null),
        ]).then(([catRes, menuRes, tableRes]) => {
            setCategories(catRes.data.data);
            setMenuItems(menuRes.data.data);
            if (tableRes) setTableInfo(tableRes.data.data);
        }).finally(() => setLoading(false));
    }, [tableNum]);

    /* filter */
    const filtered = menuItems.filter(item => {
        const matchCat = activeCategory
            ? (typeof item.category === 'object' ? item.category?._id : item.category) === activeCategory
            : true;
        const matchSearch = search.trim()
            ? item.name.toLowerCase().includes(search.toLowerCase())
            : true;
        return matchCat && matchSearch;
    });

    /* go to checkout */
    const handleCheckout = () => {
        if (cartItems.length === 0) return toast.error('Pilih menu terlebih dahulu!');
        router.push('/order');
    };

    /* ── MAIN ─────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-gray-50 pb-32">

            {/* ── Header ──────────────────────────────────── */}
            <div className="bg-gradient-to-b from-[#C1121F] to-[#9e0f1a] pt-12 pb-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1 mb-3">
                        <UtensilsCrossed size={13} className="text-white/80" />
                        <span className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">Dine In</span>
                    </div>
                    {/* Title */}
                    <h1 className="text-2xl font-extrabold text-white leading-tight">
                        {tableNum ? `Meja ${tableNum}` : 'Dimsum Ratu'}
                    </h1>
                    {tableInfo && (
                        <div className="flex items-center gap-2 mt-1.5">
                            <Users size={13} className="text-white/60" />
                            <span className="text-sm text-white/70">{tableInfo.name} · Kapasitas {tableInfo.capacity} orang</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Search + Category ───────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 space-y-3">
                {/* Search */}
                <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Cari menu..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm focus:outline-none focus:border-[#C1121F] focus:ring-2 focus:ring-red-100 transition-all"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <button
                        onClick={() => setActiveCategory('')}
                        className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${!activeCategory ? 'bg-[#C1121F] text-white shadow-md shadow-red-200' : 'bg-white text-gray-500 hover:bg-gray-50 shadow-sm'}`}>
                        Semua
                    </button>
                    {categories.map(cat => (
                        <button key={cat._id}
                            onClick={() => setActiveCategory(activeCategory === cat._id ? '' : cat._id)}
                            className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${activeCategory === cat._id ? 'bg-[#C1121F] text-white shadow-md shadow-red-200' : 'bg-white text-gray-500 hover:bg-gray-50 shadow-sm'}`}>
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Menu Grid ───────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                                <div className="h-28 bg-gray-100" />
                                <div className="p-3 space-y-2">
                                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <Package size={28} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 text-sm">Menu tidak ditemukan</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map(item => {
                            const cartItem = cartItems.find(c => c.menuItem._id === item._id);
                            return (
                                <div key={item._id}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1">
                                    {/* Image */}
                                    <div className="relative h-48 bg-gray-50 overflow-hidden">
                                        <Image
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                            fill className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {!item.isAvailable && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Habis</span>
                                            </div>
                                        )}
                                        {item.isBestSeller && item.isAvailable && (
                                            <div className="absolute top-2 left-2 bg-[#C1121F] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                                <Star size={10} fill="white" /> Best Seller
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-800 mb-1 text-sm leading-snug">{item.name}</h3>
                                        <p className="text-gray-400 text-xs mb-3 leading-relaxed line-clamp-2">{item.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-[#C1121F] text-base">{formatCurrency(item.price)}</span>
                                            {/* Qty controls or Add button */}
                                            {cartItem ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item._id, cartItem.quantity - 1)}
                                                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50 text-gray-600 transition-colors">
                                                        <Minus size={13} />
                                                    </button>
                                                    <span className="font-bold text-sm text-gray-800 flex-1 text-center">{cartItem.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item._id, cartItem.quantity + 1)}
                                                        className="w-8 h-8 rounded-full bg-[#C1121F] text-white flex items-center justify-center hover:bg-[#a50f1a] transition-colors">
                                                        <Plus size={13} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        if (!item.isAvailable) return;
                                                        addItem(item);
                                                        toast.success(`${item.name} ditambahkan!`, { icon: '🥟', duration: 1500 });
                                                    }}
                                                    disabled={!item.isAvailable}
                                                    className="w-8 h-8 bg-[#C1121F] text-white rounded-full flex items-center justify-center hover:bg-[#a50f1a] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-110 shadow-md shadow-red-100">
                                                    <Plus size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Floating Cart Button ─────────────────────── */}
            {mounted && count > 0 && !showCart && (
                <button
                    onClick={() => setShowCart(true)}
                    className="fixed bottom-6 right-6 bg-[#C1121F] text-white rounded-2xl px-6 py-4 shadow-xl shadow-red-300/50 flex items-center gap-3 hover:bg-[#a50f1a] transition-all hover:scale-105 z-40">
                    <div className="relative shrink-0">
                        <ShoppingCart size={20} />
                        <span className="absolute -top-2 -right-2 bg-white text-[#C1121F] text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm">
                            {count}
                        </span>
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-white/80 leading-snug">{count} item</div>
                        <div className="font-extrabold text-sm leading-tight">{formatCurrency(total)}</div>
                    </div>
                    <ChevronRight size={16} className="text-white/60 ml-2" />
                </button>
            )}

            {/* ── Cart Sidebar ────────────────────────── */}
            {showCart && (
                <div className="fixed inset-0 z-50 flex">
                    {/* backdrop */}
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowCart(false)} />

                    {/* sidebar */}
                    <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col h-full transform transition-transform">
                        {/* header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="font-extrabold text-gray-900">Pesanan Meja {tableNum}</h2>
                                <p className="text-xs text-gray-400 mt-0.5">{count} item · {formatCurrency(total)}</p>
                            </div>
                            <button onClick={() => setShowCart(false)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
                                <X size={18} />
                            </button>
                        </div>

                        {/* items */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                            {cartItems.map(({ menuItem, quantity }) => (
                                <div key={menuItem._id} className="flex items-center gap-3">
                                    <div className="w-12 h-12 relative rounded-xl overflow-hidden shrink-0 bg-gray-100">
                                        <Image src={getImageUrl(menuItem.image)} alt={menuItem.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{menuItem.name}</p>
                                        <p className="text-xs text-gray-400">{formatCurrency(menuItem.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button onClick={() => updateQuantity(menuItem._id, quantity - 1)}
                                            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50 transition-colors">
                                            <Minus size={11} className="text-gray-600" />
                                        </button>
                                        <span className="w-6 text-center font-bold text-sm text-gray-800">{quantity}</span>
                                        <button onClick={() => updateQuantity(menuItem._id, quantity + 1)}
                                            className="w-7 h-7 rounded-full bg-[#C1121F] text-white flex items-center justify-center hover:bg-[#a50f1a] transition-colors">
                                            <Plus size={11} />
                                        </button>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 w-16 text-right shrink-0">
                                        {formatCurrency(menuItem.price * quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* footer */}
                        <div className="px-5 pt-4 pb-8 border-t border-gray-100 space-y-3">
                            {/* total */}
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Total Pembayaran</span>
                                <span className="text-xl font-extrabold text-[#C1121F]">{formatCurrency(total)}</span>
                            </div>

                            {/* checkout button */}
                            <button
                                onClick={handleCheckout}
                                className="w-full py-4 bg-[#C1121F] text-white rounded-2xl font-bold hover:bg-[#a50f1a] transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 hover:scale-[1.01]">
                                <CheckCircle size={18} /> Lanjut ke Checkout
                            </button>
                            <p className="text-center text-xs text-gray-400">Pilih metode bayar di halaman berikutnya</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

/* ─────────────────────────────────────────────────────── */

export default function DineInPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-[#C1121F] rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Memuat menu...</p>
                </div>
            </div>
        }>
            <DineInContent />
        </Suspense>
    );
}
