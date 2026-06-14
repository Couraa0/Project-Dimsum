'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, QrCode, BarChart3, LogOut, Menu, X, ChevronRight, ChevronLeft, Users, MonitorSmartphone, Layers, Settings, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'react-hot-toast';

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { href: '/admin/pos', label: 'Kasir POS', icon: MonitorSmartphone, roles: ['admin', 'kasir'] },
    { href: '/admin/orders', label: 'Pesanan', icon: ShoppingBag, roles: ['admin', 'kasir'] },
    { href: '/admin/categories', label: 'Kategori', icon: Layers, roles: ['admin'] },
    { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed, roles: ['admin'] },
    { href: '/admin/tables', label: 'Meja & QR', icon: QrCode, roles: ['admin'] },
    { href: '/admin/reports', label: 'Laporan', icon: BarChart3, roles: ['admin'] },
    { href: '/admin/users', label: 'Pengguna', icon: Users, roles: ['admin'] },
    { href: '/admin/testimonials', label: 'Testimoni', icon: MessageSquare, roles: ['admin'] },
    { href: '/admin/settings', label: 'Pengaturan', icon: Settings, roles: ['admin'] },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [mounted, setMounted] = useState(false);

    const settings = useSettingsStore(s => s.settings);
    const fetchSettings = useSettingsStore(s => s.fetchSettings);

    useEffect(() => {
        setMounted(true);
        if (!settings) {
            fetchSettings();
        }
    }, [settings, fetchSettings]);

    const logoUrl = (mounted && settings?.logo) ? settings.logo : '/logo.png';
    const storeName = (mounted && settings?.storeName) ? settings.storeName : 'Dimsum Ratu';

    useEffect(() => {
        if (!isAuthenticated && pathname !== '/admin') {
            router.replace('/login');
        } else if (isAuthenticated && user) {
            if (pathname === '/admin') {
                router.replace(user.role === 'kasir' ? '/admin/pos' : '/admin/dashboard');
            } else if (user.role === 'kasir' && !pathname.startsWith('/admin/orders') && !pathname.startsWith('/admin/pos')) {
                toast.error('Akses ditolak: Hanya untuk Admin');
                router.replace('/admin/pos');
            }
        }
    }, [isAuthenticated, pathname, router, user]);

    if (!mounted || !isAuthenticated) return null;

    const handleLogout = () => {
        logout();
        router.push('/login');
        toast.success('Berhasil logout');
    };

    const Sidebar = ({ mobile, isMinimized, toggleMinimize }: { mobile?: boolean, isMinimized?: boolean, toggleMinimize?: () => void }) => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`border-b border-gray-100 flex ${isMinimized ? 'flex-col items-center justify-center py-4 gap-3' : 'items-center justify-between p-6'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                        <Image src={logoUrl} alt="Logo" width={48} height={48} className="object-cover" />
                    </div>
                    {!isMinimized && (
                        <div>
                            <div className="font-bold text-gray-900 leading-none">{storeName}</div>
                            <div className="text-xs text-gray-400 mt-1">Admin Panel</div>
                        </div>
                    )}
                </div>
                {!mobile && (
                    <button onClick={toggleMinimize} title={isMinimized ? "Perbesar" : "Perkecil"} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors hidden md:flex items-center justify-center">
                        {isMinimized ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className={`flex-1 space-y-1 overflow-y-auto ${isMinimized ? 'p-3' : 'p-4'}`}>
                {navItems.filter(item => user?.role && item.roles.includes(user.role)).map(({ href, label, icon: Icon }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                            title={isMinimized ? label : undefined}
                            className={`flex items-center ${isMinimized ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-xl text-sm font-medium transition-all group ${active ? 'bg-[var(--color-primary)] text-white shadow-red-sm' : 'text-gray-600 hover:bg-[var(--color-50)] hover:text-[var(--color-primary)]'}`}>
                            <Icon size={isMinimized ? 20 : 18} className={active ? 'text-white' : 'text-gray-400 group-hover:text-[var(--color-primary)]'} />
                            {!isMinimized && label}
                            {!isMinimized && active && <ChevronRight size={14} className="ml-auto" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            <div className={`border-t border-gray-100 ${isMinimized ? 'p-3' : 'p-4'}`}>
                <div className={`flex items-center mb-3 ${isMinimized ? 'justify-center' : 'gap-3 px-2'}`}>
                    <div className="w-9 h-9 bg-[var(--color-100)] text-[var(--color-primary)] rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    {!isMinimized && (
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-800 truncate">{user?.name}</div>
                            <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
                        </div>
                    )}
                </div>
                {isMinimized ? (
                    <button onClick={handleLogout} title="Logout" className="flex items-center justify-center w-full text-gray-500 hover:text-[var(--color-primary)] p-2 hover:bg-[var(--color-50)] rounded-xl transition-colors">
                        <LogOut size={20} />
                    </button>
                ) : (
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--color-primary)] px-2 py-2 w-full hover:bg-[var(--color-50)] rounded-xl transition-colors">
                        <LogOut size={16} /> Logout
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col bg-white border-r border-gray-100 shrink-0 transition-all duration-300 ${isMinimized ? 'w-20' : 'w-64'}`}>
                <Sidebar isMinimized={isMinimized} toggleMinimize={() => setIsMinimized(!isMinimized)} />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="bg-black/40 flex-1" onClick={() => setSidebarOpen(false)} />
                    <div className="w-72 bg-white shadow-2xl flex flex-col animate-slide-up">
                        <div className="flex justify-end p-4">
                            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>
                        <Sidebar mobile />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                            <Image src={logoUrl} alt="Logo" width={32} height={32} className="object-cover" />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{storeName} Admin</span>
                    </div>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl">
                        <Menu size={20} />
                    </button>
                </header>
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
