'use client';
import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, X } from 'lucide-react';
import { menuApi, categoriesApi } from '@/lib/api';
import type { MenuItem, Category } from '@/types';
import MenuCard from '@/components/ui/MenuCard';
import CartSidebar from '@/components/ui/CartSidebar';
import { useCartStore } from '@/store/cartStore';

export default function MenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCart, setShowCart] = useState(false);
    const [mounted, setMounted] = useState(false);
    const count = useCartStore(s => s.getCount());
    const total = useCartStore(s => s.getTotal());
    const formatCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    useEffect(() => {
        setMounted(true);
        categoriesApi.getAll().then(res => setCategories(res.data.data));
    }, []);

    useEffect(() => {
        setLoading(true);
        const params: Record<string, string> = {};
        if (selectedCategories.length > 0) params.category = selectedCategories.join(',');
        if (search) params.search = search;
        menuApi.getAll(params)
            .then(res => setItems(res.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedCategories, search]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header */}
            <div className="bg-white border-b border-gray-100 pt-6 pb-8 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <span className="text-[#C1121F] font-semibold text-xs tracking-widest uppercase">Pilihan Lengkap</span>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-1 tracking-tight">Menu Kami</h1>
                    <p className="text-gray-400 mt-1 text-sm">Pilih dari berbagai varian dimsum lezat pilihan</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">

                {/* Search */}
                <div className="relative mb-5">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari menu..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#C1121F] focus:ring-2 focus:ring-red-100 transition-all text-sm bg-white shadow-sm"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
                    <button
                        onClick={() => setSelectedCategories([])}
                        className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${selectedCategories.length === 0 ? 'bg-[#C1121F] text-white shadow-red-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        🍽️ Semua
                    </button>
                    {categories.map(cat => {
                        const isActive = selectedCategories.includes(cat._id);
                        return (
                            <button
                                key={cat._id}
                                onClick={() => {
                                    setSelectedCategories(prev => 
                                        isActive ? prev.filter(id => id !== cat._id) : [...prev, cat._id]
                                    );
                                }}
                                className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${isActive ? 'bg-[#C1121F] text-white shadow-red-sm border-[#C1121F]' : 'bg-white border border-gray-100 text-gray-600 hover:border-[#C1121F]/30'}`}
                            >
                                {cat.icon} {cat.name}
                            </button>
                        );
                    })}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />)}
                    </div>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {items.map(item => <MenuCard key={item._id} item={item} />)}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <div className="text-5xl mb-3">🔍</div>
                        <p className="font-medium">Menu tidak ditemukan</p>
                        <p className="text-sm mt-1">Coba kata kunci lain</p>
                    </div>
                )}

                {/* Floating Cart Button */}
                {mounted && count > 0 && (
                    <button
                        onClick={() => setShowCart(true)}
                        className="fixed bottom-6 right-6 bg-[#C1121F] text-white rounded-2xl px-6 py-4 shadow-red flex items-center gap-3 hover:bg-[#a50f1a] transition-all hover:scale-105 z-40"
                    >
                        <div className="relative">
                            <ShoppingCart size={20} />
                            <span className="absolute -top-2 -right-2 bg-white text-[#C1121F] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{count}</span>
                        </div>
                        <div>
                            <div className="text-xs opacity-80">{count} item</div>
                            <div className="font-bold text-sm">{formatCurrency(total)}</div>
                        </div>
                    </button>
                )}

                {/* Cart Drawer */}
                {showCart && (
                    <div className="fixed inset-0 z-50 flex">
                        <div className="flex-1 bg-black/40" onClick={() => setShowCart(false)} />
                        <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <h2 className="font-bold text-gray-800 text-lg">Keranjang</h2>
                                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <CartSidebar onClose={() => setShowCart(false)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
