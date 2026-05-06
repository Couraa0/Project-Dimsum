'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const setAuth = useAuthStore(s => s.setAuth);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await authApi.login(email, password);
            setAuth(data.user, data.token);
            toast.success('Login berhasil!');
            if (['admin', 'kasir'].includes(data.user.role)) {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login gagal, periksa kredensial Anda');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        if (!credentialResponse.credential) return toast.error('Google token tidak valid');
        setLoading(true);
        try {
            const { data } = await authApi.googleLogin(credentialResponse.credential);
            setAuth(data.user, data.token);
            toast.success('Login Google berhasil!');
            if (['admin', 'kasir'].includes(data.user.role)) {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal login dari Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-red-100 max-w-md w-full border border-red-50">
                <div className="flex justify-center mb-6">
                    <Link href="/" className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-red-50 flex items-center justify-center">
                        <Image src="/logo.png" alt="Logo" width={64} height={64} className="object-cover" />
                    </Link>
                </div>
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Selamat Datang 👋</h1>
                <p className="text-center text-gray-500 text-sm mb-6">Silakan masuk ke akun Dimsum Ratu Anda</p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-sm focus:ring-2 focus:ring-red-100 transition-all font-medium text-gray-700 outline-none" placeholder="anda@email.com" required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-sm focus:ring-2 focus:ring-red-100 transition-all font-medium text-gray-700 outline-none" placeholder="••••••••" required />
                    </div>
                    
                    <button type="submit" disabled={loading}
                        className="w-full py-3.5 bg-[#C1121F] text-white rounded-xl font-bold hover:bg-[#a50f1a] transition-colors disabled:opacity-50 mt-2 shadow-sm shadow-red-200">
                        {loading ? 'Masuk...' : 'Masuk sekarang'}
                    </button>
                </form>

                <div className="mt-5 flex items-center">
                    <div className="flex-1 border-t border-gray-100"></div>
                    <span className="px-3 text-xs text-gray-400 font-medium tracking-wide">ATAU</span>
                    <div className="flex-1 border-t border-gray-100"></div>
                </div>

                <div className="mt-5 flex justify-center w-full">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error('Gagal terhubung dengan Google')}
                        shape="rectangular"
                        size="large"
                        theme="outline"
                        text="continue_with"
                        width="300"
                    />
                </div>
                
                <p className="mt-6 text-center text-sm text-gray-500">
                    Belum punya akun?{' '}
                    <Link href="/register" className="text-[#C1121F] font-semibold hover:underline">
                        Daftar disini
                    </Link>
                </p>
            </div>
        </div>
    );
}
