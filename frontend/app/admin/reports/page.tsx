'use client';
import { useState, useEffect } from 'react';
import { Download, TrendingUp, ShoppingBag, BarChart2 } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminReportsPage() {
    const [dailyReport, setDailyReport] = useState<any>(null);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(() => {
        const jktTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
        const d = new Date(jktTime);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setLoading(true);
        Promise.all([
            ordersApi.getDailyReport(date),
            ordersApi.getMonthlyReport({ year: selectedYear, month: selectedMonth }),
        ]).then(([dRes, mRes]) => {
            setDailyReport(dRes.data.data);
            const rawData = mRes.data.data;
            const chartData = rawData.map((d: any) => ({
                day: `${d._id.day}/${d._id.month}`,
                orders: d.totalOrders,
                revenue: d.totalRevenue,
            }));
            setMonthlyData(chartData);
        }).finally(() => setLoading(false));
    }, [date, selectedMonth]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    const exportCSV = () => {
        if (!monthlyData.length) return;
        const headers = 'Tanggal,Pesanan,Pendapatan\n';
        const rows = monthlyData.map(d => `${d.day},${d.orders},${d.revenue}`).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `laporan-${selectedYear}-${selectedMonth}.csv`;
        a.href = url; a.click();
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
                    <p className="text-gray-400 text-sm mt-1">Analitik & statistik bisnis</p>
                </div>
                <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* Daily Report */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-gray-900">Laporan Harian</h2>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C1121F]" />
                </div>
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-100 h-24 rounded-xl animate-pulse" />)}
                    </div>
                ) : dailyReport ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {[
                                { label: 'Total Pesanan', value: dailyReport.totalOrders, icon: ShoppingBag, color: 'blue' },
                                { label: 'Pendapatan', value: formatCurrency(dailyReport.totalRevenue), icon: TrendingUp, color: 'green' },
                                { label: 'Dine In', value: dailyReport.byType['dine-in'] || 0, icon: BarChart2, color: 'orange' },
                                { label: 'Delivery', value: dailyReport.byType['delivery'] || 0, icon: ShoppingBag, color: 'purple' },
                            ].map((s, i) => {
                                const Icon = s.icon;
                                const colors: Record<string, string> = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', orange: 'bg-orange-50 text-orange-600', purple: 'bg-purple-50 text-purple-600' };
                                return (
                                    <div key={i} className="bg-gray-50 rounded-2xl p-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colors[s.color]}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="text-xl font-bold text-gray-900">{s.value}</div>
                                        <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Top Items */}
                        {dailyReport.topItems?.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-3">Top 5 Menu Hari Ini</h3>
                                <div className="space-y-2">
                                    {dailyReport.topItems.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                                                <div className="bg-[#C1121F] h-2 rounded-full" style={{ width: `${Math.min(100, (item.totalQty / (dailyReport.topItems[0]?.totalQty || 1)) * 100)}%` }} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 w-40 truncate">{item.name}</span>
                                            <span className="text-sm font-bold text-[#C1121F] w-20 text-right">{item.totalQty} porsi</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : <p className="text-gray-400 text-center py-6">Tidak ada data untuk tanggal ini</p>}
            </div>

            {/* Monthly Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-gray-900">Grafik Bulanan - {selectedYear}</h2>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C1121F] bg-white">
                        {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                </div>
                {monthlyData.length > 0 ? (
                    <>
                        <div className="mb-8">
                            <p className="text-sm text-gray-500 font-medium mb-3">Jumlah Pesanan per Hari</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(val: any) => [val, 'Pesanan']} />
                                    <Bar dataKey="orders" fill="#C1121F" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-3">Pendapatan Harian (Rp)</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(val: any) => [formatCurrency(val), 'Revenue']} />
                                    <Line type="monotone" dataKey="revenue" stroke="#C1121F" strokeWidth={2} dot={{ fill: '#C1121F', r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-400 py-12">
                        <BarChart2 size={40} className="mx-auto mb-2 opacity-30" />
                        <p>Tidak ada data bulan ini</p>
                    </div>
                )}
            </div>
        </div>
    );
}
