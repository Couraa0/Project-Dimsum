'use client';
import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import type { User } from '@/types';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Trash2, UserCog, Mail } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import Image from 'next/image';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await usersApi.getAll();
            setUsers(data.data);
        } catch (err) {
            toast.error('Gagal memuat daftar pengguna');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleRoleChange = async (id: string, name: string, role: string) => {
        const res = await Swal.fire({ 
            title: 'Ubah Role?', 
            text: `Ubah peran "${name}" menjadi ${role.toUpperCase()}?`, 
            icon: 'question', 
            showCancelButton: true, 
            confirmButtonColor: '#C1121F', 
            confirmButtonText: 'Ya, Ubah!', 
            cancelButtonText: 'Batal' 
        });
        if (!res.isConfirmed) return;
        
        try {
            await usersApi.updateRole(id, role);
            Swal.fire({ title: 'Diperbarui!', text: 'Role berhasil diubah.', icon: 'success', timer: 1500, showConfirmButton: false });
            load();
        } catch (err: any) {
            Swal.fire('Gagal!', err.response?.data?.message || 'Gagal mengubah role', 'error');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const res = await Swal.fire({ 
            title: 'Hapus Pengguna?', 
            text: `Yakin ingin menghapus pengguna "${name}"?`, 
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#C1121F', 
            confirmButtonText: 'Ya, Hapus!', 
            cancelButtonText: 'Batal' 
        });
        if (!res.isConfirmed) return;
        
        try {
            await usersApi.delete(id);
            Swal.fire({ title: 'Terhapus!', text: 'Pengguna berhasil dihapus.', icon: 'success', timer: 1500, showConfirmButton: false });
            load();
        } catch (err: any) {
            Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus pengguna', 'error');
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola data pelanggan dan peran akses sistem.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['Pengguna', 'Email', 'Role', 'Status', 'Sesi Terakhir', 'Aksi'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? [...Array(3)].map((_, i) => (
                                <tr key={i}><td colSpan={6} className="p-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                            )) : users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-100 text-[#C1121F] flex items-center justify-center font-bold overflow-hidden shrink-0">
                                                {user.avatar ? (
                                                    <Image src={user.avatar} alt={user.name} width={40} height={40} className="object-cover w-full h-full" />
                                                ) : (
                                                    user.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <span className="font-semibold text-gray-800">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <Mail size={14} className="text-gray-400" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hover:cursor-pointer min-w-[120px]">
                                        <select 
                                            value={user.role} 
                                            onChange={(e) => handleRoleChange(user._id, user.name, e.target.value)}
                                            className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 outline-none focus:ring-2 ring-red-100"
                                        >
                                            <option value="user">User</option>
                                            <option value="kasir">Kasir</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.isActive ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {user.lastLogin ? timeAgo(user.lastLogin) : '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleDelete(user._id, user.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        <UserCog size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p>Belum ada pengguna terdaftar.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
