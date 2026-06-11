import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Phone, Instagram, Facebook, Mail } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';

const TiktokIcon = ({ size = 15 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
        <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
    </svg>
);


export default function Footer() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const settings = useSettingsStore(s => s.settings);
    const logoUrl = (mounted && settings?.logo) ? settings.logo : '/logo.png';
    const storeName = (mounted && settings?.storeName) ? settings.storeName : 'Dimsum Ratu';
    const address = (mounted && settings?.address) ? settings.address : 'Jl. Raya Karawang No. 88, Karawang Barat, Jawa Barat';
    const operatingHours = (mounted && settings?.operatingHours) ? settings.operatingHours : 'Setiap Hari: 10.00 – 21.00 WIB';
    const contact = (mounted && settings?.contact) ? settings.contact : '0878-7131-0560';

    return (
        <footer className="bg-gradient-to-br from-[#C1121F] to-[#8b0e16] text-white pt-8 pb-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-white/15">

                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-md ring-2 ring-white/30">
                                <Image src={logoUrl} alt={`${storeName} Logo`} width={40} height={40} className="object-cover" />
                            </div>
                            <div>
                                <div className="font-extrabold text-white text-lg leading-none tracking-tight">{storeName}</div>
                                <div className="text-white/80 text-xs mt-0.5 tracking-widest uppercase">Karawang</div>
                            </div>
                        </div>
                        <p className="text-white/90 text-xs leading-relaxed mb-3 max-w-[260px]">
                            Nikmati cita rasa dimsum autentik terbaik di Karawang. Dibuat dari bahan segar dengan resep tradisional.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-2">
                            {[
                                { icon: <Instagram size={15} />, href: (mounted && settings?.instagramUrl) ? settings.instagramUrl : '#' },
                                { icon: <Facebook size={15} />, href: (mounted && settings?.facebookUrl) ? settings.facebookUrl : '#' },
                                { icon: <TiktokIcon size={15} />, href: (mounted && settings?.tiktokUrl) ? settings.tiktokUrl : '#' },
                            ].map((s, i) => (
                                <a key={i} href={s.href} target={s.href !== '#' ? "_blank" : undefined} rel="noopener noreferrer"
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
                                <span className="text-white/90 leading-relaxed">{address}</span>
                            </li>
                            <li className="flex gap-2.5">
                                <Clock size={14} className="text-white/80 mt-0.5 shrink-0" />
                                <span className="text-white/90">{operatingHours}</span>
                            </li>
                            <li className="flex gap-2.5">
                                <Phone size={14} className="text-white/80 mt-0.5 shrink-0" />
                                <span className="text-white/90">{contact}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-1.5 text-[11px] text-white/40">
                    <p className="text-white/70">© {new Date().getFullYear()} {storeName}. Hak Cipta Dilindungi.</p>
                    <p className="text-white/70">Dibuat dengan 🤍 untuk pelanggan setia kami</p>
                </div>
            </div>
        </footer>
    );
}
