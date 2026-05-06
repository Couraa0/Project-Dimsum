'use client';
import { useState, useEffect } from 'react';
import { Plus, X, Download, RefreshCw, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { tablesApi } from '@/lib/api';
import type { Table } from '@/types';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function AdminTablesPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ number: '', name: '', capacity: '4' });
    const [saving, setSaving] = useState(false);
    const [selectedQR, setSelectedQR] = useState<Table | null>(null);

    const load = () => { setLoading(true); tablesApi.getAll().then(res => setTables(res.data.data)).finally(() => setLoading(false)); };
    useEffect(load, []);

    const handleCreate = async () => {
        if (!form.number) return toast.error('Nomor meja wajib diisi');
        setSaving(true);
        try {
            await tablesApi.create({ number: form.number, name: form.name || `Meja ${form.number}`, capacity: Number(form.capacity), baseUrl: window.location.origin });
            toast.success('Meja berhasil dibuat + QR Code digenerate!');
            setShowModal(false);
            setForm({ number: '', name: '', capacity: '4' });
            load();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal membuat meja');
        } finally { setSaving(false); }
    };

    const handleRegenQR = async (id: string) => {
        try {
            const res = await tablesApi.regenerateQR(id, { baseUrl: window.location.origin });
            toast.success('QR Code berhasil digenerate ulang!');
            setTables(prev => prev.map(t => t._id === id ? res.data.data : t));
            if (selectedQR?._id === id) setSelectedQR(res.data.data);
        } catch { toast.error('Gagal generate QR'); }
    };

    const handleDelete = async (id: string, number: string) => {
        const res = await Swal.fire({ title: 'Hapus Meja?', text: `Yakin ingin menghapus Meja ${number}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#C1121F', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' });
        if (!res.isConfirmed) return;
        try { await tablesApi.delete(id); Swal.fire({ title: 'Terhapus!', text: 'Meja berhasil dihapus.', icon: 'success', timer: 1500, showConfirmButton: false }); load(); }
        catch (err: any) { Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus', 'error'); }
    };

    const downloadQR = (table: Table) => {
        const link = document.createElement('a');
        link.download = `QR-Meja-${table.number}.png`;
        link.href = table.qrCode;
        link.click();
    };

    const statusColor = (s: string) => ({ available: 'bg-green-100 text-green-700', occupied: 'bg-red-100 text-red-600', reserved: 'bg-yellow-100 text-yellow-700' }[s] || 'bg-gray-100');

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Meja & QR Code</h1>
                    <p className="text-gray-400 text-sm mt-1">{tables.length} meja terdaftar</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#C1121F] text-white rounded-xl font-semibold hover:bg-[#a50f1a] transition-colors shadow-red-sm text-sm">
                    <Plus size={16} /> Tambah Meja
                </button>
            </div>

            {/* Tables Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {tables.map(table => (
                        <div key={table._id} className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${table.status === 'occupied' ? 'border-red-200' : 'border-gray-100'}`}>
                            {/* QR Preview */}
                            <div className="bg-gray-50 p-4 flex justify-center cursor-pointer" onClick={() => setSelectedQR(table)}>
                                {table.qrCode ? (
                                    <Image src={table.qrCode} alt={`QR Meja ${table.number}`} width={120} height={120} className="rounded-lg" />
                                ) : (
                                    <div className="w-28 h-28 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">No QR</div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-gray-800">Meja {table.number}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(table.status)}`}>{table.status}</span>
                                </div>
                                <p className="text-xs text-gray-400 mb-3">{table.name} · {table.capacity} orang</p>
                                <div className="flex flex-wrap gap-1.5">
                                    <button onClick={() => downloadQR(table)} className="flex-1 min-w-[60px] py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
                                        <Download size={12} /> Unduh
                                    </button>
                                    <button onClick={() => handleRegenQR(table._id)} className="flex-1 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-1">
                                        <RefreshCw size={12} /> Regen
                                    </button>
                                    <button onClick={() => handleDelete(table._id, table.number)} className="py-2 px-2 bg-red-50 text-red-500 rounded-xl text-xs hover:bg-red-100 transition-colors">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tables.length === 0 && !loading && (
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl">
                    <div className="text-5xl mb-3">📱</div>
                    <p className="font-medium">Belum ada meja</p>
                    <p className="text-sm mt-1">Tambahkan meja untuk generate QR</p>
                </div>
            )}

            {/* QR Fullscreen Modal */}
            {selectedQR && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedQR(null)}>
                    <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">QR Meja {selectedQR.number}</h3>
                            <button onClick={() => setSelectedQR(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
                        </div>
                        {selectedQR.qrCode && <Image src={selectedQR.qrCode} alt="QR" width={250} height={250} className="rounded-2xl mx-auto mb-4 border-4 border-gray-50" />}
                        <p className="text-xs text-gray-400 mb-1 font-mono bg-gray-50 p-2 rounded-lg break-all">
                            {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dinein?meja={selectedQR.number}
                        </p>
                        <p className="text-sm text-gray-500 mb-5">{selectedQR.name} · {selectedQR.capacity} orang</p>
                        <button onClick={() => downloadQR(selectedQR)} className="w-full py-3 bg-[#C1121F] text-white rounded-xl font-semibold hover:bg-[#a50f1a] transition-colors flex items-center justify-center gap-2">
                            <Download size={18} /> Download QR Code
                        </button>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="font-bold text-gray-900">Tambah Meja Baru</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Nomor Meja *', key: 'number', type: 'text', placeholder: 'cth: 01' },
                                { label: 'Nama Meja', key: 'name', type: 'text', placeholder: 'cth: Meja VIP' },
                                { label: 'Kapasitas (orang)', key: 'capacity', type: 'number', placeholder: '4' },
                            ].map(({ label, key, type, placeholder }) => (
                                <div key={key}>
                                    <label className="text-sm font-medium text-gray-600 block mb-1.5">{label}</label>
                                    <input type={type} placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C1121F] text-sm" />
                                </div>
                            ))}
                            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600">
                                📱 QR Code akan otomatis digenerate untuk URL: <strong>/dinein?meja={form.number || 'XX'}</strong>
                            </div>
                            <button onClick={handleCreate} disabled={saving}
                                className="w-full py-3.5 bg-[#C1121F] text-white rounded-xl font-semibold hover:bg-[#a50f1a] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                                {saving ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : '📱 Generate Meja + QR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
