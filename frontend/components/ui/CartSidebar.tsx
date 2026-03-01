'use client';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency, getImageUrl } from '@/lib/utils';

export default function CartSidebar({ onClose }: { onClose?: () => void }) {
    const { items, updateQuantity, removeItem, getTotal } = useCartStore();

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <div className="text-5xl mb-3">🛒</div>
                        <p className="font-medium">Keranjang kosong</p>
                        <p className="text-sm mt-1">Tambahkan menu favorit Anda</p>
                    </div>
                ) : (
                    items.map(({ menuItem, quantity }) => (
                        <div key={menuItem._id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                            <div className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0 bg-gray-200">
                                <Image src={getImageUrl(menuItem.image)} alt={menuItem.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{menuItem.name}</p>
                                <p className="text-[#C1121F] font-bold text-sm mt-1">{formatCurrency(menuItem.price)}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <button onClick={() => updateQuantity(menuItem._id, quantity - 1)} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-red-100 transition-colors">
                                        <Minus size={12} />
                                    </button>
                                    <span className="w-5 text-center text-sm font-semibold">{quantity}</span>
                                    <button onClick={() => updateQuantity(menuItem._id, quantity + 1)} className="w-6 h-6 rounded-full bg-[#C1121F] text-white flex items-center justify-center hover:bg-[#a50f1a] transition-colors">
                                        <Plus size={12} />
                                    </button>
                                    <button onClick={() => removeItem(menuItem._id)} className="ml-auto text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {items.length > 0 && (
                <div className="p-4 border-t border-gray-100">
                    <div className="flex justify-between mb-4">
                        <span className="text-gray-600 font-medium">Total</span>
                        <span className="font-bold text-[#C1121F] text-lg">{formatCurrency(getTotal())}</span>
                    </div>
                    <a href="/cart" className="block w-full py-3 bg-[#C1121F] text-white text-center rounded-xl font-semibold hover:bg-[#a50f1a] transition-colors shadow-md shadow-red-200">
                        Lanjut ke Keranjang →
                    </a>
                </div>
            )}
        </div>
    );
}
