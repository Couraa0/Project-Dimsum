'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const count = useCartStore(s => s.getCount());
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setOpen(false); }, [pathname]);

    const navLinks = [
        { href: '/', label: 'Beranda' },
        { href: '/menu', label: 'Menu' },
        { href: '/track', label: 'Cek Pesanan' },
    ];

    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname.startsWith(href);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/98 backdrop-blur-md shadow-md border-b border-gray-100' : 'bg-white/80 backdrop-blur-sm'}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-sm ring-2 ring-red-100 group-hover:ring-red-300 transition-all">
                        <Image src="/logo.png" alt="Dimsum Ratu Logo" width={36} height={36} className="object-cover" />
                    </div>
                    <div className="leading-tight">
                        <span className="font-extrabold text-[#C1121F] text-base leading-none block tracking-tight">Dimsum</span>
                        <span className="font-bold text-gray-600 text-xs leading-none block tracking-wide uppercase">Ratu</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative ${isActive(link.href)
                                ? 'text-[#C1121F] bg-red-50'
                                : 'text-gray-600 hover:text-[#C1121F] hover:bg-red-50/60'
                                }`}>
                            {link.label}
                            {isActive(link.href) && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#C1121F] rounded-full" />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Cart Button */}
                    <Link href="/cart" className="relative p-2.5 hover:bg-red-50 rounded-xl transition-colors group">
                        <ShoppingCart size={20} className="text-gray-500 group-hover:text-[#C1121F] transition-colors" />
                        {mounted && count > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-[#C1121F] text-white text-[10px] w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center font-bold shadow-sm">
                                {count > 9 ? '9+' : count}
                            </span>
                        )}
                    </Link>

                    {/* Admin Button Desktop */}
                    <Link href="/admin" className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-[#C1121F] text-white rounded-xl text-sm font-semibold hover:bg-[#a50f1a] transition-all shadow-sm shadow-red-200 hover:shadow-red-300 hover:scale-[1.02]">
                        Admin
                    </Link>

                    {/* Hamburger */}
                    <button onClick={() => setOpen(!open)}
                        className="md:hidden p-2.5 hover:bg-red-50 rounded-xl transition-colors text-gray-600"
                        aria-label="Toggle menu">
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1 shadow-lg">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href}
                            className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive(link.href)
                                ? 'bg-red-50 text-[#C1121F]'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-[#C1121F]'
                                }`}>
                            {link.label}
                        </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-2 pt-3">
                        <Link href="/admin"
                            className="flex items-center justify-center px-4 py-3 bg-[#C1121F] text-white rounded-xl font-semibold text-sm hover:bg-[#a50f1a] transition-colors">
                            Dashboard Admin
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
