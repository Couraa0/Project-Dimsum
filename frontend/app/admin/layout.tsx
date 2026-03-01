'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, QrCode, BarChart3, LogOut, Menu, X, ChevronRight, Tag, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Pesanan', icon: ShoppingBag },
    { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
    { href: '/admin/tables', label: 'Meja & QR', icon: QrCode },
    { href: '/admin/reports', label: 'Laporan', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { admin, isAuthenticated, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated && pathname !== '/admin') {
            router.replace('/admin');
        }
    }, [isAuthenticated, pathname]);

    if (pathname === '/admin') return <>{children}</>;
    if (!isAuthenticated) return null;

    const handleLogout = () => {
        logout();
        router.push('/admin');
        toast.success('Berhasil logout');
    };

    const Sidebar = ({ mobile }: { mobile?: boolean }) => (
        <div className={`flex flex-col h-full ${mobile ? '' : ''}`}>
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C1121F] rounded-xl flex items-center justify-center text-xl">🥟</div>
                    <div>
                        <div className="font-bold text-gray-900 leading-none">Dimsum Ratu</div>
                        <div className="text-xs text-gray-400">Admin Panel</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${active ? 'bg-[#C1121F] text-white shadow-red-sm' : 'text-gray-600 hover:bg-red-50 hover:text-[#C1121F]'}`}>
                            <Icon size={18} className={active ? 'text-white' : 'text-gray-400 group-hover:text-[#C1121F]'} />
                            {label}
                            {active && <ChevronRight size={14} className="ml-auto" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-2 mb-3">
                    <div className="w-9 h-9 bg-red-100 text-[#C1121F] rounded-full flex items-center justify-center font-bold text-sm">
                        {admin?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{admin?.name}</div>
                        <div className="text-xs text-gray-400 capitalize">{admin?.role}</div>
                    </div>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 px-2 py-2 w-full hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 shrink-0">
                <Sidebar />
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
                        <div className="w-8 h-8 bg-[#C1121F] rounded-xl flex items-center justify-center text-white text-sm">🥟</div>
                        <span className="font-bold text-gray-800 text-sm">Dimsum Ratu Admin</span>
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
