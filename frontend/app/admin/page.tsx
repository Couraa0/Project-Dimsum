'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

export default function AdminLoginPage() {
    const router = useRouter();
    const { setAuth, isAuthenticated } = useAuthStore();
    const [email, setEmail] = useState('admin@dimsumratu.com');
    const [password, setPassword] = useState('admin123');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) router.replace('/admin/dashboard');
    }, [isAuthenticated]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.login(email, password);
            setAuth(res.data.admin, res.data.token);
            router.push('/admin/dashboard');
            toast.success(`Selamat datang, ${res.data.admin.name}!`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#C1121F] via-[#a50f1a] to-[#8b0e16] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl overflow-hidden p-2">
                        <Image src="/logo.png" alt="Logo" width={64} height={64} className="object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Dimsum Ratu</h1>
                    <p className="text-white/70 mt-1">Dashboard Admin</p>
                </div>
                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Masuk ke Dashboard</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1.5">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C1121F] focus:ring-2 focus:ring-red-100 text-sm"
                                placeholder="admin@dimsumratu.com" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1.5">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C1121F] focus:ring-2 focus:ring-red-100 text-sm"
                                placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 bg-[#C1121F] text-white rounded-xl font-semibold hover:bg-[#a50f1a] disabled:opacity-60 transition-all shadow-red flex items-center justify-center gap-2 mt-2">
                            {loading ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Masuk'}
                        </button>
                    </form>
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-400 font-medium mb-1">Default Login:</p>
                        <p className="text-xs text-gray-600">📧 admin@dimsumratu.com</p>
                        <p className="text-xs text-gray-600">🔑 admin123</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
