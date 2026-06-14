'use client';
import { useState, useEffect } from 'react';
import { testimonialsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Star, MessageSquare, ArrowLeft, X, Save } from 'lucide-react';
import Link from 'next/link';

interface Testimonial {
    id: string;
    name: string;
    role: string;
    text: string;
    rating: number;
    avatar: string;
}

export default function AdminTestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [text, setText] = useState('');
    const [rating, setRating] = useState(5);
    const [avatar, setAvatar] = useState('👩');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await testimonialsApi.getAll();
            if (res.data && res.data.success) {
                setTestimonials(res.data.data);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal memuat testimoni');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setEditingItem(null);
        setName('');
        setRole('');
        setText('');
        setRating(5);
        setAvatar('👩');
        setShowModal(true);
    };

    const handleOpenEdit = (item: Testimonial) => {
        setEditingItem(item);
        setName(item.name);
        setRole(item.role);
        setText(item.text);
        setRating(item.rating);
        setAvatar(item.avatar);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) return;
        const loadingToast = toast.loading('Menghapus testimoni...');
        try {
            const res = await testimonialsApi.delete(id);
            if (res.data && res.data.success) {
                toast.success('Testimoni berhasil dihapus', { id: loadingToast });
                setTestimonials(prev => prev.filter(t => t.id !== id));
            } else {
                toast.error(res.data.message || 'Gagal menghapus testimoni', { id: loadingToast });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal menghubungi server', { id: loadingToast });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !role.trim() || !text.trim()) {
            return toast.error('Semua data wajib diisi');
        }

        setSaving(true);
        const loadingToast = toast.loading(editingItem ? 'Memperbarui testimoni...' : 'Menambahkan testimoni...');
        try {
            const payload = { name, role, text, rating, avatar };
            if (editingItem) {
                const res = await testimonialsApi.update(editingItem.id, payload);
                if (res.data && res.data.success) {
                    toast.success('Testimoni berhasil diperbarui', { id: loadingToast });
                    setTestimonials(prev => prev.map(t => t.id === editingItem.id ? res.data.data : t));
                    setShowModal(false);
                } else {
                    toast.error(res.data.message || 'Gagal memperbarui testimoni', { id: loadingToast });
                }
            } else {
                const res = await testimonialsApi.create(payload);
                if (res.data && res.data.success) {
                    toast.success('Testimoni berhasil ditambahkan', { id: loadingToast });
                    setTestimonials(prev => [res.data.data, ...prev]);
                    setShowModal(false);
                } else {
                    toast.error(res.data.message || 'Gagal menambahkan testimoni', { id: loadingToast });
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal menghubungi server', { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    const filtered = testimonials.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase()) || 
        t.text.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 w-full animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard" className="p-2.5 bg-white border border-gray-100 hover:bg-gray-50 text-gray-500 rounded-xl transition-all shadow-sm">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Kelola Testimoni</h1>
                        <p className="text-gray-400 text-sm mt-0.5">Atur ulasan dari pelanggan setia yang tampil di beranda utama</p>
                    </div>
                </div>
                <button onClick={handleOpenAdd} className="px-5 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm hover:bg-[var(--color-hover)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-md shadow-[0_4px_12px_rgba(var(--color-rgb),0.1)]">
                    <Plus size={16} /> Tambah Testimoni
                </button>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
                <input 
                    type="text" 
                    placeholder="Cari testimoni berdasarkan nama atau isi ulasan..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-100)] transition-all"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-10 h-10 border-4 border-[var(--color-200)] border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 text-sm">Memuat testimoni...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-16 h-16 bg-[var(--color-50)] text-[var(--color-primary)] rounded-2xl flex items-center justify-center mb-4">
                        <MessageSquare size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Belum ada testimoni</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">Klik tombol "+ Tambah Testimoni" di atas untuk menambahkan ulasan pelanggan pertama Anda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(item => (
                        <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
                            <div>
                                {/* Rating Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(item.rating)].map((_, idx) => (
                                        <Star key={idx} size={14} className="text-yellow-400" fill="#facc15" />
                                    ))}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{item.text}"</p>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[var(--color-50)] rounded-full flex items-center justify-center text-xl ring-2 ring-[var(--color-100)]">
                                        {item.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.name}</h4>
                                        <span className="text-xs text-gray-400 mt-0.5 block">{item.role}</span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenEdit(item)} className="p-2 bg-gray-50 hover:bg-[var(--color-50)] text-gray-500 hover:text-[var(--color-primary)] rounded-xl transition-all" title="Edit">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-gray-50 hover:bg-[var(--color-50)] text-gray-500 hover:text-[var(--color-hover)] rounded-xl transition-all" title="Hapus">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Dialog */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-slide-up">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 bg-gray-50/50">
                            <div>
                                <h3 className="font-extrabold text-gray-900">{editingItem ? 'Edit Testimoni' : 'Tambah Testimoni'}</h3>
                                <p className="text-xs text-gray-400 mt-0.5">{editingItem ? 'Ubah data ulasan pelanggan' : 'Buat ulasan pelanggan baru'}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1.5">Nama Pelanggan *</label>
                                    <input 
                                        type="text" 
                                        placeholder="Contoh: Siti Rahayu"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1.5">Peran / Pekerjaan *</label>
                                    <input 
                                        type="text" 
                                        placeholder="Contoh: Pelanggan Setia"
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1.5">Rating Bintang *</label>
                                    <select 
                                        value={rating}
                                        onChange={e => setRating(parseInt(e.target.value))}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all bg-white"
                                    >
                                        <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                                        <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                                        <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                                        <option value={2}>⭐⭐ (2 Bintang)</option>
                                        <option value={1}>⭐ (1 Bintang)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1.5">Avatar Emoji *</label>
                                    <input 
                                        type="text" 
                                        placeholder="Contoh: 👩 atau 👨"
                                        value={avatar}
                                        onChange={e => setAvatar(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all text-center text-lg"
                                        maxLength={3}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1.5">Isi Ulasan / Testimoni *</label>
                                <textarea 
                                    rows={3}
                                    placeholder="Masukkan ulasan pelanggan..."
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all resize-none"
                                    required
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-bold text-xs transition-all">
                                    Batal
                                </button>
                                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-bold text-xs hover:bg-[var(--color-hover)] transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5 disabled:opacity-60">
                                    <Save size={13} /> {saving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
