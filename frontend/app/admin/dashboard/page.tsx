'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, UtensilsCrossed, Clock, CheckCircle, XCircle, BarChart2, Users } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Order, DailyReport } from '@/types';
import Link from 'next/link';

export default function AdminDashboard() {
    const [report, setReport] = useState<DailyReport | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    useEffect(() => {
        Promise.all([
            ordersApi.getDailyReport(),
            ordersApi.getAll({ limit: '3' }),
        ]).then(([reportRes, ordersRes]) => {
            setReport(reportRes.data.data);
            setRecentOrders(ordersRes.data.data);
        }).finally(() => setLoading(false));
    }, []);

    const stats = report ? [
        { label: 'Total Pesanan', value: report.totalOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', change: 'Hari ini' },
        { label: 'Pendapatan', value: formatCurrency(report.totalRevenue), icon: TrendingUp, color: 'bg-green-50 text-green-600', change: 'Lunas' },
        { label: 'Dine In', value: report.byType['dine-in'] || 0, icon: UtensilsCrossed, color: 'bg-orange-50 text-orange-600', change: 'Di tempat' },
        { label: 'Delivery', value: report.byType['delivery'] || 0, icon: Users, color: 'bg-purple-50 text-purple-600', change: 'Diantar' },
    ] : [];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">{today}</p>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                                    <Icon size={20} />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                                <div className="text-xs text-gray-400">{stat.change}</div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-bold text-gray-900">Pesanan Terbaru</h2>
                        <Link href="/admin/orders" className="text-sm text-[#C1121F] font-medium hover:underline">Lihat Semua →</Link>
                    </div>
                    <div className="space-y-3">
                        {recentOrders.slice(0, 3).map(order => (
                            <div key={order._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                    <ShoppingBag size={16} className="text-[#C1121F]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm text-gray-800">{order.orderNumber}</div>
                                    <div className="text-xs text-gray-400">{order.customer.name} · {order.type}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-800">{formatCurrency(order.total)}</div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {recentOrders.length === 0 && (
                            <div className="text-center text-gray-400 py-8">
                                <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Belum ada pesanan hari ini</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 mb-5">Menu Terlaris</h2>
                    <div className="space-y-3">
                        {report?.topItems?.map((item, i) => (
                            <div key={item._id} className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
                                    <div className="text-xs text-gray-400">{item.totalQty} terjual</div>
                                </div>
                                <div className="text-sm font-semibold text-[#C1121F]">{formatCurrency(item.totalRevenue)}</div>
                            </div>
                        ))}
                        {(!report?.topItems || report.topItems.length === 0) && (
                            <div className="text-center text-gray-400 py-4 text-sm">Belum ada data</div>
                        )}
                    </div>
                    <Link href="/admin/reports" className="block mt-6 text-center text-sm text-[#C1121F] font-medium hover:underline">
                        Laporan Lengkap →
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { href: '/admin/orders', label: 'Kelola Pesanan', icon: '📋', color: 'bg-blue-50 border-blue-100' },
                    { href: '/admin/menu', label: 'Tambah Menu', icon: '➕', color: 'bg-green-50 border-green-100' },
                    { href: '/admin/tables', label: 'Generate QR', icon: '📱', color: 'bg-purple-50 border-purple-100' },
                    { href: '/admin/reports', label: 'Lihat Laporan', icon: '📊', color: 'bg-orange-50 border-orange-100' },
                ].map((a, i) => (
                    <Link key={i} href={a.href} className={`${a.color} border rounded-2xl p-4 text-center hover:shadow-md transition-all hover:-translate-y-0.5`}>
                        <div className="text-2xl mb-2">{a.icon}</div>
                        <div className="text-sm font-semibold text-gray-700">{a.label}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
