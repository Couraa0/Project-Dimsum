'use client';
import Image from 'next/image';
import { Plus, Star } from 'lucide-react';
import type { MenuItem } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface MenuCardProps {
    item: MenuItem;
    showAddButton?: boolean;
}

export default function MenuCard({ item, showAddButton = true }: MenuCardProps) {
    const addItem = useCartStore(s => s.addItem);

    const handleAdd = () => {
        addItem(item);
        toast.success(`${item.name} ditambahkan!`, {
            icon: '🥟',
            style: { borderRadius: '12px', background: '#fff', color: '#333' }
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1">
            <div className="relative h-48 bg-gray-50 overflow-hidden">
                <Image
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => (e.currentTarget.src = '/images/food-placeholder.png')}
                />
                {item.isBestSeller && (
                    <div className="absolute top-2 left-2 bg-[#C1121F] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Star size={10} fill="white" /> Best Seller
                    </div>
                )}
                {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold bg-black/60 px-3 py-1 rounded-full text-sm">Habis</span>
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex flex-wrap gap-1 mb-2">
                    {Array.isArray(item.category) ? item.category.map((cat: any) => (
                        <span key={typeof cat === 'object' ? cat._id : cat} className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded-md border border-gray-100">
                            {typeof cat === 'object' ? `${cat.icon} ${cat.name}` : cat}
                        </span>
                    )) : (
                        item.category && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded-md border border-gray-100">
                                {typeof item.category === 'object' ? `${(item.category as any).icon} ${(item.category as any).name}` : item.category}
                            </span>
                        )
                    )}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 text-sm leading-snug">{item.name}</h3>
                <p className="text-gray-400 text-xs mb-3 leading-relaxed line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                    <span className="font-bold text-[#C1121F] text-base">{formatCurrency(item.price)}</span>
                    {showAddButton && (
                        <button
                            onClick={handleAdd}
                            disabled={!item.isAvailable}
                            className="w-8 h-8 bg-[#C1121F] text-white rounded-full flex items-center justify-center hover:bg-[#a50f1a] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-110 shadow-md shadow-red-100"
                        >
                            <Plus size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
