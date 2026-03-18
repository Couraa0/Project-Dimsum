export const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export const getImageUrl = (path: string): string => {
    if (!path) return '/images/food-placeholder.png';
    if (path.startsWith('http')) return path;
    if (path.startsWith('data:image')) return path;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${path}`;
};

export const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-blue-100 text-blue-700',
        preparing: 'bg-orange-100 text-orange-700',
        ready: 'bg-green-100 text-green-700',
        delivered: 'bg-gray-100 text-gray-700',
        cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
};

export const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
        pending: 'Menunggu',
        confirmed: 'Dikonfirmasi',
        preparing: 'Diproses',
        ready: 'Siap',
        delivered: 'Selesai',
        cancelled: 'Dibatalkan',
    };
    return map[status] || status;
};

export const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
        'dine-in': 'Dine In',
        'takeaway': 'Take Away',
        'delivery': 'Delivery',
    };
    return map[type] || type;
};

export const timeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} detik lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};
