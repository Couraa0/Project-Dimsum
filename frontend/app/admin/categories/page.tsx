'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { categoriesApi } from '@/lib/api';
import type { Category } from '@/types';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

interface CategoryForm {
    name: string;
    icon: string;
    description: string;
    order: number;
}

const defaultForm: CategoryForm = {
    name: '',
    icon: '🥟',
    description: '',
    order: 0,
};

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<CategoryForm>(defaultForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const res = await categoriesApi.getAllAdmin();
            setCategories(res.data.data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal memuat kategori');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setForm(defaultForm);
        setEditId(null);
        setShowModal(true);
    };

    const openEdit = (cat: Category) => {
        setForm({
            name: cat.name,
            icon: cat.icon,
            description: cat.description || '',
            order: cat.order,
        });
        setEditId(cat._id);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.icon) return toast.error('Nama dan ikon wajib diisi');
        setSaving(true);
        try {
            if (editId) {
                await categoriesApi.update(editId, form);
                toast.success('Kategori diperbarui!');
            } else {
                await categoriesApi.create(form);
                toast.success('Kategori ditambahkan!');
            }
            setShowModal(false);
            load();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const res = await Swal.fire({
            title: 'Hapus Kategori?',
            text: `Yakin ingin menghapus "${name}"? Kategori dengan menu tidak bisa dihapus.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C1121F',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        });

        if (res.isConfirmed) {
            try {
                await categoriesApi.delete(id);
                Swal.fire('Terhapus!', 'Kategori berhasil dihapus.', 'success');
                load();
            } catch (err: any) {
                Swal.fire('Gagal!', err.response?.data?.message || 'Terjadi kesalahan.', 'error');
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kelola Kategori</h1>
                    <p className="text-gray-400 text-sm mt-1">Atur kategori menu dan urutannya</p>
                </div>
                <button 
                    onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#C1121F] text-white rounded-xl font-semibold hover:bg-[#a50f1a] transition-all shadow-red-sm text-sm"
                >
                    <Plus size={16} /> Tambah Kategori
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold text-gray-600">Urutan</th>
                                <th className="px-6 py-4 text-left font-semibold text-gray-600">Ikon</th>
                                <th className="px-6 py-4 text-left font-semibold text-gray-600">Nama Kategori</th>
                                <th className="px-6 py-4 text-left font-semibold text-gray-600">Slug</th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-50 rounded animate-pulse" /></td></tr>
                                ))
                            ) : categories.map((cat) => (
                                <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-400">#{cat.order}</td>
                                    <td className="px-6 py-4 text-2xl">{cat.icon}</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{cat.name}</td>
                                    <td className="px-6 py-4 text-gray-400 lowercase">{cat.slug}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEdit(cat)} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(cat._id, cat.name)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && categories.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Belum ada kategori</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hint */}
            <div className="mt-4 flex items-start gap-2 text-xs text-gray-400 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <AlertCircle size={14} className="text-blue-400 mt-0.5" />
                <p>Urutan angka yang lebih kecil akan muncul lebih awal di halaman menu dan dashboard kasir.</p>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-scale-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800">{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Nama Kategori *</label>
                                <input 
                                    type="text" 
                                    value={form.name} 
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C1121F] focus:ring-2 focus:ring-red-100 transition-all"
                                    placeholder="cth: Dimsum Kukus"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Ikon (Emoji) *</label>
                                    <input 
                                        type="text" 
                                        value={form.icon} 
                                        onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C1121F] text-center text-2xl"
                                        placeholder="🥟"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Urutan</label>
                                    <input 
                                        type="number" 
                                        value={form.order} 
                                        onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C1121F]"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Deskripsi</label>
                                <textarea 
                                    rows={3}
                                    value={form.description} 
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C1121F] resize-none"
                                    placeholder="Penjelasan singkat kategori..."
                                />
                            </div>
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-4 bg-[#C1121F] text-white rounded-xl font-bold hover:bg-[#a50f1a] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Simpan Kategori'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
