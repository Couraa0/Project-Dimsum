import Link from 'next/link';
import { MapPin, Clock, Phone, Instagram, Facebook, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-14 pb-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-800">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-[#C1121F] rounded-xl flex items-center justify-center text-white text-xl">🥟</div>
                            <div>
                                <div className="font-bold text-white text-xl leading-none">Dimsum Ratu</div>
                                <div className="text-gray-400 text-sm">Karawang</div>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Nikmati cita rasa dimsum autentik terbaik di Karawang. Dibuat dari bahan segar pilihan dengan resep tradisional yang telah terbukti menggugah selera.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-[#C1121F] rounded-lg flex items-center justify-center transition-colors">
                                <Instagram size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-[#C1121F] rounded-lg flex items-center justify-center transition-colors">
                                <Facebook size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-[#C1121F] rounded-lg flex items-center justify-center transition-colors">
                                <Mail size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Navigasi</h4>
                        <ul className="space-y-2 text-sm">
                            {[{ href: '/', label: 'Beranda' }, { href: '/menu', label: 'Menu Kami' }, { href: '/order', label: 'Pesan Sekarang' }, { href: '/admin', label: 'Dashboard Admin' }].map(l => (
                                <li key={l.href}><Link href={l.href} className="hover:text-[#C1121F] transition-colors">{l.label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Info */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Informasi</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex gap-2">
                                <MapPin size={15} className="text-[#C1121F] mt-0.5 shrink-0" />
                                <span>Jl. Raya Karawang No. 88, Karawang Barat, Jawa Barat 41315</span>
                            </li>
                            <li className="flex gap-2">
                                <Clock size={15} className="text-[#C1121F] mt-0.5 shrink-0" />
                                <span>Setiap Hari: 10.00 – 21.00 WIB</span>
                            </li>
                            <li className="flex gap-2">
                                <Phone size={15} className="text-[#C1121F] mt-0.5 shrink-0" />
                                <span>+62 812-3456-7890</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                    <p>© 2024 Dimsum Ratu Karawang. Hak Cipta Dilindungi.</p>
                    <p>Dibuat dengan ❤️ untuk pelanggan setia kami</p>
                </div>
            </div>
        </footer>
    );
}
