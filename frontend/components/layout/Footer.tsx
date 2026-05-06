import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Phone, Instagram, Facebook, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-[#C1121F] to-[#8b0e16] text-white pt-8 pb-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-white/15">

                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-md ring-2 ring-white/30">
                                <Image src="/logo.png" alt="Dimsum Ratu Logo" width={40} height={40} className="object-cover" />
                            </div>
                            <div>
                                <div className="font-extrabold text-white text-lg leading-none tracking-tight">Dimsum Ratu</div>
                                <div className="text-white/80 text-xs mt-0.5 tracking-widest uppercase">Karawang</div>
                            </div>
                        </div>
                        <p className="text-white/90 text-xs leading-relaxed mb-3 max-w-[260px]">
                            Nikmati cita rasa dimsum autentik terbaik di Karawang. Dibuat dari bahan segar dengan resep tradisional.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-2">
                            {[
                                { icon: <Instagram size={15} />, href: '#' },
                                { icon: <Facebook size={15} />, href: '#' },
                                { icon: <Mail size={15} />, href: '#' },
                            ].map((s, i) => (
                                <a key={i} href={s.href}
                                    className="w-9 h-9 bg-white/10 hover:bg-white/25 border border-white/20 rounded-xl flex items-center justify-center transition-all hover:scale-110">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-white font-bold mb-3 text-xs tracking-wide">Navigasi</h4>
                        <ul className="space-y-2 text-xs">
                            {[
                                { href: '/', label: 'Beranda' },
                                { href: '/menu', label: 'Menu Kami' },
                                { href: '/menu', label: 'Pesan Sekarang' },
                                { href: '/admin', label: 'Dashboard Admin' },
                            ].map(l => (
                                <li key={l.label}>
                                    <Link href={l.href}
                                        className="text-white/85 hover:text-white transition-colors hover:translate-x-1 inline-block">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Info */}
                    <div>
                        <h4 className="text-white font-bold mb-3 text-xs tracking-wide">Informasi</h4>
                        <ul className="space-y-2.5 text-xs">
                            <li className="flex gap-2.5">
                                <MapPin size={14} className="text-white/80 mt-0.5 shrink-0" />
                                <span className="text-white/90 leading-relaxed">Jl. Raya Karawang No. 88, Karawang Barat, Jawa Barat</span>
                            </li>
                            <li className="flex gap-2.5">
                                <Clock size={14} className="text-white/80 mt-0.5 shrink-0" />
                                <span className="text-white/90">Setiap Hari: 10.00 – 21.00 WIB</span>
                            </li>
                            <li className="flex gap-2.5">
                                <Phone size={14} className="text-white/80 mt-0.5 shrink-0" />
                                <span className="text-white/90">+62 878-7131-0560</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-1.5 text-[11px] text-white/40">
                    <p className="text-white/70">© 2026 Dimsum Ratu Karawang. Hak Cipta Dilindungi.</p>
                    <p className="text-white/70">Dibuat dengan 🤍 untuk pelanggan setia kami</p>
                </div>
            </div>
        </footer>
    );
}
