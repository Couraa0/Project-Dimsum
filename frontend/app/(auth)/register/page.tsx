'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const setAuth = useAuthStore(s => s.setAuth);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await authApi.register({ name, email, password });
            setAuth(data.user, data.token);
            toast.success('Pendaftaran berhasil!');
            router.push('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal mendaftar');
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
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Buat Akun Baru ✨</h1>
                <p className="text-center text-gray-500 text-sm mb-6">Bergabung dan nikmati kemudahan memesan Dimsum Ratu</p>
                
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Nama Lengkap</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-sm focus:ring-2 focus:ring-red-100 transition-all font-medium text-gray-700 outline-none" placeholder="Budi Santoso" required />
                    </div>
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
                        {loading ? 'Mendaftarkan...' : 'Daftar sekarang'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="text-[#C1121F] font-semibold hover:underline">
                        Masuk disini
                    </Link>
                </p>
            </div>
        </div>
    );
}
