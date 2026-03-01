'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart, Menu, X, MapPin, Phone, Instagram } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const count = useCartStore(s => s.getCount());

    const navLinks = [
        { href: '/', label: 'Beranda' },
        { href: '/menu', label: 'Menu' },
        { href: '/order', label: 'Pesan' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-red-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-[#C1121F] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        🥟
                    </div>
                    <div>
                        <span className="font-bold text-[#C1121F] text-lg leading-none block">Dimsum</span>
                        <span className="font-bold text-gray-700 text-sm leading-none block">Ratu</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} className="text-gray-600 hover:text-[#C1121F] font-medium transition-colors duration-200 relative group">
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C1121F] group-hover:w-full transition-all duration-300 rounded-full" />
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <Link href="/order" className="relative p-2 hover:bg-red-50 rounded-xl transition-colors">
                        <ShoppingCart size={22} className="text-gray-600" />
                        {count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#C1121F] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce">
                                {count}
                            </span>
                        )}
                    </Link>
                    <Link href="/admin" className="hidden md:block px-4 py-2 bg-[#C1121F] text-white rounded-xl text-sm font-semibold hover:bg-[#a50f1a] transition-colors shadow-md shadow-red-200">
                        Admin
                    </Link>
                    <button onClick={() => setOpen(!open)} className="md:hidden p-2 hover:bg-red-50 rounded-xl transition-colors">
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {open && (
                <div className="md:hidden bg-white border-t border-red-50 px-4 py-4 flex flex-col gap-3 shadow-lg">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                            className="text-gray-700 hover:text-[#C1121F] font-medium py-2 border-b border-gray-50 flex items-center gap-2">
                            {link.label}
                        </Link>
                    ))}
                    <Link href="/admin" onClick={() => setOpen(false)}
                        className="mt-2 px-4 py-3 bg-[#C1121F] text-white rounded-xl text-center font-semibold">
                        Dashboard Admin
                    </Link>
                </div>
            )}
        </header>
    );
}
