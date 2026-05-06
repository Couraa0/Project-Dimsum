'use client';
import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, X, Upload, Star, ToggleLeft, ToggleRight } from 'lucide-react';
import Image from 'next/image';
import { menuApi, categoriesApi } from '@/lib/api';
import type { MenuItem, Category } from '@/types';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

interface MenuForm {
    name: string; description: string; price: string; category: string[];
    isBestSeller: boolean; isAvailable: boolean; stock: string; image?: File;
}
const defaultForm: MenuForm = { name: '', description: '', price: '', category: [], isBestSeller: false, isAvailable: true, stock: '100' };

export default function AdminMenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<MenuForm>(defaultForm);
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const load = () => {
        setLoading(true);
        Promise.all([menuApi.getAllAdmin({ search }), categoriesApi.getAllAdmin()])
            .then(([menuRes, catRes]) => { setItems(menuRes.data.data); setCategories(catRes.data.data); })
            .finally(() => setLoading(false));
    };
    useEffect(load, [search]);

    const openCreate = () => { setForm(defaultForm); setPreview(''); setEditId(null); setShowModal(true); };
    const openEdit = (item: MenuItem) => {
        const catIds = Array.isArray(item.category) 
            ? item.category.map((c: any) => typeof c === 'object' ? c._id : c)
            : [typeof item.category === 'object' ? (item.category as any)._id : item.category];
        
        setForm({ 
            name: item.name, 
            description: item.description, 
            price: String(item.price), 
            category: catIds, 
            isBestSeller: item.isBestSeller, 
            isAvailable: item.isAvailable, 
            stock: String(item.stock) 
        });
        setPreview(getImageUrl(item.image));
        setEditId(item._id);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.price || !form.category.length) return toast.error('Nama, harga, dan kategori wajib diisi');
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (k !== 'image' && v !== undefined) fd.append(k, String(v)); });
            if (form.image) fd.append('image', form.image);
            if (editId) await menuApi.update(editId, fd);
            else await menuApi.create(fd);
            toast.success(editId ? 'Menu diperbarui!' : 'Menu ditambahkan!');
            setShowModal(false);
            load();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const res = await Swal.fire({ title: 'Hapus Menu?', text: `Yakin ingin menghapus "${name}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#C1121F', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' });
        if (!res.isConfirmed) return;
        try {
            await menuApi.delete(id);
            Swal.fire({ title: 'Terhapus!', text: 'Menu berhasil dihapus.', icon: 'success', timer: 1500, showConfirmButton: false });
            load();
        } catch (err: any) {
            Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus menu', 'error');
        }
    };

    const handleToggle = async (item: MenuItem, field: 'isAvailable' | 'isBestSeller') => {
        const actionName = field === 'isAvailable' ? 'Ketersediaan' : 'Status Best Seller';
        const res = await Swal.fire({ title: 'Ganti Status?', text: `Ubah ${actionName} untuk "${item.name}"?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#C1121F', confirmButtonText: 'Ya, Ubah!', cancelButtonText: 'Batal' });
        if (!res.isConfirmed) return;
        
        try {
            const fd = new FormData();
            fd.append(field, String(!item[field]));
            await menuApi.update(item._id, fd);
            Swal.fire({ title: 'Diperbarui!', text: `${actionName} berhasil diubah.`, icon: 'success', timer: 1500, showConfirmButton: false });
            load();
        } catch (err: any) {
            Swal.fire('Gagal!', 'Terjadi kesalahan saat menyimpan status.', 'error');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kelola Menu</h1>
                    <p className="text-gray-400 text-sm mt-1">{items.length} item menu</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-[#C1121F] text-white rounded-xl font-semibold hover:bg-[#a50f1a] transition-colors shadow-red-sm text-sm">
                    <Plus size={16} /> Tambah Menu
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Cari menu..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C1121F] text-sm bg-gray-50" />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>{['Menu', 'Kategori', 'Harga', 'Best Seller', 'Tersedia', 'Aksi'].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? [...Array(5)].map((_, i) => (
                                <tr key={i}><td colSpan={6} className="p-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                            )) : items.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                <Image src={getImageUrl(item.image)} alt={item.name} width={40} height={40} className="object-cover w-full h-full" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-800">{item.name}</div>
                                                <div className="text-xs text-gray-400">{item.totalOrdered} terjual</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {Array.isArray(item.category) ? item.category.map((cat: any) => (
                                                <span key={typeof cat === 'object' ? cat._id : cat} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap">
                                                    {typeof cat === 'object' ? `${cat.icon} ${cat.name}` : '-'}
                                                </span>
                                            )) : (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                                    {typeof item.category === 'object' ? `${(item.category as any).icon} ${(item.category as any).name}` : '-'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-[#C1121F]">{formatCurrency(item.price)}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleToggle(item, 'isBestSeller')}>
                                            {item.isBestSeller ? <ToggleRight size={24} className="text-[#C1121F]" /> : <ToggleLeft size={24} className="text-gray-300" />}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleToggle(item, 'isAvailable')}>
                                            {item.isAvailable ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} className="text-gray-300" />}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(item)} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Edit2 size={15} /></button>
                                            <button onClick={() => handleDelete(item._id, item.name)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && items.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <div className="text-4xl mb-2">🍽️</div>
                            <p>Tidak ada menu ditemukan</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center rounded-t-2xl">
                            <h2 className="font-bold text-gray-800">{editId ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-2">Foto Menu</label>
                                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl h-36 flex items-center justify-center cursor-pointer hover:border-[#C1121F] transition-colors overflow-hidden relative">
                                    {preview ? <Image src={preview} alt="preview" fill className="object-cover rounded-xl" /> :
                                        <div className="text-center text-gray-400"><Upload size={24} className="mx-auto mb-2" /><p className="text-sm">Klik untuk upload foto</p></div>}
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) { setForm(f => ({ ...f, image: file })); setPreview(URL.createObjectURL(file)); }
                                }} />
                            </div>
                            {/* Fields */}
                            {[
                                { label: 'Nama Menu *', key: 'name', type: 'text', placeholder: 'cth: Har Gow Udang' },
                                { label: 'Harga *', key: 'price', type: 'number', placeholder: '25000' },
                                { label: 'Stok', key: 'stock', type: 'number', placeholder: '100' },
                            ].map(({ label, key, type, placeholder }) => (
                                <div key={key}>
                                    <label className="text-sm font-medium text-gray-600 block mb-1.5">{label}</label>
                                    <input type={type} placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C1121F] text-sm" />
                                </div>
                            ))}
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1.5">Kategori *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map(c => {
                                        const isChecked = form.category.includes(c._id);
                                        return (
                                            <div 
                                                key={c._id} 
                                                onClick={() => {
                                                    const newCat = isChecked 
                                                        ? form.category.filter(id => id !== c._id)
                                                        : [...form.category, c._id];
                                                    setForm(f => ({ ...f, category: newCat }));
                                                }}
                                                className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer transition-all ${
                                                    isChecked 
                                                    ? 'border-[#C1121F] bg-[#C1121F]/5 text-[#C1121F] font-medium' 
                                                    : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                                }`}
                                            >
                                                <span className="text-lg">{c.icon}</span>
                                                <span className="text-xs truncate">{c.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1.5">Deskripsi</label>
                                <textarea rows={3} placeholder="Deskripsi singkat menu..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C1121F] text-sm resize-none" />
                            </div>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isBestSeller} onChange={e => setForm(f => ({ ...f, isBestSeller: e.target.checked }))} className="accent-[#C1121F]" />
                                    <span className="text-sm font-medium text-gray-600">⭐ Best Seller</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isAvailable} onChange={e => setForm(f => ({ ...f, isAvailable: e.target.checked }))} className="accent-[#C1121F]" />
                                    <span className="text-sm font-medium text-gray-600">✅ Tersedia</span>
                                </label>
                            </div>
                            <button onClick={handleSave} disabled={saving}
                                className="w-full py-3.5 bg-[#C1121F] text-white rounded-xl font-semibold hover:bg-[#a50f1a] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                                {saving ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : editId ? '💾 Simpan Perubahan' : '➕ Tambah Menu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
