'use client';

import { useState, useEffect } from 'react';
import { menuApi, categoriesApi, tablesApi, ordersApi } from '@/lib/api';
import { MenuItem, Category } from '@/types';
import { Search, Plus, Minus, Type, MonitorSmartphone, UtensilsCrossed, Trash2, CheckCircle2, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import Image from 'next/image';

interface CartItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export default function PosPage() {
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [cart, setCart] = useState<CartItem[]>([]);
    const [orderType, setOrderType] = useState('dine-in');
    const [tableNumber, setTableNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [menusRes, catsRes, tablesRes] = await Promise.all([
                menuApi.getAllAdmin(),
                categoriesApi.getAll(),
                tablesApi.getAll()
            ]);
            setMenus(menusRes.data.data.filter((m: MenuItem) => m.isAvailable));
            setCategories(catsRes.data.data.filter((c: Category) => c.isActive));
            setTables(tablesRes.data.data.filter((t: any) => t.status === 'available'));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal memuat data POS');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (menu: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(item => item.menuItemId === menu._id);
            if (existing) {
                return prev.map(item => item.menuItemId === menu._id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { menuItemId: menu._id, name: menu.name, price: menu.price, quantity: 1, image: menu.image }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.menuItemId === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.menuItemId !== id));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.0);
    const total = subtotal + tax;

    const filteredMenus = menus.filter(menu => {
        const cats = Array.isArray(menu.category) ? menu.category : [menu.category];
        const matchCategory = activeCategory === 'all' || 
            cats.some(cat => (typeof cat === 'object' && cat !== null ? cat._id : cat) === activeCategory);
        const matchSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    const handleCheckout = async () => {
        if (cart.length === 0) return toast.error('Keranjang kosong');
        if (orderType === 'dine-in' && !tableNumber) return toast.error('Pilih meja untuk Dine-In');
        if (!customerName.trim()) return toast.error('Nama pelanggan wajib diisi');

        try {
            setIsSubmitting(true);
            const payload = {
                type: orderType,
                items: cart.map(c => ({ menuItemId: c.menuItemId, name: c.name, quantity: c.quantity })),
                paymentMethod,
                tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
                customer: { name: customerName, phone: '-' }
            };

            await ordersApi.create(payload);
            
            Swal.fire({
                icon: 'success',
                title: 'Pesanan Berhasil!',
                text: 'Pesanan telah masuk ke sistem dapur.',
                confirmButtonColor: '#C1121F'
            });

            // Reset
            setCart([]);
            setCustomerName('');
            setTableNumber('');
            setOrderType('dine-in');
            fetchData(); // refresh tables availability
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: error.response?.data?.message || 'Terjadi kesalahan saat memproses pesanan',
                confirmButtonColor: '#C1121F'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-[#C1121F] border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="flex flex-col lg:flex-row h-full">
            {/* Kiri: Katalog */}
            <div className="flex-1 flex flex-col bg-gray-50 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <MonitorSmartphone className="text-[#C1121F]" /> Kasir POS
                        </h1>
                        <p className="text-gray-500 text-sm">Pilih menu untuk pelanggan secara langsung</p>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Cari menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#C1121F] transition-all"
                        />
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === 'all' ? 'bg-[#C1121F] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#C1121F]/30'}`}
                        >
                            Semua Menu
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => setActiveCategory(cat._id)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat._id ? 'bg-[#C1121F] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#C1121F]/30'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {filteredMenus.map(menu => (
                            <div key={menu._id} onClick={() => addToCart(menu)} className="bg-white rounded-2xl p-3 border border-gray-100 hover:shadow-lg hover:border-[#C1121F]/30 cursor-pointer transition-all group">
                                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3 relative">
                                    <Image src={menu.image.startsWith('data:') ? menu.image : `/${menu.image}`} alt={menu.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{menu.name}</h3>
                                        <p className="text-[#C1121F] font-bold text-sm mt-1">Rp {menu.price.toLocaleString('id-ID')}</p>
                                    </div>
                                    <button className="w-8 h-8 rounded-full bg-red-50 text-[#C1121F] flex items-center justify-center shrink-0 group-hover:bg-[#C1121F] group-hover:text-white transition-colors">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredMenus.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500">Menu tidak ditemukan</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Kanan: Keranjang */}
            <div className="w-full lg:w-[400px] bg-white border-l border-gray-200 flex flex-col h-full shrink-0">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                        <UtensilsCrossed size={18} className="text-[#C1121F]" /> Detail Pesanan
                    </h2>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Pemesan</label>
                            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Contoh: Budi" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#C1121F] text-sm" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setOrderType('dine-in')} className={`py-2 rounded-lg text-sm font-medium border ${orderType === 'dine-in' ? 'bg-[#C1121F] text-white border-[#C1121F]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                                Dine-In
                            </button>
                            <button onClick={() => setOrderType('takeaway')} className={`py-2 rounded-lg text-sm font-medium border ${orderType === 'takeaway' ? 'bg-[#C1121F] text-white border-[#C1121F]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                                Takeaway
                            </button>
                            <button onClick={() => setOrderType('delivery')} className={`py-2 rounded-lg text-sm font-medium border col-span-2 ${orderType === 'delivery' ? 'bg-[#C1121F] text-white border-[#C1121F]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                                Delivery
                            </button>
                        </div>

                        {orderType === 'dine-in' && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Nomor Meja</label>
                                <select value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#C1121F] text-sm">
                                    <option value="">Pilih meja kosong</option>
                                    {tables.map(t => (
                                        <option key={t._id} value={t.number}>Meja {t.number} ({t.capacity} kursi)</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <ShoppingCart size={48} className="mb-3 text-gray-200" />
                            <p className="text-sm">Keranjang masih kosong</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.menuItemId} className="flex gap-3 items-center">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                        <Image src={item.image.startsWith('data:') ? item.image : `/${item.image}`} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h4>
                                        <div className="text-[#C1121F] text-sm font-medium">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                        <button onClick={() => updateQuantity(item.menuItemId, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-[#C1121F]">
                                            <Minus size={14} />
                                        </button>
                                        <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.menuItemId, 1)} className="w-6 h-6 flex items-center justify-center bg-[#C1121F] rounded shadow-sm text-white hover:bg-red-700">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.menuItemId)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Metode Pembayaran</label>
                        <div className="flex gap-2">
                            {['cash', 'qris', 'transfer'].map(method => (
                                <button key={method} onClick={() => setPaymentMethod(method)} className={`flex-1 py-2 rounded-lg text-xs font-medium border uppercase ${paymentMethod === method ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal</span>
                            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Pajak (0%)</span>
                            <span>Rp {tax.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-100">
                            <span>Total</span>
                            <span>Rp {total.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isSubmitting}
                        className="w-full py-3.5 bg-[#C1121F] hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                Proses Pesanan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
